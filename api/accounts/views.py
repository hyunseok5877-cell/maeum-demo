"""회원·소셜 로그인 API.

현재 단계: MOCK 소셜 로그인 (개발·데모 용).
  - /api/auth/social/mock/  : provider + email + name 받아 User + SocialIdentity 생성·조회, 세션 생성
실제 OAuth 전환 시:
  - /api/auth/google/callback/  : Google OAuth 2.0 토큰 교환 후 User 생성
  - /api/auth/naver/callback/   : Naver OAuth 2.0 토큰 교환 후 User 생성
각각 state·redirect_uri·code 검증 로직을 추가. MOCK 엔드포인트는 DEBUG 에서만 유지.
"""

from django.contrib.auth import login, logout
from django.utils import timezone
from rest_framework import status, serializers
from rest_framework.authentication import SessionAuthentication
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from .models import User, UserProfile, SocialIdentity, MemberIntakeSurvey


class CSRFExemptSessionAuthentication(SessionAuthentication):
    """SessionAuthentication 인데 CSRF 검증만 우회.
    request.user는 정상 식별 (sessionid 쿠키 → user 매핑).
    `authentication_classes([])`는 user를 AnonymousUser로 만들어버려
    nickname_set·submit_intake 등이 실제 로그인된 user에 저장 못 하는 버그를 유발했음.
    """
    def enforce_csrf(self, request):
        return  # noop


class MockSocialLoginSerializer(serializers.Serializer):
    provider = serializers.ChoiceField(choices=['google', 'naver', 'mock'])
    email = serializers.EmailField()
    name = serializers.CharField(max_length=120, required=False, allow_blank=True, default='')
    provider_uid = serializers.CharField(max_length=255, required=False, allow_blank=True)


class UserSerializer(serializers.ModelSerializer):
    has_intake = serializers.SerializerMethodField()
    needs_nickname = serializers.SerializerMethodField()
    avatar_url = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ('id', 'email', 'display_name', 'nickname', 'avatar_url', 'has_intake', 'needs_nickname')

    def get_avatar_url(self, obj: User) -> str:
        if obj.avatar:
            request = self.context.get('request') if hasattr(self, 'context') else None
            url = obj.avatar.url
            if request is not None:
                return request.build_absolute_uri(url)
            return url
        return ''

    def get_needs_nickname(self, obj: User) -> bool:
        return not bool(obj.nickname)

    def get_has_intake(self, obj: User) -> bool:
        try:
            return obj.intake.consent_privacy
        except MemberIntakeSurvey.DoesNotExist:
            return False


class IntakeSurveySerializer(serializers.ModelSerializer):
    preferred_category_codes = serializers.ListField(
        child=serializers.CharField(), required=False, write_only=True
    )

    class Meta:
        model = MemberIntakeSurvey
        fields = (
            'full_name',
            'age_range',
            'residence_city',
            'residence_district',
            'occupation',
            'company',
            'marital_status',
            'annual_income_range',
            'asset_range',
            'budget_per_experience',
            'preferred_months',
            'companion_types',
            'special_occasions',
            'referral_source',
            'referral_detail',
            'consent_privacy',
            'consent_marketing',
            'consent_profiling',
            'preferred_category_codes',
            'completed_at',
        )
        read_only_fields = ('completed_at',)

    def validate_consent_privacy(self, value):
        if not value:
            raise serializers.ValidationError('민감 정보 수집·처리 동의는 필수입니다.')
        return value

    def create_or_update(self, user: User):
        codes = self.validated_data.pop('preferred_category_codes', None)
        defaults = {**self.validated_data, 'completed_at': timezone.now()}
        intake, _ = MemberIntakeSurvey.objects.update_or_create(user=user, defaults=defaults)
        if codes is not None:
            from experiences.models import Category
            intake.preferred_categories.set(list(Category.objects.filter(code__in=codes)))
        return intake


@api_view(['POST'])
@authentication_classes([CSRFExemptSessionAuthentication])  # 세션 식별 유지 + CSRF 우회
@permission_classes([AllowAny])
def mock_social_login(request):
    ser = MockSocialLoginSerializer(data=request.data)
    ser.is_valid(raise_exception=True)
    d = ser.validated_data

    provider = d['provider']
    provider_uid = d.get('provider_uid') or f'{provider}:{d["email"]}'

    identity = SocialIdentity.objects.filter(
        provider=provider, provider_uid=provider_uid
    ).first()

    is_new = False
    if identity:
        user = identity.user
    else:
        user = User.objects.filter(email=d['email']).first()
        if not user:
            user = User.objects.create_user(
                username=f'{provider}_{d["email"]}',
                email=d['email'],
                display_name=d.get('name', '') or d['email'].split('@')[0],
            )
            UserProfile.objects.get_or_create(user=user)
            is_new = True
        SocialIdentity.objects.create(
            user=user,
            provider=provider,
            provider_uid=provider_uid,
            email_at_signup=d['email'],
            raw_name=d.get('name', ''),
        )

    login(request, user)
    return Response({
        'user': UserSerializer(user).data,
        'is_new': is_new,
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me(request):
    return Response(UserSerializer(request.user, context={'request': request}).data)


@api_view(['POST', 'DELETE'])
@authentication_classes([CSRFExemptSessionAuthentication])
@permission_classes([IsAuthenticated])
def avatar_upload(request):
    """프로필 사진 업로드/삭제. multipart/form-data 'avatar' 필드."""
    user = request.user
    if request.method == 'DELETE':
        if user.avatar:
            user.avatar.delete(save=False)
        user.avatar = None
        user.save(update_fields=['avatar'])
        return Response({'ok': True, 'user': UserSerializer(user, context={'request': request}).data})

    file = request.FILES.get('avatar')
    if not file:
        return Response({'detail': '이미지 파일이 필요합니다.'}, status=status.HTTP_400_BAD_REQUEST)
    # 5MB 제한
    if file.size > 5 * 1024 * 1024:
        return Response({'detail': '이미지는 5MB 이하만 가능합니다.'}, status=status.HTTP_400_BAD_REQUEST)
    # 타입 검사
    ctype = (file.content_type or '').lower()
    if not ctype.startswith('image/'):
        return Response({'detail': '이미지 파일만 업로드 가능합니다.'}, status=status.HTTP_400_BAD_REQUEST)

    # 기존 파일 정리
    if user.avatar:
        user.avatar.delete(save=False)
    user.avatar = file
    user.save(update_fields=['avatar'])
    return Response({'ok': True, 'user': UserSerializer(user, context={'request': request}).data})


@api_view(['POST'])
@authentication_classes([CSRFExemptSessionAuthentication])
@permission_classes([AllowAny])
def submit_intake(request):
    """인테이크 저장. 세션 없으면 body.nickname 으로 User 찾거나 즉석 생성 (임시 개방)."""
    import random
    import string

    if request.user.is_authenticated:
        user = request.user
    else:
        nick = _normalize_nickname(request.data.get('nickname', ''))
        user = None
        if nick:
            user = User.objects.filter(nickname__iexact=nick).first()
        if user is None:
            seed = ''.join(random.choices(string.ascii_lowercase + string.digits, k=6))
            user = User.objects.create_user(
                username=f'auto_{seed}',
                email=f'auto-{seed}@maeum.local',
                display_name=nick or f'Guest-{seed}',
                nickname=nick or '',
            )
            UserProfile.objects.get_or_create(user=user)
        login(request, user)

    ser = IntakeSurveySerializer(data=request.data)
    ser.is_valid(raise_exception=True)
    intake = ser.create_or_update(user)
    return Response(IntakeSurveySerializer(intake).data, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@authentication_classes([CSRFExemptSessionAuthentication])
@permission_classes([AllowAny])
def logout_view(request):
    logout(request)
    return Response({'ok': True})


# ───────────────────────────────────────────────
# 닉네임
# ───────────────────────────────────────────────

import re as _re

_NICK_RE = _re.compile(r'^[A-Za-z0-9가-힣_.]{2,24}$')


def _normalize_nickname(raw: str) -> str:
    return (raw or '').strip()


def _validate_nickname_format(nick: str) -> str | None:
    if not nick:
        return '닉네임을 입력해 주세요.'
    if not _NICK_RE.match(nick):
        return '영문·한글·숫자·_·. 만, 2~24자 입력 가능합니다.'
    if nick.lower() in {'admin', 'maeum', 'root', 'support', 'curator', 'system'}:
        return '사용할 수 없는 닉네임입니다.'
    return None


@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def nickname_check(request):
    """닉네임 중복·유효성 검사. GET ?nickname=foo  또는  POST {'nickname': 'foo'}"""
    nick = _normalize_nickname(
        request.query_params.get('nickname') if request.method == 'GET'
        else request.data.get('nickname', '')
    )
    err = _validate_nickname_format(nick)
    if err:
        return Response({'available': False, 'reason': err})
    qs = User.objects.filter(nickname__iexact=nick)
    if request.user.is_authenticated:
        qs = qs.exclude(pk=request.user.pk)
    if qs.exists():
        return Response({'available': False, 'reason': '이미 사용 중인 닉네임입니다.'})
    return Response({'available': True, 'reason': ''})


@api_view(['POST'])
@authentication_classes([CSRFExemptSessionAuthentication])
@permission_classes([AllowAny])
def nickname_set(request):
    """닉네임 저장. 세션이 없으면 즉석 User 생성 + 자동 로그인 (임시 개방)."""
    import random
    import string

    nick = _normalize_nickname(request.data.get('nickname', ''))
    err = _validate_nickname_format(nick)
    if err:
        return Response({'ok': False, 'reason': err}, status=status.HTTP_400_BAD_REQUEST)

    exclude_pk = request.user.pk if request.user.is_authenticated else -1

    # 충돌 시 뒤에 숫자 suffix 자동 부여 — 무조건 성공
    final_nick = nick
    if User.objects.filter(nickname__iexact=final_nick).exclude(pk=exclude_pk).exists():
        for i in range(2, 999):
            candidate = f'{nick}{i}'
            if len(candidate) > 24:
                candidate = f'{nick[:22]}{i}'
            if not User.objects.filter(nickname__iexact=candidate).exclude(pk=exclude_pk).exists():
                final_nick = candidate
                break
    nick = final_nick

    if request.user.is_authenticated:
        user = request.user
    else:
        seed = ''.join(random.choices(string.ascii_lowercase + string.digits, k=6))
        user = User.objects.create_user(
            username=f'auto_{seed}',
            email=f'auto-{seed}@maeum.local',
            display_name=nick,
        )
        UserProfile.objects.get_or_create(user=user)
        SocialIdentity.objects.create(
            user=user, provider='mock',
            provider_uid=f'auto:{seed}',
            email_at_signup=user.email, raw_name=nick,
        )
        login(request, user)

    user.nickname = nick
    if not user.display_name:
        user.display_name = nick
    user.save(update_fields=['nickname', 'display_name'])
    return Response({'ok': True, 'user': UserSerializer(user).data})


@api_view(['GET'])
@permission_classes([AllowAny])
def my_profile(request):
    """마이페이지용 통합 응답. 세션 없으면 쿼리 ?nickname= 으로 조회, 그마저 없으면 가장 최근 유저 (임시 개방)."""
    from bookings.models import Booking
    from curation.models import Review

    if request.user.is_authenticated:
        user = request.user
    else:
        nick = (request.query_params.get('nickname') or '').strip()
        user = (
            User.objects.filter(nickname__iexact=nick).first()
            if nick else
            User.objects.order_by('-date_joined').first()
        )
        if user is None:
            return Response({'detail': '유저가 없습니다.'}, status=status.HTTP_404_NOT_FOUND)
        login(request, user)

    # 인테이크
    try:
        intake = user.intake
        intake_data = {
            'full_name': intake.full_name,
            'age_range': intake.get_age_range_display() if intake.age_range != 'na' else '',
            'residence_city': intake.residence_city,
            'residence_district': intake.residence_district,
            'occupation': intake.occupation,
            'marital_status': intake.get_marital_status_display() if intake.marital_status != 'na' else '',
            'preferred_categories': [
                {'code': c.code, 'name_ko': c.name_ko}
                for c in intake.preferred_categories.all()
            ],
        } if intake.consent_privacy else None
    except MemberIntakeSurvey.DoesNotExist:
        intake_data = None

    # 성향 유형 + 마지막 quiz session_token (결과 페이지 직접 이동용)
    personality = None
    last_quiz_token = ''
    try:
        profile = user.profile
        if profile.personality_type:
            pt = profile.personality_type
            personality = {
                'code': pt.code,
                'name_ko': pt.name_ko,
                'name_en': pt.name_en,
                'description': pt.description,
                'image_url': pt.image_url,
            }
            from curation.models import PersonalityTestSession
            last_session = (
                PersonalityTestSession.objects
                .filter(user=user, result_type=pt)
                .order_by('-completed_at')
                .first()
            )
            if last_session:
                last_quiz_token = str(last_session.session_token)
    except Exception:
        pass

    # 최근 예약 (경험 이력)
    bookings_qs = (
        Booking.objects
        .filter(user=user)
        .order_by('-scheduled_at')[:12]
    )
    bookings_data = []
    for b in bookings_qs:
        first_item = b.items.select_related('experience', 'experience__region').first()
        exp = first_item.experience if first_item else None
        sg = b.session_group
        bookings_data.append({
            'id': b.id,
            'booking_number': b.booking_number,
            'status': b.status,
            'scheduled_at': b.scheduled_at.isoformat() if b.scheduled_at else None,
            'pax_count': b.pax_count,
            'sharing_mode': b.sharing_mode,
            'session_group_id': sg.id if sg else None,
            'group_pax_taken': sg.pax_taken if sg else b.pax_count,
            'group_capacity': sg.capacity if sg else b.pax_count,
            'has_chat': bool(sg),
            'experience_slug': exp.slug if exp else None,
            'experience_title': exp.title_ko if exp else '',
            'region_name': exp.region.name_ko if exp and exp.region else '',
            'region_code': exp.region.code if exp and exp.region else '',
            'cover_image': (
                (exp.media.filter(is_cover=True).first() or exp.media.first()).file.url
                if exp and exp.media.exists() and (exp.media.filter(is_cover=True).first() or exp.media.first()).file
                else ''
            ) if exp else '',
        })

    # 통계
    total_exp = bookings_qs.count()
    total_reviews = Review.objects.filter(user=user).count()
    joined_years = (
        (timezone.now() - user.date_joined).days // 365 if user.date_joined else 0
    )

    # 닉네임 — user.nickname이 우선. 없으면 display_name fallback.
    # 단, display_name이 자동 생성된 'Guest-XXXX' 형식이면 미설정으로 간주(빈 문자열).
    if user.nickname:
        nickname = user.nickname
    elif user.display_name and not user.display_name.startswith('Guest-'):
        nickname = user.display_name
    else:
        nickname = ''

    # 방문한 고유 지역
    visited_regions = sorted({b['region_name'] for b in bookings_data if b['region_name']})

    # 뱃지 (플레이스홀더 — 디자인 확정 후 실제 로직으로 교체)
    badges = [
        {
            'code': 'first_experience',
            'name': '첫 경험',
            'description': '마음을 통한 첫 경험 완료',
            'earned': total_exp >= 1,
        },
        {
            'code': 'supercar_rider',
            'name': '스피드 시커',
            'description': '슈퍼카 경험 3회 이상',
            'earned': False,
        },
        {
            'code': 'ocean_voyager',
            'name': '바다의 방랑자',
            'description': '요트 경험 3회 이상',
            'earned': False,
        },
        {
            'code': 'dawn_walker',
            'name': '새벽의 산책자',
            'description': '외승·자연 경험 3회 이상',
            'earned': False,
        },
        {
            'code': 'three_regions',
            'name': '삼도 순례자',
            'description': '서울·부산·제주 모두 경험',
            'earned': len({r for r in visited_regions if r in {'서울', '부산', '제주'}}) == 3,
        },
        {
            'code': 'curator_pick',
            'name': '큐레이터의 선택',
            'description': '큐레이터가 직접 추천한 경험 완료',
            'earned': False,
        },
    ]

    avatar_url = ''
    if user.avatar:
        avatar_url = request.build_absolute_uri(user.avatar.url)

    return Response({
        'user': {
            'id': user.id,
            'email': user.email,
            'display_name': user.display_name,
            'nickname': nickname,
            'avatar_url': avatar_url,
            'joined_at': user.date_joined.isoformat() if user.date_joined else None,
            'joined_years': joined_years,
        },
        'intake': intake_data,
        'personality_type': personality,
        'last_quiz_token': last_quiz_token,
        'stats': {
            'total_experiences': total_exp,
            'total_reviews': total_reviews,
            'visited_regions': visited_regions,
        },
        'recent_bookings': bookings_data,
        'badges': badges,
    })
