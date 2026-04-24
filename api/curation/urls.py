from django.urls import path
from . import views

urlpatterns = [
    path('requests/', views.curation_request_list, name='curation-request-list'),
]
