"""accounts — 사용자·프로필·멤버십·큐레이터·감사로그."""
from django.contrib.auth.models import AbstractUser
from django.db import models
from maeum.common import TimestampedModel, money_field


class User(AbstractUser):
    """이메일 기반 로그인. OAuth(카카오·애플·구글) 연결 가능."""

    STATUS_CHOICES = [
        ('active', 'Active'),
        ('dormant', 'Dormant'),
        ('banned', 'Banned'),
    ]

    email = models.EmailField(unique=True)
    nickname = models.CharField(
        max_length=24, blank=True, default='', db_index=True,
        help_text='서비스 전역에서 유니크한 닉네임 (2~24자, 공백 허용 안 함).',
    )
    phone = models.CharField(max_length=20, unique=True, null=True, blank=True)
    oauth_provider = models.CharField(max_length=20, blank=True, default='')
    oauth_id = models.CharField(max_length=255, blank=True, default='')
    display_name = models.CharField(max_length=100, blank=True, default='')
    avatar = models.ImageField(upload_to='avatars/%Y/%m/', blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    last_login_at = models.DateTimeField(null=True, blank=True)
    # 신원 검증 (합석 시 노출되는 배지)
    verified_at = models.DateTimeField(null=True, blank=True)
    verification_method = models.CharField(
        max_length=20, blank=True, default='',
        help_text='instagram / linkedin / interview / kyc 등',
    )

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    class Meta:
        verbose_name = '회원'
        verbose_name_plural = '회원'
        constraints = [
            models.UniqueConstraint(
                fields=['nickname'],
                condition=~models.Q(nickname=''),
                name='unique_nickname_when_set',
            ),
        ]

    def __str__(self):
        return self.nickname or self.display_name or self.email


class UserProfile(TimestampedModel):
    """프로필·선호·큐레이터 메모."""

    GENDER_CHOICES = [
        ('male', '남'),
        ('female', '여'),
        ('other', '기타'),
        ('na', '미지정'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    birth_year = models.IntegerField(null=True, blank=True)
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES, default='na')
    country = models.ForeignKey(
        'experiences.Country', on_delete=models.SET_NULL, null=True, blank=True, related_name='+'
    )
    marketing_opt_in = models.BooleanField(default=False)
    preferred_categories = models.ManyToManyField('experiences.Category', blank=True)
    personality_type = models.ForeignKey(
        'curation.PersonalityType', on_delete=models.SET_NULL, null=True, blank=True, related_name='+'
    )
    total_booking_amount = money_field()
    vip_note = models.TextField(blank=True, default='')

    class Meta:
        verbose_name = '회원 프로필'
        verbose_name_plural = '회원 프로필'

    def __str__(self):
        return f'Profile<{self.user}>'


class MembershipTier(TimestampedModel):
    """멤버십 등급 마스터. Phase 2에서 UI 노출."""

    CODE_CHOICES = [
        ('standard', 'Standard'),
        ('gold', 'Gold'),
        ('black', 'Black'),
    ]

    code = models.CharField(max_length=20, unique=True, choices=CODE_CHOICES)
    name = models.CharField(max_length=50)
    annual_fee = money_field()
    benefits = models.JSONField(default=list, blank=True)
    priority_queue_weight = models.IntegerField(default=0)

    class Meta:
        verbose_name = '멤버십 등급'
        verbose_name_plural = '멤버십 등급'

    def __str__(self):
        return self.name


class Membership(TimestampedModel):
    """사용자별 멤버십 가입."""

    STATUS_CHOICES = [
        ('active', '활성'),
        ('cancelled', '취소'),
        ('expired', '만료'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='memberships')
    tier = models.ForeignKey(MembershipTier, on_delete=models.PROTECT, related_name='memberships')
    started_at = models.DateTimeField()
    ends_at = models.DateTimeField()
    auto_renew = models.BooleanField(default=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')

    class Meta:
        verbose_name = '멤버십 가입'
        verbose_name_plural = '멤버십 가입'

    def __str__(self):
        return f'{self.user} · {self.tier}'


class Curator(TimestampedModel):
    """운영자(관리자) 큐레이터 프로필."""

    admin_user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='curator')
    display_name = models.CharField(max_length=100)
    specialty_categories = models.ManyToManyField('experiences.Category', blank=True, related_name='curators')
    signature_color = models.CharField(max_length=20, blank=True, default='')
    bio = models.TextField(blank=True, default='')

    class Meta:
        verbose_name = '큐레이터'
        verbose_name_plural = '큐레이터'

    def __str__(self):
        return self.display_name


class AuditLog(models.Model):
    """관리자 행동 로그 (컴플라이언스)."""

    ACTION_CHOICES = [
        ('create', 'Create'),
        ('update', 'Update'),
        ('delete', 'Delete'),
        ('export', 'Export'),
        ('access', 'Access'),
    ]

    actor = models.ForeignKey(Curator, on_delete=models.SET_NULL, null=True, related_name='audit_logs')
    action = models.CharField(max_length=20, choices=ACTION_CHOICES)
    entity_type = models.CharField(max_length=50)
    entity_id = models.BigIntegerField()
    before = models.JSONField(null=True, blank=True)
    after = models.JSONField(null=True, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        indexes = [
            models.Index(fields=['entity_type', 'entity_id']),
            models.Index(fields=['-created_at']),
        ]

    def __str__(self):
        return f'{self.action} {self.entity_type}#{self.entity_id}'


class SocialIdentity(TimestampedModel):
    """소셜 로그인 아이덴티티 — 실제 Google/Naver OAuth 연동 시 사용.
    초기 단계에서는 `mock_login` API 가 이 테이블에 record 를 남긴다."""

    PROVIDER_CHOICES = [
        ('google', 'Google'),
        ('naver', 'Naver'),
        ('mock', 'Mock (dev)'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='social_identities')
    provider = models.CharField(max_length=16, choices=PROVIDER_CHOICES)
    provider_uid = models.CharField(max_length=255)
    email_at_signup = models.EmailField(blank=True, default='')
    raw_name = models.CharField(max_length=120, blank=True, default='')

    class Meta:
        verbose_name = '소셜 아이덴티티'
        verbose_name_plural = '소셜 아이덴티티'
        unique_together = [('provider', 'provider_uid')]

    def __str__(self):
        return f'{self.provider}:{self.provider_uid}'


class MemberIntakeSurvey(TimestampedModel):
    """프리미엄 큐레이션용 민감 정보 설문.
    결혼정보 회사 수준의 세그멘테이션을 위해 수집. 모든 민감 항목에 '공개하지 않음'(na) 옵션 기본 포함.
    개인정보보호법 주의 — consent_privacy 체크된 경우만 저장 유효로 간주."""

    AGE_RANGE_CHOICES = [
        ('20s', '20대'),
        ('30s', '30대'),
        ('40s', '40대'),
        ('50s', '50대'),
        ('60plus', '60대 이상'),
        ('na', '공개하지 않음'),
    ]

    INCOME_RANGE_CHOICES = [
        ('lt_100m', '1억 미만'),
        ('100_300m', '1억 – 3억'),
        ('300_500m', '3억 – 5억'),
        ('500_1b', '5억 – 10억'),
        ('gte_1b', '10억 이상'),
        ('na', '공개하지 않음'),
    ]

    ASSET_RANGE_CHOICES = [
        ('lt_500m', '5억 미만'),
        ('500m_1b', '5억 – 10억'),
        ('1b_3b', '10억 – 30억'),
        ('3b_10b', '30억 – 100억'),
        ('gte_10b', '100억 이상'),
        ('na', '공개하지 않음'),
    ]

    MARITAL_CHOICES = [
        ('single', '미혼'),
        ('married', '기혼'),
        ('partnered', '장기 파트너'),
        ('divorced', '이혼'),
        ('na', '공개하지 않음'),
    ]

    COMPANION_CHOICES = [
        ('alone', '혼자'),
        ('spouse', '배우자'),
        ('partner', '파트너'),
        ('family', '가족'),
        ('colleague', '동료·비즈니스'),
        ('friend', '친구'),
        ('other', '기타'),
    ]

    BUDGET_RANGE_CHOICES = [
        ('lt_1m', '100만원 미만'),
        ('1m_3m', '100만 – 300만원'),
        ('3m_5m', '300만 – 500만원'),
        ('5m_10m', '500만 – 1,000만원'),
        ('gte_10m', '1,000만원 이상'),
        ('na', '상담 후 결정'),
    ]

    REFERRAL_CHOICES = [
        ('search', '검색'),
        ('sns', 'SNS (Instagram/YouTube)'),
        ('press', '언론·매거진'),
        ('friend', '지인 추천'),
        ('curator', '큐레이터 초청'),
        ('other', '기타'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='intake')

    # 기본
    full_name = models.CharField(max_length=120, blank=True, default='')
    age_range = models.CharField(max_length=12, choices=AGE_RANGE_CHOICES, default='na')
    residence_city = models.CharField(max_length=60, blank=True, default='',
                                       help_text='거주 시/도')
    residence_district = models.CharField(max_length=80, blank=True, default='',
                                           help_text='거주 구/동 (선택)')

    # 직업·가정
    occupation = models.CharField(max_length=120, blank=True, default='',
                                   help_text='직업·직함')
    company = models.CharField(max_length=120, blank=True, default='',
                                help_text='소속 (선택)')
    marital_status = models.CharField(max_length=12, choices=MARITAL_CHOICES, default='na')

    # 민감 — 자산·소득
    annual_income_range = models.CharField(
        max_length=12, choices=INCOME_RANGE_CHOICES, default='na'
    )
    asset_range = models.CharField(max_length=12, choices=ASSET_RANGE_CHOICES, default='na')

    # 선호
    preferred_categories = models.ManyToManyField(
        'experiences.Category', blank=True, related_name='intake_surveys'
    )
    budget_per_experience = models.CharField(
        max_length=12, choices=BUDGET_RANGE_CHOICES, default='na'
    )
    preferred_months = models.JSONField(
        default=list, blank=True,
        help_text='선호 월 1~12 리스트 (예: [4, 5, 10])'
    )

    # 동행자·특별 일정
    companion_types = models.JSONField(
        default=list, blank=True,
        help_text='동행 유형 다중선택 — COMPANION_CHOICES 의 key 리스트'
    )
    special_occasions = models.TextField(
        blank=True, default='',
        help_text='기념일·특별 행사·드림 경험 자유 서술'
    )

    # 유입
    referral_source = models.CharField(
        max_length=12, choices=REFERRAL_CHOICES, default='other'
    )
    referral_detail = models.CharField(
        max_length=200, blank=True, default='',
        help_text='추천인 이름·SNS 계정 등 (선택)'
    )

    # 동의
    consent_privacy = models.BooleanField(default=False, help_text='민감정보 수집 동의 (필수)')
    consent_marketing = models.BooleanField(default=False, help_text='마케팅 수신 동의 (선택)')
    consent_profiling = models.BooleanField(
        default=False, help_text='큐레이션 프로파일링 분석 동의 (선택)'
    )

    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name = '회원 인테이크 설문'
        verbose_name_plural = '회원 인테이크 설문'

    def __str__(self):
        return f'Intake<{self.user.email}>'
