from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.http import JsonResponse
from django.urls import path, include


def health(_request):
    return JsonResponse({'status': 'ok', 'service': 'maeum-api', 'version': '0.1.0'})


urlpatterns = [
    path('admin/', admin.site.urls),
    path('summernote/', include('django_summernote.urls')),
    path('api/health/', health),
    path('api/', include('accounts.urls')),
    path('api/experiences/', include('experiences.urls')),
    path('api/bookings/', include('bookings.urls')),
    path('api/curation/', include('curation.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
