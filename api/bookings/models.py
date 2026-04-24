"""bookings — 예약·라인아이템·결제·환불."""
from django.conf import settings
from django.db import models
from maeum.common import TimestampedModel, money_field


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
