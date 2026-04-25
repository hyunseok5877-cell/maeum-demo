from rest_framework import status
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.utils import timezone

from accounts.views import CSRFExemptSessionAuthentication
from rest_framework.permissions import IsAuthenticated
from experiences.models import Experience
from .models import PersonalityType, PersonalityTestSession, PersonalityTestAnswer, CurationRequest, Wishlist
from .quiz_data import QUESTIONS, score_answers
from .serializers import QuizResultSerializer, CurationRequestCreateSerializer


@api_view(['GET'])
@permission_classes([AllowAny])
def quiz_questions(_request):
    """프론트가 렌더할 질문·옵션 (가중치는 노출하지 않음)."""
    public = [
        {
            'code': q['code'],
            'text': q['text'],
            'options': [{'code': o['code'], 'label': o['label']} for o in q['options']],
        }
        for q in QUESTIONS
    ]
    return Response({'questions': public})


@api_view(['POST'])
@authentication_classes([CSRFExemptSessionAuthentication])
@permission_classes([AllowAny])
def quiz_submit(request):
    """
    body: { "answers": {"Q1": "luxury", "Q2": "solo", ...}, "opt_in": true|false }
    → 세션·답변 저장 + 결과 유형 계산 → session_token 반환
    로그인된 사용자라면 UserProfile.personality_type 도 자동 갱신.
    """
    answers = request.data.get('answers') or {}
    if len(answers) < len(QUESTIONS):
        return Response({'detail': '모든 문항에 답해주세요.'}, status=status.HTTP_400_BAD_REQUEST)

    type_code = score_answers(answers)
    try:
        ptype = PersonalityType.objects.get(code=type_code)
    except PersonalityType.DoesNotExist:
        ptype = None

    user = request.user if request.user.is_authenticated else None

    session = PersonalityTestSession.objects.create(
        user=user,
        result_type=ptype,
        completed_at=timezone.now(),
        is_opted_in_curation=bool(request.data.get('opt_in', False)),
    )

    answer_objs = []
    q_map = {q['code']: q for q in QUESTIONS}
    for q_code, ans_code in answers.items():
        q = q_map.get(q_code)
        if not q:
            continue
        opt = next((o for o in q['options'] if o['code'] == ans_code), None)
        if not opt:
            continue
        answer_objs.append(PersonalityTestAnswer(
            session=session, question_code=q_code, answer_code=ans_code,
            answer_weight=opt['weights'],
        ))
    PersonalityTestAnswer.objects.bulk_create(answer_objs)

    # 로그인 사용자: UserProfile.personality_type 동기화 → /my 와 /quiz에서 즉시 인식
    if user and ptype:
        from accounts.models import UserProfile
        profile, _ = UserProfile.objects.get_or_create(user=user)
        profile.personality_type = ptype
        profile.save(update_fields=['personality_type'])

    return Response({'session_token': str(session.session_token), 'type': type_code}, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([AllowAny])
def quiz_result(request, token):
    session = get_object_or_404(PersonalityTestSession, session_token=token)
    data = QuizResultSerializer(session, context={'request': request}).data
    return Response(data)


@api_view(['POST'])
@permission_classes([AllowAny])
def curation_request_create(request):
    serializer = CurationRequestCreateSerializer(data=request.data, context={'request': request})
    serializer.is_valid(raise_exception=True)
    obj = serializer.save()
    return Response({'id': obj.id, 'status': obj.status}, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([AllowAny])
def curation_request_list(_request):
    # 인증된 사용자만 자기 문의 조회 (개발편의상 전체 노출 아님)
    return Response({'results': [], 'note': '목록 조회는 회원 기능 — Phase 2'})


# ───────────────────────────────────────────────
# 위시리스트
# ───────────────────────────────────────────────

def _exp_wishlist_dict(exp, request):
    """Wishlist 응답에 들어갈 경험 요약."""
    cover = exp.media.filter(is_cover=True).first() or exp.media.first()
    cover_url = ''
    if cover and cover.file:
        cover_url = request.build_absolute_uri(cover.file.url)
    return {
        'id': exp.id,
        'slug': exp.slug,
        'title_ko': exp.title_ko,
        'subtitle_ko': exp.subtitle_ko,
        'base_price': exp.base_price,
        'final_price': exp.final_price,
        'cover_image': cover_url,
        'region': {
            'code': exp.region.code if exp.region else '',
            'name_ko': exp.region.name_ko if exp.region else '',
        },
        'category': {
            'code': exp.category.code if exp.category else '',
            'name_ko': exp.category.name_ko if exp.category else '',
        },
    }


@api_view(['GET'])
@authentication_classes([CSRFExemptSessionAuthentication])
@permission_classes([IsAuthenticated])
def wishlist_list(request):
    qs = (
        Wishlist.objects
        .filter(user=request.user)
        .select_related('experience', 'experience__region', 'experience__category')
        .prefetch_related('experience__media')
    )
    items = [_exp_wishlist_dict(w.experience, request) for w in qs]
    return Response({'results': items, 'count': len(items)})


@api_view(['POST', 'DELETE'])
@authentication_classes([CSRFExemptSessionAuthentication])
@permission_classes([IsAuthenticated])
def wishlist_toggle(request):
    """body: {experience_id} 또는 {experience_slug}.
    POST: 없으면 추가, 있으면 그대로 둠 → in_wishlist: True
    DELETE: 있으면 삭제, 없으면 그대로 → in_wishlist: False
    """
    exp_id = request.data.get('experience_id')
    exp_slug = request.data.get('experience_slug')
    if exp_id:
        exp = Experience.objects.filter(pk=exp_id).first()
    elif exp_slug:
        exp = Experience.objects.filter(slug=exp_slug).first()
    else:
        return Response({'detail': 'experience_id 또는 experience_slug 필요.'}, status=status.HTTP_400_BAD_REQUEST)
    if not exp:
        return Response({'detail': '경험을 찾을 수 없습니다.'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'POST':
        Wishlist.objects.get_or_create(user=request.user, experience=exp)
        return Response({'in_wishlist': True, 'experience_id': exp.id})
    else:
        Wishlist.objects.filter(user=request.user, experience=exp).delete()
        return Response({'in_wishlist': False, 'experience_id': exp.id})


@api_view(['GET'])
@authentication_classes([CSRFExemptSessionAuthentication])
@permission_classes([IsAuthenticated])
def wishlist_check(request, slug):
    """경험 상세에서 ♡ 초기 상태 확인."""
    exp = Experience.objects.filter(slug=slug).first()
    if not exp:
        return Response({'in_wishlist': False})
    exists = Wishlist.objects.filter(user=request.user, experience=exp).exists()
    return Response({'in_wishlist': exists})
