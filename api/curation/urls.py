from django.urls import path
from . import views

urlpatterns = [
    path('quiz/questions/', views.quiz_questions, name='quiz-questions'),
    path('quiz/submit/', views.quiz_submit, name='quiz-submit'),
    path('quiz/result/<uuid:token>/', views.quiz_result, name='quiz-result'),
    path('requests/', views.curation_request_create, name='curation-request-create'),
]
