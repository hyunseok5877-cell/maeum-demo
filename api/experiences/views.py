from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets, mixins, filters
from rest_framework.response import Response
from rest_framework.decorators import action

from .models import Country, Region, Category, Experience
from .serializers import (
    CountrySerializer, RegionSerializer, CategorySerializer,
    ExperienceListSerializer, ExperienceDetailSerializer,
)


class CountryViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    queryset = Country.objects.all().order_by('display_order')
    serializer_class = CountrySerializer


class RegionViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    queryset = Region.objects.filter(is_active=True).select_related('country').order_by('display_order')
    serializer_class = RegionSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['country__code']


class CategoryViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    queryset = Category.objects.all().order_by('display_order')
    serializer_class = CategorySerializer


class ExperienceViewSet(mixins.ListModelMixin, mixins.RetrieveModelMixin, viewsets.GenericViewSet):
    queryset = (
        Experience.objects.filter(status='active')
        .select_related('region', 'region__country', 'category', 'vendor')
        .prefetch_related('media', 'options', 'tags')
    )
    lookup_field = 'slug'
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter, filters.SearchFilter]
    filterset_fields = {
        'category__code': ['exact'],
        'region__code': ['exact'],
        'country__code': ['exact'],
        'is_featured': ['exact'],
        'is_monthly_popular': ['exact'],
        'is_new_arrival': ['exact'],
    }
    ordering_fields = ['published_at', 'base_price', 'rating_avg', 'booking_count', 'home_pick_order']
    ordering = ['-is_featured', '-published_at']
    search_fields = ['title_ko', 'title_en', 'subtitle_ko', 'description_ko']

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ExperienceDetailSerializer
        return ExperienceListSerializer

    def _ordered(self, qs, limit=8):
        """home_pick_order 우선 (NULL 뒤로) → published_at desc."""
        from django.db.models import F
        return (
            qs.order_by(
                F('home_pick_order').asc(nulls_last=True),
                '-published_at',
            )[:limit]
        )

    @action(detail=False, methods=['get'])
    def featured(self, request):
        """추천 = 마음 PICK 풀."""
        qs = self._ordered(self.get_queryset().filter(is_featured=True))
        serializer = ExperienceListSerializer(qs, many=True, context={'request': request})
        return Response({'results': serializer.data})

    @action(detail=False, methods=['get'])
    def popular(self, request):
        """월간 인기 풀 — 콘솔에서 명시적으로 켠 항목만."""
        qs = self._ordered(self.get_queryset().filter(is_monthly_popular=True))
        serializer = ExperienceListSerializer(qs, many=True, context={'request': request})
        return Response({'results': serializer.data})

    @action(detail=False, methods=['get'], url_path='new')
    def new_arrivals(self, request):
        """신상 풀."""
        qs = self._ordered(self.get_queryset().filter(is_new_arrival=True))
        serializer = ExperienceListSerializer(qs, many=True, context={'request': request})
        return Response({'results': serializer.data})
