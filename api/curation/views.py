from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.utils import timezone

from .models import PersonalityType, PersonalityTestSession, PersonalityTestAnswer, CurationRequest
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
@permission_classes([AllowAny])
def quiz_submit(request):
    """
    body: { "answers": {"Q1": "luxury", "Q2": "solo", ...}, "opt_in": true|false }
    → 세션·답변 저장 + 결과 유형 계산 → session_token 반환
    """
    answers = request.data.get('answers') or {}
    if len(answers) < len(QUESTIONS):
        return Response({'detail': '모든 문항에 답해주세요.'}, status=status.HTTP_400_BAD_REQUEST)

    type_code = score_answers(answers)
    try:
        ptype = PersonalityType.objects.get(code=type_code)
    except PersonalityType.DoesNotExist:
        ptype = None

    session = PersonalityTestSession.objects.create(
        user=request.user if request.user.is_authenticated else None,
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
