from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register('countries', views.CountryViewSet, basename='country')
router.register('regions', views.RegionViewSet, basename='region')
router.register('categories', views.CategoryViewSet, basename='category')
router.register('', views.ExperienceViewSet, basename='experience')

urlpatterns = router.urls
