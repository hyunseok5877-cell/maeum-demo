"""curation — 큐레이션 문의·제안·성향테스트·RAG챗봇·후기·찜."""
import uuid
from django.conf import settings
from django.db import models
from maeum.common import TimestampedModel, money_field


class PersonalityType(TimestampedModel):
    """16유형 결과 마스터."""

    code = models.CharField(max_length=30, unique=True)
    name_ko = models.CharField(max_length=50)
    name_en = models.CharField(max_length=50, blank=True, default='')
    description = models.TextField(blank=True, default='', help_text='한 줄 요약 (배너용)')
    traits = models.JSONField(
        default=list, blank=True,
        help_text='성향 키워드 리스트 (예: ["조용함","섬세함","느린 리듬"])'
    )
    long_description = models.TextField(
        blank=True, default='',
        help_text='"이런 타입의 사람은 … 한 경향이 있습니다" 3~5 문장'
    )
    why_fits = models.TextField(
        blank=True, default='',
        help_text='"그래서 이런 경험이 어울립니다" 3~5 문장'
    )
    recommended_categories = models.JSONField(
        default=list, blank=True,
        help_text='추천 카테고리 코드 리스트 (카드 필터 힌트)'
    )
    avoid_note = models.TextField(
        blank=True, default='',
        help_text='피하면 좋을 경험 유형 (선택)'
    )
    hero_experiences = models.ManyToManyField(
        'experiences.Experience', blank=True, related_name='hero_for_types'
    )
    image_url = models.URLField(blank=True, default='')

    class Meta:
        verbose_name = '성향 유형'
        verbose_name_plural = '성향 유형'

    def __str__(self):
        return f'{self.code} · {self.name_ko}'


class PersonalityTestSession(TimestampedModel):
    """성향 테스트 응시 세션."""

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='test_sessions'
    )
    session_token = models.UUIDField(default=uuid.uuid4, unique=True, db_index=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    result_type = models.ForeignKey(
        PersonalityType, on_delete=models.SET_NULL, null=True, blank=True, related_name='sessions'
    )
    is_opted_in_curation = models.BooleanField(default=False)

    class Meta:
        verbose_name = '성향 테스트 응시'
        verbose_name_plural = '성향 테스트 응시'

    def __str__(self):
        return f'Session {self.session_token}'


class PersonalityTestAnswer(TimestampedModel):
    """문항별 응답."""

    session = models.ForeignKey(PersonalityTestSession, on_delete=models.CASCADE, related_name='answers')
    question_code = models.CharField(max_length=10)
    answer_code = models.CharField(max_length=30)
    answer_weight = models.JSONField(default=dict, blank=True)

    class Meta:
        verbose_name = '성향 테스트 답변'
        verbose_name_plural = '성향 테스트 답변'
        unique_together = [('session', 'question_code')]

    def __str__(self):
        return f'{self.session} Q{self.question_code}={self.answer_code}'


class CurationRequest(TimestampedModel):
    """역제안 큐레이션 문의."""

    STATUS_CHOICES = [
        ('new', '신규'),
        ('assigned', '배정'),
        ('proposed', '제안발송'),
        ('booked', '예약완료'),
        ('declined', '거절'),
        ('closed', '종결'),
    ]
    OCCASION_CHOICES = [
        ('birthday', '생일'),
        ('anniversary', '기념일'),
        ('proposal', '프로포즈'),
        ('business', '비즈니스'),
        ('self_reward', '자기보상'),
        ('other', '기타'),
    ]
    SOURCE_CHOICES = [
        ('web_form', '웹 폼'),
        ('chatbot', '챗봇'),
        ('phone', '전화'),
        ('kakao', '카카오'),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='curation_requests'
    )
    guest_name = models.CharField(max_length=100, blank=True, default='')
    guest_phone = models.CharField(max_length=20, blank=True, default='')
    guest_email = models.EmailField(blank=True, default='')

    preferred_date_start = models.DateField(null=True, blank=True)
    preferred_date_end = models.DateField(null=True, blank=True)
    region = models.ForeignKey(
        'experiences.Region', on_delete=models.SET_NULL, null=True, blank=True, related_name='curation_requests'
    )
    budget_min = money_field(default=0)
    budget_max = money_field(default=0)
    pax_count = models.IntegerField(default=2)
    occasion = models.CharField(max_length=20, choices=OCCASION_CHOICES, default='other')
    personality_type = models.ForeignKey(
        PersonalityType, on_delete=models.SET_NULL, null=True, blank=True, related_name='+'
    )
    free_text = models.TextField(blank=True, default='')

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='new', db_index=True)
    assigned_curator = models.ForeignKey(
        'accounts.Curator', on_delete=models.SET_NULL, null=True, blank=True, related_name='curation_requests'
    )
    source = models.CharField(max_length=20, choices=SOURCE_CHOICES, default='web_form')

    class Meta:
        verbose_name = '큐레이션 문의'
        verbose_name_plural = '큐레이션 문의'
        ordering = ['-created_at']

    def __str__(self):
        return f'Curation#{self.pk} · {self.status}'


class CurationProposal(TimestampedModel):
    """큐레이터가 작성한 3안(A·B·C) 제안."""

    LABEL_CHOICES = [('A', 'A'), ('B', 'B'), ('C', 'C')]
    STATUS_CHOICES = [
        ('draft', '초안'),
        ('sent', '발송'),
        ('accepted', '채택'),
        ('declined', '거절'),
    ]

    request = models.ForeignKey(CurationRequest, on_delete=models.CASCADE, related_name='proposals')
    option_label = models.CharField(max_length=1, choices=LABEL_CHOICES)
    title = models.CharField(max_length=200)
    narrative = models.TextField(blank=True, default='')
    total_price = money_field()
    experience_refs = models.ManyToManyField('experiences.Experience', blank=True, related_name='+')
    pdf_url = models.URLField(blank=True, default='')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')

    class Meta:
        verbose_name = '큐레이션 제안'
        verbose_name_plural = '큐레이션 제안'
        unique_together = [('request', 'option_label')]

    def __str__(self):
        return f'{self.request} · {self.option_label}'


class ChatSession(TimestampedModel):
    """RAG 챗봇 대화 세션."""

    CONVERSION_CHOICES = [
        ('browsing', '탐색중'),
        ('curation_requested', '큐레이션 요청됨'),
        ('booked', '예약됨'),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='chat_sessions'
    )
    session_token = models.UUIDField(default=uuid.uuid4, unique=True, db_index=True)
    ended_at = models.DateTimeField(null=True, blank=True)
    conversion_status = models.CharField(max_length=30, choices=CONVERSION_CHOICES, default='browsing')

    class Meta:
        verbose_name = '챗봇 세션'
        verbose_name_plural = '챗봇 세션'

    def __str__(self):
        return f'Chat {self.session_token}'


class ChatMessage(TimestampedModel):
    """챗봇 메시지."""

    ROLE_CHOICES = [
        ('user', 'User'),
        ('assistant', 'Assistant'),
        ('system', 'System'),
    ]

    session = models.ForeignKey(ChatSession, on_delete=models.CASCADE, related_name='messages')
    role = models.CharField(max_length=10, choices=ROLE_CHOICES)
    content = models.TextField()
    retrieved_experience_ids = models.JSONField(default=list, blank=True)
    model_name = models.CharField(max_length=50, blank=True, default='')
    tokens_in = models.IntegerField(default=0)
    tokens_out = models.IntegerField(default=0)
    latency_ms = models.IntegerField(default=0)

    class Meta:
        verbose_name = '챗봇 메시지'
        verbose_name_plural = '챗봇 메시지'
        ordering = ['created_at']

    def __str__(self):
        return f'{self.role}: {self.content[:40]}'


class Review(TimestampedModel):
    """경험 후기 (예약 완료자만)."""

    booking = models.OneToOneField('bookings.Booking', on_delete=models.CASCADE, related_name='review')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='reviews')
    rating = models.IntegerField()
    title = models.CharField(max_length=200, blank=True, default='')
    content = models.TextField(blank=True, default='')
    photo_urls = models.JSONField(default=list, blank=True)
    is_verified = models.BooleanField(default=True, help_text='예약 데이터 기반 자동 true')
    is_public = models.BooleanField(default=True)
    curator_reply = models.TextField(blank=True, default='')

    class Meta:
        verbose_name = '후기'
        verbose_name_plural = '후기'
        ordering = ['-created_at']

    def __str__(self):
        return f'Review · {self.rating}★ · {self.user}'


class Wishlist(TimestampedModel):
    """찜."""

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='wishlist_items')
    experience = models.ForeignKey('experiences.Experience', on_delete=models.CASCADE, related_name='wished_by')

    class Meta:
        verbose_name = '찜'
        verbose_name_plural = '찜'
        unique_together = [('user', 'experience')]
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.user} ♡ {self.experience}'
