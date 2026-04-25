import random
import string
from datetime import timedelta

from rest_framework import status
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.http import JsonResponse
from django.utils import timezone
from django.db import transaction

from accounts.views import CSRFExemptSessionAuthentication
from experiences.models import Experience
from .models import Booking, BookingItem, SessionGroup, ChatRoom, ChatMessage


PRIVATE_PRICE_MULTIPLIER = 2.5  # 단독 이용 프리미엄
SHARING_LABEL = {
    'private': '단독 이용',
    'friends_only': '지인만 동반',
    'open': '오픈 합석',
}


def _display_name(user):
    if not user:
        return '익명'
    nickname = getattr(user, 'nickname', '') or ''
    if nickname and not nickname.startswith('Guest-'):
        return nickname
    if getattr(user, 'first_name', ''):
        return user.first_name
    if getattr(user, 'email', ''):
        return user.email.split('@')[0]
    return user.username or '익명'


def _public_member_card(user):
    """그룹 멤버 사전공개 카드 — 노골적이지 않게 직군·연령·성별만 노출."""
    if not user:
        return {
            'display_name': '익명', 'gender': 'na', 'age_range': 'na',
            'occupation': '', 'verified': False,
        }
    profile = getattr(user, 'profile', None)
    intake = getattr(user, 'intake', None)
    occupation = ''
    age_range = 'na'
    if intake:
        occupation = intake.occupation or ''
        age_range = intake.age_range or 'na'
    gender = (profile.gender if profile else 'na') or 'na'
    return {
        'display_name': _display_name(user),
        'gender': gender,
        'age_range': age_range,
        'occupation': occupation,
        'verified': bool(getattr(user, 'verified_at', None)),
        'verification_method': getattr(user, 'verification_method', '') or '',
    }


def _assign_session_group(experience, scheduled_at, pax, sharing_mode):
    """매칭 룰:
    1) 신청 인원이 capacity 초과 → 강제 단독 (혼자 빌리는 큰 그룹).
    2) sharing_mode == open 이고 같은 (경험, 날짜) 의 open 그룹에 빈자리 있음 → 합류.
    3) 그 외 → 새 그룹 생성.
    채팅방은 그룹 생성/합류 시점에 보장.
    """
    capacity = max(pax, experience.max_pax or pax)
    scheduled_date = scheduled_at.date()
    forced_private = pax > (experience.max_pax or pax)
    if forced_private:
        effective_mode = 'private'
    elif sharing_mode in ('private', 'friends_only', 'open'):
        effective_mode = sharing_mode
    else:
        effective_mode = 'private'

    group = None
    if effective_mode == 'open':
        candidate = (
            SessionGroup.objects
            .select_for_update()
            .filter(
                experience=experience,
                scheduled_date=scheduled_date,
                sharing_mode='open',
                is_full=False,
            )
            .order_by('created_at')
            .first()
        )
        if candidate and candidate.remaining() >= pax:
            candidate.pax_taken += pax
            candidate.recalc_full()
            candidate.save(update_fields=['pax_taken', 'is_full', 'updated_at'])
            group = candidate

    if group is None:
        group = SessionGroup.objects.create(
            experience=experience,
            scheduled_date=scheduled_date,
            sharing_mode=effective_mode,
            capacity=capacity,
            pax_taken=pax,
            is_full=(pax >= capacity),
        )
        ChatRoom.objects.create(
            session_group=group,
            title=f'{experience.title_ko} · {scheduled_date}',
        )
        # 운영자(마음 큐레이터) 모더레이터 안내
        ChatMessage.objects.create(
            room=group.chat_room,
            kind='system',
            body=(
                '마음 큐레이터가 모더레이터로 함께합니다. '
                '편하게 인사 나누시고, 일정 디테일은 채팅으로 조율해 주세요.'
            ),
        )
        if effective_mode == 'open':
            ChatMessage.objects.create(
                room=group.chat_room,
                kind='system',
                body='이 회차는 오픈 합석으로 진행돼요. 다른 멤버가 합류할 수 있습니다.',
            )
    else:
        ChatMessage.objects.create(
            room=group.chat_room,
            kind='system',
            body=f'새로운 멤버가 합류했어요. (+{pax}명)',
        )
    return group, effective_mode, forced_private


def booking_list(_request):
    return JsonResponse({'results': [], 'note': 'stub'})


@api_view(['POST'])
@authentication_classes([CSRFExemptSessionAuthentication])
@permission_classes([IsAuthenticated])
def create_demo_booking(request):
    """데모용 즉시 예약 생성.
    body: {experience_slug, pax_count?, scheduled_at?, sharing_mode?}
    sharing_mode: 'private' | 'open' (기본 private)
    """
    slug = request.data.get('experience_slug')
    if not slug:
        return Response({'detail': 'experience_slug 필요.'}, status=status.HTTP_400_BAD_REQUEST)
    exp = Experience.objects.filter(slug=slug).first()
    if not exp:
        return Response({'detail': '경험을 찾을 수 없습니다.'}, status=status.HTTP_404_NOT_FOUND)

    pax = max(1, int(request.data.get('pax_count') or 1))
    raw_mode = (request.data.get('sharing_mode') or 'private').strip()
    sharing_mode = raw_mode if raw_mode in ('private', 'friends_only', 'open') else 'private'

    scheduled = request.data.get('scheduled_at')
    if scheduled:
        from django.utils.dateparse import parse_datetime
        scheduled_at = parse_datetime(scheduled) or (timezone.now() + timedelta(days=14))
    else:
        scheduled_at = timezone.now() + timedelta(days=14)

    suffix = ''.join(random.choices(string.ascii_uppercase + string.digits, k=4))
    booking_number = f"MAEUM-{timezone.now().strftime('%y%m%d')}-{suffix}"

    unit_price = exp.final_price
    base_subtotal = unit_price * pax
    # 단독(전세) 이용은 회차 자체를 묶기 때문에 프리미엄 적용
    is_private_request = sharing_mode == 'private'
    subtotal = int(round(base_subtotal * PRIVATE_PRICE_MULTIPLIER)) if is_private_request else base_subtotal

    with transaction.atomic():
        group, effective_mode, forced_private = _assign_session_group(
            exp, scheduled_at, pax, sharing_mode
        )
        if forced_private and not is_private_request:
            # 정원 초과로 자동 단독 처리된 경우에도 프리미엄 적용
            subtotal = int(round(base_subtotal * PRIVATE_PRICE_MULTIPLIER))
        booking = Booking.objects.create(
            booking_number=booking_number,
            user=request.user,
            status='confirmed',
            scheduled_at=scheduled_at,
            pax_count=pax,
            total_amount=subtotal,
            special_request=request.data.get('special_request', ''),
            sharing_mode=effective_mode,
            session_group=group,
        )
        BookingItem.objects.create(
            booking=booking,
            experience=exp,
            quantity=pax,
            unit_price=unit_price,
            subtotal=subtotal,
        )
        ChatMessage.objects.create(
            room=group.chat_room,
            kind='system',
            body=f'{_display_name(request.user)} 님이 예약을 확정했습니다.',
        )

    return Response({
        'id': booking.id,
        'booking_number': booking.booking_number,
        'status': booking.status,
        'scheduled_at': booking.scheduled_at.isoformat(),
        'total_amount': booking.total_amount,
        'sharing_mode': booking.sharing_mode,
        'forced_private': forced_private,
        'session_group_id': group.id,
        'chat_room_id': group.chat_room.id,
        'group_pax_taken': group.pax_taken,
        'group_capacity': group.capacity,
    }, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([AllowAny])
def session_availability(request):
    """매칭 가능성 사전 조회. ?experience_slug=&date=YYYY-MM-DD
    응답: {open_groups:[{id, pax_taken, capacity, remaining}...], capacity}
    """
    slug = request.GET.get('experience_slug')
    date = request.GET.get('date')
    if not slug or not date:
        return Response({'detail': 'experience_slug, date 필요.'}, status=400)
    exp = Experience.objects.filter(slug=slug).first()
    if not exp:
        return Response({'detail': '경험 없음.'}, status=404)
    groups = SessionGroup.objects.filter(
        experience=exp,
        scheduled_date=date,
        sharing_mode='open',
        is_full=False,
    )
    return Response({
        'capacity': exp.max_pax,
        'private_multiplier': PRIVATE_PRICE_MULTIPLIER,
        'open_groups': [
            {
                'id': g.id,
                'pax_taken': g.pax_taken,
                'capacity': g.capacity,
                'remaining': g.remaining(),
                'members': [
                    _public_member_card(b.user)
                    for b in g.bookings.select_related(
                        'user', 'user__profile', 'user__intake'
                    )
                ],
            }
            for g in groups
        ],
    })


@api_view(['GET'])
@authentication_classes([CSRFExemptSessionAuthentication])
@permission_classes([IsAuthenticated])
def chat_room_detail(request, booking_id):
    """예약 ID 기준 채팅방 + 멤버 + 최근 메시지."""
    booking = (
        Booking.objects
        .filter(id=booking_id, user=request.user)
        .select_related('session_group__experience', 'session_group__chat_room')
        .first()
    )
    if not booking or not booking.session_group:
        return Response({'detail': '채팅방을 찾을 수 없습니다.'}, status=404)
    group = booking.session_group
    room = group.chat_room
    members_qs = (
        Booking.objects
        .filter(session_group=group)
        .select_related('user')
        .order_by('created_at')
    )
    return Response({
        'room_id': room.id,
        'title': room.title,
        'sharing_mode': group.sharing_mode,
        'sharing_label': SHARING_LABEL.get(group.sharing_mode, group.sharing_mode),
        'pax_taken': group.pax_taken,
        'capacity': group.capacity,
        'experience': {
            'slug': group.experience.slug,
            'title': group.experience.title_ko,
        },
        'scheduled_date': group.scheduled_date.isoformat(),
        'members': [
            {
                'booking_id': b.id,
                'pax': b.pax_count,
                'is_me': b.user_id == request.user.id,
                **_public_member_card(b.user),
            }
            for b in members_qs.select_related('user__profile', 'user__intake')
        ],
    })


@api_view(['GET', 'POST'])
@authentication_classes([CSRFExemptSessionAuthentication])
@permission_classes([IsAuthenticated])
def chat_messages(request, booking_id):
    """채팅 메시지 GET/POST. 폴링 기반.
    GET ?after=<message_id> → after 이후 메시지만 반환.
    POST body: {body}
    """
    booking = (
        Booking.objects
        .filter(id=booking_id, user=request.user)
        .select_related('session_group__chat_room')
        .first()
    )
    if not booking or not booking.session_group:
        return Response({'detail': '채팅방을 찾을 수 없습니다.'}, status=404)
    room = booking.session_group.chat_room

    if request.method == 'POST':
        body = (request.data.get('body') or '').strip()
        if not body:
            return Response({'detail': '내용을 입력해 주세요.'}, status=400)
        if len(body) > 2000:
            return Response({'detail': '메시지가 너무 깁니다 (2000자 이내).'}, status=400)
        msg = ChatMessage.objects.create(
            room=room, user=request.user, kind='user', body=body
        )
        return Response({
            'id': msg.id,
            'kind': msg.kind,
            'body': msg.body,
            'display_name': _display_name(request.user),
            'is_me': True,
            'created_at': msg.created_at.isoformat(),
        }, status=201)

    after = request.GET.get('after')
    qs = room.messages.select_related('user').order_by('created_at')
    if after:
        try:
            qs = qs.filter(id__gt=int(after))
        except ValueError:
            pass
    qs = qs[:200]
    return Response({
        'results': [
            {
                'id': m.id,
                'kind': m.kind,
                'body': m.body,
                'display_name': _display_name(m.user) if m.kind == 'user' else 'system',
                'is_me': bool(m.user_id and m.user_id == request.user.id),
                'created_at': m.created_at.isoformat(),
            }
            for m in qs
        ],
    })


def _mask_identifier(user):
    """이메일 or username을 ab**cd 패턴으로 마스킹 (개인정보 보호)."""
    if not user:
        return 'an**mous'
    base = ''
    if getattr(user, 'email', ''):
        base = user.email.split('@')[0]
    if not base:
        base = getattr(user, 'username', '') or 'anon'
    base = base.lower()
    if len(base) <= 2:
        return base + '**'
    if len(base) <= 4:
        return base[0] + '**' + base[-1]
    return base[:2] + '**' + base[-2:]


@api_view(['GET'])
@permission_classes([AllowAny])
def recent_bookings(_request):
    """
    최근 예약 목록 (소셜 프루프 위젯용). 개인정보 보호를 위해 ID 마스킹.
    confirmed/completed 상태만, 최신 10건.
    """
    qs = (
        Booking.objects.filter(status__in=['confirmed', 'completed', 'in_progress'])
        .select_related('user')
        .prefetch_related('items__experience', 'items__experience__region')
        .order_by('-created_at')[:10]
    )
    data = []
    for b in qs:
        item = b.items.first()
        exp = item.experience if item else None
        data.append({
            'id': b.id,
            'masked_id': _mask_identifier(b.user),
            'experience_title': exp.title_ko if exp else '',
            'experience_slug': exp.slug if exp else '',
            'region_ko': exp.region.name_ko if exp and exp.region else '',
            'created_at': b.created_at.isoformat(),
        })
    return Response({'results': data})
