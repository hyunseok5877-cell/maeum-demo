from django.http import JsonResponse


def experience_list(_request):
    return JsonResponse({'results': [], 'note': 'stub — models/serializers not yet implemented'})
