from django.http import JsonResponse


def curation_request_list(_request):
    return JsonResponse({'results': [], 'note': 'stub'})
