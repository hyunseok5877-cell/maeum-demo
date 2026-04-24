from django.http import JsonResponse


def booking_list(_request):
    return JsonResponse({'results': [], 'note': 'stub'})
