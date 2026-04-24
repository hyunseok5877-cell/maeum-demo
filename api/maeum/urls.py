from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse


def health(_request):
    return JsonResponse({'status': 'ok', 'service': 'maeum-api', 'version': '0.1.0'})


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/health/', health),
    path('api/experiences/', include('experiences.urls')),
    path('api/bookings/', include('bookings.urls')),
    path('api/curation/', include('curation.urls')),
]
