from django.urls import path
from . import views

urlpatterns = [
    path('', views.booking_list, name='booking-list'),
    path('recent/', views.recent_bookings, name='booking-recent'),
    path('demo/', views.create_demo_booking, name='booking-demo-create'),
    path('availability/', views.session_availability, name='booking-availability'),
    path('<int:booking_id>/chat/', views.chat_room_detail, name='booking-chat-detail'),
    path('<int:booking_id>/chat/messages/', views.chat_messages, name='booking-chat-messages'),
]
