"""
퀴즈 문항·채점 로직.

차원(dimension) 4개 = 시드된 PersonalityType 코드와 1:1 매핑:
- NOCTURNE_LUXE (N) — 야행성 럭셔리
- DAWN_HEAL (D) — 새벽·힐링
- THRILL_RIDER (T) — 스릴·드라이브
- ROMANCE_ARCHITECT (R) — 로맨스
"""

QUESTIONS = [
    {
        'code': 'Q1',
        'text': '꿈꾸는 하루의 무드는?',
        'options': [
            {'code': 'luxury', 'label': '압도적 럭셔리 (샤넬·에르메스의 감각)', 'weights': {'N': 2}},
            {'code': 'healing', 'label': '프라이빗 힐링 (자연·명상·고요함)', 'weights': {'D': 2}},
            {'code': 'thrill', 'label': '짜릿한 액티비티 (드라이브·익스트림)', 'weights': {'T': 2}},
            {'code': 'romance', 'label': '로맨틱 감성 (프로포즈·기념일)', 'weights': {'R': 2}},
        ],
    },
    {
        'code': 'Q2',
        'text': '누구와 함께하시나요?',
        'options': [
            {'code': 'solo', 'label': '혼자만의 보상', 'weights': {'N': 1, 'D': 1}},
            {'code': 'couple', 'label': '연인과 둘이', 'weights': {'R': 2}},
            {'code': 'group', 'label': '가족 혹은 친구 그룹', 'weights': {'T': 1}},
            {'code': 'business', 'label': '비즈니스 · VIP 접대', 'weights': {'N': 2}},
        ],
    },
    {
        'code': 'Q3',
        'text': '가장 끌리는 시간대는?',
        'options': [
            {'code': 'dawn', 'label': '새벽 · 일출', 'weights': {'D': 2}},
            {'code': 'day', 'label': '한낮의 태양', 'weights': {'T': 1}},
            {'code': 'sunset', 'label': '해질녘 · 선셋', 'weights': {'R': 1, 'N': 1}},
            {'code': 'midnight', 'label': '도시의 심야', 'weights': {'N': 2}},
        ],
    },
    {
        'code': 'Q4',
        'text': '이번 경험에 쓸 수 있는 예산은?',
        'options': [
            {'code': 'b1', 'label': '100만 ~ 300만원', 'weights': {'T': 1}},
            {'code': 'b2', 'label': '300만 ~ 500만원', 'weights': {'R': 1}},
            {'code': 'b3', 'label': '500만 ~ 1,000만원', 'weights': {'N': 1, 'R': 1}},
            {'code': 'b4', 'label': '1,000만원 이상', 'weights': {'N': 2}},
        ],
    },
    {
        'code': 'Q5',
        'text': '당신의 리듬은?',
        'options': [
            {'code': 'calm', 'label': '정적 · 스파 · 다이닝 · 아트', 'weights': {'D': 2, 'N': 1}},
            {'code': 'active', 'label': '동적 · 드라이브 · 요트 · 승마', 'weights': {'T': 2}},
            {'code': 'mix', 'label': '정적과 동적의 균형', 'weights': {'R': 1, 'D': 1}},
            {'code': 'pure_luxe', 'label': '순수 럭셔리 · 단지 머물기만', 'weights': {'N': 2}},
        ],
    },
    {
        'code': 'Q6',
        'text': '선호하는 진입 방식은?',
        'options': [
            {'code': 'verified', 'label': '검증된 정상급 — 익숙하고 확실한 것', 'weights': {'N': 1, 'R': 1}},
            {'code': 'hidden', 'label': '나만 아는 히든 — 남들이 모르는 곳', 'weights': {'T': 1, 'D': 1}},
            {'code': 'celebratory', 'label': '기념 · 축하의 맥락', 'weights': {'R': 2}},
            {'code': 'escape', 'label': '현실 탈출 · 완전한 전환', 'weights': {'D': 1, 'T': 1}},
        ],
    },
]

DIMENSION_TO_TYPE_CODE = {
    'N': 'NOCTURNE_LUXE',
    'D': 'DAWN_HEAL',
    'T': 'THRILL_RIDER',
    'R': 'ROMANCE_ARCHITECT',
}


def score_answers(answers: dict) -> str:
    """
    answers = {'Q1': 'luxury', 'Q2': 'solo', ...}
    → 최고 점수 차원의 PersonalityType.code 반환. 동점이면 Q1의 답변 무드 우선.
    """
    scores = {'N': 0, 'D': 0, 'T': 0, 'R': 0}
    q_map = {q['code']: q for q in QUESTIONS}

    for q_code, ans_code in answers.items():
        q = q_map.get(q_code)
        if not q:
            continue
        opt = next((o for o in q['options'] if o['code'] == ans_code), None)
        if not opt:
            continue
        for dim, w in opt['weights'].items():
            scores[dim] = scores.get(dim, 0) + w

    max_score = max(scores.values()) if scores else 0
    winners = [d for d, s in scores.items() if s == max_score]

    if len(winners) == 1:
        winner = winners[0]
    else:
        # tiebreak: Q1 답변의 첫 번째 가중치 차원 우선
        q1 = q_map.get('Q1')
        q1_ans = answers.get('Q1')
        if q1 and q1_ans:
            opt = next((o for o in q1['options'] if o['code'] == q1_ans), None)
            if opt:
                for dim in opt['weights']:
                    if dim in winners:
                        return DIMENSION_TO_TYPE_CODE[dim]
        winner = winners[0]

    return DIMENSION_TO_TYPE_CODE[winner]
