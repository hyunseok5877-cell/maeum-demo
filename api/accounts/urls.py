from django.urls import path
from . import views

urlpatterns = [
    path('auth/social/mock/', views.mock_social_login, name='mock-social-login'),
    path('auth/logout/', views.logout_view, name='auth-logout'),
    path('auth/me/', views.me, name='auth-me'),
    path('auth/avatar/', views.avatar_upload, name='auth-avatar'),
    path('auth/nickname/check/', views.nickname_check, name='nickname-check'),
    path('auth/nickname/set/', views.nickname_set, name='nickname-set'),
    path('me/profile/', views.my_profile, name='my-profile'),
    path('members/intake/', views.submit_intake, name='submit-intake'),
]
