from django.urls import path
from . import views

urlpatterns = [
    path('', views.booking_list, name='booking-list'),
    path('recent/', views.recent_bookings, name='booking-recent'),
]
