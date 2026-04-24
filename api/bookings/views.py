from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.http import JsonResponse

from .models import Booking


def booking_list(_request):
    return JsonResponse({'results': [], 'note': 'stub'})


def _mask_identifier(user):
    """이메일 or username을 ab**cd 패턴으로 마스킹 (개인정보 보호)."""
    if not user:
        return 'an**mous'
    base = ''
    if getattr(user, 'email', ''):
        base = user.email.split('@')[0]
    if not base:
        base = getattr(user, 'username', '') or 'anon'
    base = base.lower()
    if len(base) <= 2:
        return base + '**'
    if len(base) <= 4:
        return base[0] + '**' + base[-1]
    return base[:2] + '**' + base[-2:]


@api_view(['GET'])
@permission_classes([AllowAny])
def recent_bookings(_request):
    """
    최근 예약 목록 (소셜 프루프 위젯용). 개인정보 보호를 위해 ID 마스킹.
    confirmed/completed 상태만, 최신 10건.
    """
    qs = (
        Booking.objects.filter(status__in=['confirmed', 'completed', 'in_progress'])
        .select_related('user')
        .prefetch_related('items__experience', 'items__experience__region')
        .order_by('-created_at')[:10]
    )
    data = []
    for b in qs:
        item = b.items.first()
        exp = item.experience if item else None
        data.append({
            'id': b.id,
            'masked_id': _mask_identifier(b.user),
            'experience_title': exp.title_ko if exp else '',
            'experience_slug': exp.slug if exp else '',
            'region_ko': exp.region.name_ko if exp and exp.region else '',
            'created_at': b.created_at.isoformat(),
        })
    return Response({'results': data})
