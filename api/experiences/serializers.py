"""DRF serializers — 프론트 카탈로그·상세용."""
from rest_framework import serializers
from .models import Country, Region, Category, Tag, Experience, ExperienceMedia, ExperienceOption, Vendor


class CountrySerializer(serializers.ModelSerializer):
    class Meta:
        model = Country
        fields = ('code', 'name_ko', 'name_en', 'is_active', 'display_order')


class RegionSerializer(serializers.ModelSerializer):
    country = CountrySerializer(read_only=True)

    class Meta:
        model = Region
        fields = ('id', 'code', 'name_ko', 'name_en', 'lat', 'lng', 'country', 'is_active')


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ('id', 'code', 'name_ko', 'name_en', 'icon', 'description', 'display_order')


class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ('id', 'code', 'name_ko')


class ExperienceMediaSerializer(serializers.ModelSerializer):
    src = serializers.CharField(read_only=True)

    class Meta:
        model = ExperienceMedia
        fields = ('id', 'type', 'src', 'display_order', 'alt_text', 'is_cover')


class ExperienceOptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExperienceOption
        fields = ('id', 'name', 'description', 'additional_price', 'max_quantity')


class VendorLiteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vendor
        fields = ('id', 'name')


class ExperienceListSerializer(serializers.ModelSerializer):
    """카탈로그 카드용 요약."""
    region = RegionSerializer(read_only=True)
    category = CategorySerializer(read_only=True)
    cover_image = serializers.SerializerMethodField()
    final_price = serializers.IntegerField(read_only=True)
    discount_amount = serializers.IntegerField(read_only=True)

    class Meta:
        model = Experience
        fields = (
            'id', 'slug', 'title_ko', 'title_en', 'subtitle_ko', 'description_ko',
            'region', 'category', 'cover_image',
            'base_price', 'discount_percentage', 'final_price', 'discount_amount',
            'currency', 'duration_minutes', 'min_pax', 'max_pax',
            'available_from', 'available_to',
            'status', 'is_featured', 'rating_avg', 'rating_count',
        )

    def get_cover_image(self, obj):
        cover = obj.media.filter(is_cover=True).first() or obj.media.first()
        if not cover:
            return None
        request = self.context.get('request')
        src = cover.src
        if request and src and src.startswith('/'):
            return request.build_absolute_uri(src)
        return src


class ExperienceDetailSerializer(ExperienceListSerializer):
    """상세 페이지용. content_html, media 전체, 옵션, 벤더 포함."""
    media = ExperienceMediaSerializer(many=True, read_only=True)
    options = ExperienceOptionSerializer(many=True, read_only=True)
    tags = TagSerializer(many=True, read_only=True)
    vendor = VendorLiteSerializer(read_only=True)

    class Meta(ExperienceListSerializer.Meta):
        fields = ExperienceListSerializer.Meta.fields + (
            'content_html', 'description_en', 'cancellation_policy',
            'advance_booking_days', 'media', 'options', 'tags', 'vendor',
            'seo_meta_title', 'seo_meta_description', 'published_at',
        )
