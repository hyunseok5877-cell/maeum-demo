"""
시드 예약 — 소셜 프루프 위젯(최근 예약자) 데모용.
`python manage.py seed_bookings`
"""
import random
from datetime import timedelta
from decimal import Decimal

from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

from accounts.models import User
from experiences.models import Experience
from bookings.models import Booking, BookingItem


DEMO_USERS = [
    ('minjae', 'minjae.k@example.com', '김민재'),
    ('yejin', 'yejin.p@example.com', '박예진'),
    ('seunghyun', 'seunghyun.l@example.com', '이승현'),
    ('haeun', 'haeun.j@example.com', '정하은'),
    ('jiho', 'jiho.c@example.com', '차지호'),
    ('soyoung', 'soyoung@example.com', '소영'),
    ('taejin', 'taejin.n@example.com', '남태진'),
]


class Command(BaseCommand):
    help = '데모 사용자·최근 예약 시드 (소셜 프루프 위젯용)'

    def add_arguments(self, parser):
        parser.add_argument('--reset', action='store_true', help='기존 예약 삭제 후 재생성')

    @transaction.atomic
    def handle(self, *args, **options):
        if options['reset']:
            Booking.objects.all().delete()
            self.stdout.write(self.style.WARNING('Existing bookings deleted.'))

        users = []
        for username, email, display in DEMO_USERS:
            user, _ = User.objects.get_or_create(
                username=username,
                defaults={'email': email, 'display_name': display, 'is_active': True},
            )
            users.append(user)

        experiences = list(Experience.objects.filter(status='active'))
        if not experiences:
            self.stdout.write(self.style.ERROR('먼저 `seed_maeum` 실행이 필요합니다.'))
            return

        now = timezone.now()
        statuses = ['confirmed', 'confirmed', 'completed', 'in_progress']
        created = 0

        # 최근 3일 안에 분포
        for i in range(12):
            user = random.choice(users)
            exp = random.choice(experiences)
            minutes_ago = random.randint(2, 72 * 60)
            created_at = now - timedelta(minutes=minutes_ago)
            scheduled_at = now + timedelta(days=random.randint(3, 30), hours=random.randint(0, 23))

            booking_number = f'MAEUM-{now.year}-{i:06d}'
            if Booking.objects.filter(booking_number=booking_number).exists():
                continue

            b = Booking.objects.create(
                booking_number=booking_number,
                user=user,
                status=random.choice(statuses),
                scheduled_at=scheduled_at,
                pax_count=random.choice([1, 2, 2, 2, 4]),
                total_amount=Decimal(exp.final_price),
                commission_amount=Decimal(exp.final_price) * Decimal('0.25'),
            )
            # created_at 수동 셋 (auto_now_add 우회)
            Booking.objects.filter(pk=b.pk).update(created_at=created_at)

            BookingItem.objects.create(
                booking=b,
                experience=exp,
                quantity=1,
                unit_price=Decimal(exp.final_price),
                subtotal=Decimal(exp.final_price),
            )
            created += 1

        self.stdout.write(self.style.SUCCESS(f'\n✅ 데모 예약 {created}건 생성 · 사용자 {len(users)}명'))
