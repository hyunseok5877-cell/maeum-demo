"""bookings — 예약·라인아이템·결제·환불 + 합석 그룹·채팅."""
from django.conf import settings
from django.db import models
from maeum.common import TimestampedModel, money_field


class SessionGroup(TimestampedModel):
    """같은 (경험, 날짜) 회차에 합석할 수 있는 단위.
    capacity = experience.max_pax. open 그룹만 다른 예약자가 합류 가능.
    """

    SHARING_CHOICES = [
        ('private', '단독 이용 (다른 팀 합류 불가)'),
        ('friends_only', '지인만 동반'),
        ('open', '오픈 멤버 모집 (다른 팀 합류 가능)'),
    ]

    experience = models.ForeignKey(
        'experiences.Experience', on_delete=models.PROTECT, related_name='session_groups'
    )
    scheduled_date = models.DateField(db_index=True)
    sharing_mode = models.CharField(
        max_length=16, choices=SHARING_CHOICES, default='private', db_index=True
    )
    capacity = models.IntegerField(default=1)
    pax_taken = models.IntegerField(default=0)
    is_full = models.BooleanField(default=False, db_index=True)

    class Meta:
        verbose_name = '세션 그룹'
        verbose_name_plural = '세션 그룹'
        ordering = ['scheduled_date', '-created_at']
        indexes = [
            models.Index(fields=['experience', 'scheduled_date', 'sharing_mode', 'is_full']),
        ]

    def __str__(self):
        return f'{self.experience} · {self.scheduled_date} · {self.sharing_mode} ({self.pax_taken}/{self.capacity})'

    def remaining(self):
        return max(0, self.capacity - self.pax_taken)

    def recalc_full(self):
        self.is_full = self.pax_taken >= self.capacity


class Booking(TimestampedModel):
    """예약 주문."""

    STATUS_CHOICES = [
        ('pending', '결제대기'),
        ('confirmed', '확정'),
        ('in_progress', '진행중'),
        ('completed', '완료'),
        ('cancelled', '취소'),
        ('refunded', '환불'),
    ]
    SHARING_CHOICES = SessionGroup.SHARING_CHOICES

    booking_number = models.CharField(max_length=32, unique=True, db_index=True)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name='bookings'
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending', db_index=True)

    scheduled_at = models.DateTimeField(db_index=True)
    pax_count = models.IntegerField(default=1)
    total_amount = money_field()
    discount_amount = money_field(default=0)
    commission_amount = money_field(default=0, help_text='벤더 공제 수수료 (자동계산)')
    special_request = models.TextField(blank=True, default='')
    curator = models.ForeignKey(
        'accounts.Curator', on_delete=models.SET_NULL, null=True, blank=True, related_name='bookings'
    )
    cancelled_at = models.DateTimeField(null=True, blank=True)
    cancel_reason = models.TextField(blank=True, default='')
    sharing_mode = models.CharField(
        max_length=16, choices=SHARING_CHOICES, default='private',
        help_text='사용자 의사: 단독 / 지인만 / 오픈 합석'
    )
    session_group = models.ForeignKey(
        SessionGroup, on_delete=models.SET_NULL, null=True, blank=True, related_name='bookings'
    )

    class Meta:
        verbose_name = '예약'
        verbose_name_plural = '예약'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'status']),
            models.Index(fields=['scheduled_at']),
        ]

    def __str__(self):
        return self.booking_number


class BookingItem(TimestampedModel):
    """예약 라인아이템 (경험 + 옵션)."""

    booking = models.ForeignKey(Booking, on_delete=models.CASCADE, related_name='items')
    experience = models.ForeignKey('experiences.Experience', on_delete=models.PROTECT)
    option = models.ForeignKey(
        'experiences.ExperienceOption', on_delete=models.SET_NULL, null=True, blank=True
    )
    quantity = models.IntegerField(default=1)
    unit_price = money_field()
    subtotal = money_field()

    class Meta:
        verbose_name = '예약 라인'
        verbose_name_plural = '예약 라인'

    def __str__(self):
        return f'{self.booking} · {self.experience}'


class Payment(TimestampedModel):
    """결제 트랜잭션."""

    PROVIDER_CHOICES = [
        ('tosspayments', 'TossPayments'),
        ('bank_transfer', '계좌이체'),
        ('manual', '수기'),
    ]
    STATUS_CHOICES = [
        ('pending', '대기'),
        ('paid', '완료'),
        ('failed', '실패'),
        ('refunded', '전액환불'),
        ('partial_refunded', '부분환불'),
    ]

    booking = models.ForeignKey(Booking, on_delete=models.CASCADE, related_name='payments')
    provider = models.CharField(max_length=20, choices=PROVIDER_CHOICES)
    provider_tx_id = models.CharField(max_length=100, blank=True, default='', db_index=True)
    idempotency_key = models.CharField(max_length=100, unique=True, null=True, blank=True)
    amount = money_field()
    currency = models.CharField(max_length=3, default='KRW')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending', db_index=True)
    paid_at = models.DateTimeField(null=True, blank=True)
    refunded_at = models.DateTimeField(null=True, blank=True)
    receipt_url = models.URLField(blank=True, default='')

    class Meta:
        verbose_name = '결제'
        verbose_name_plural = '결제'

    def __str__(self):
        return f'{self.booking} · {self.status} · {self.amount}'


class ChatRoom(TimestampedModel):
    """세션 그룹 1:1 채팅방. 그룹 멤버끼리만 입장."""

    session_group = models.OneToOneField(
        SessionGroup, on_delete=models.CASCADE, related_name='chat_room'
    )
    title = models.CharField(max_length=200, blank=True, default='')
    closed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name = '채팅방'
        verbose_name_plural = '채팅방'

    def __str__(self):
        return f'Chat #{self.id} · {self.session_group}'


class ChatMessage(TimestampedModel):
    """채팅 메시지."""

    KIND_CHOICES = [
        ('user', '유저'),
        ('system', '시스템'),
    ]

    room = models.ForeignKey(ChatRoom, on_delete=models.CASCADE, related_name='messages')
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='chat_messages'
    )
    kind = models.CharField(max_length=10, choices=KIND_CHOICES, default='user')
    body = models.TextField()

    class Meta:
        verbose_name = '채팅 메시지'
        verbose_name_plural = '채팅 메시지'
        ordering = ['created_at']
        indexes = [
            models.Index(fields=['room', 'created_at']),
        ]

    def __str__(self):
        return f'{self.room_id}/{self.id} · {self.body[:30]}'


class Refund(TimestampedModel):
    """환불 히스토리."""

    STATUS_CHOICES = [
        ('requested', '요청'),
        ('approved', '승인'),
        ('completed', '완료'),
        ('rejected', '반려'),
    ]

    payment = models.ForeignKey(Payment, on_delete=models.CASCADE, related_name='refunds')
    booking = models.ForeignKey(Booking, on_delete=models.CASCADE, related_name='refunds')
    amount = money_field()
    reason = models.TextField(blank=True, default='')
    approved_by = models.ForeignKey(
        'accounts.Curator', on_delete=models.SET_NULL, null=True, blank=True, related_name='+'
    )
    provider_refund_id = models.CharField(max_length=100, blank=True, default='')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='requested')
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name = '환불'
        verbose_name_plural = '환불'

    def __str__(self):
        return f'Refund {self.amount} · {self.status}'
