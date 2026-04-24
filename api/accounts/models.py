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
    phone = models.CharField(max_length=20, unique=True, null=True, blank=True)
    oauth_provider = models.CharField(max_length=20, blank=True, default='')
    oauth_id = models.CharField(max_length=255, blank=True, default='')
    display_name = models.CharField(max_length=100, blank=True, default='')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    last_login_at = models.DateTimeField(null=True, blank=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    class Meta:
        verbose_name = '회원'
        verbose_name_plural = '회원'

    def __str__(self):
        return self.display_name or self.email


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
