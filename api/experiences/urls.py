from django.urls import path
from . import views

urlpatterns = [
    path('', views.experience_list, name='experience-list'),
]
