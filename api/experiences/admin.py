from django.contrib import admin
from django_summernote.admin import SummernoteModelAdmin

from .models import (
    Country, Region, Category, Tag, Vendor, VendorContract, VendorDocument,
    Experience, ExperienceMedia, ExperienceOption, ExperienceSchedule, ExperienceEmbedding,
)


@admin.register(Country)
class CountryAdmin(admin.ModelAdmin):
    list_display = ('code', 'name_ko', 'name_en', 'is_active', 'display_order')
    list_editable = ('is_active', 'display_order')
    search_fields = ('code', 'name_ko', 'name_en')


@admin.register(Region)
class RegionAdmin(admin.ModelAdmin):
    list_display = ('country', 'code', 'name_ko', 'is_active', 'display_order')
    list_filter = ('country', 'is_active')
    list_editable = ('is_active', 'display_order')
    search_fields = ('code', 'name_ko', 'name_en')


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('code', 'name_ko', 'name_en', 'display_order')
    search_fields = ('code', 'name_ko')


@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    list_display = ('code', 'name_ko')
    search_fields = ('code', 'name_ko')


class VendorContractInline(admin.TabularInline):
    model = VendorContract
    extra = 0


class VendorDocumentInline(admin.TabularInline):
    model = VendorDocument
    extra = 0


@admin.register(Vendor)
class VendorAdmin(admin.ModelAdmin):
    list_display = ('name', 'status', 'contact_name', 'phone', 'business_registration_no')
    list_filter = ('status',)
    search_fields = ('name', 'contact_name', 'phone', 'email', 'business_registration_no')
    inlines = [VendorContractInline, VendorDocumentInline]


class ExperienceMediaInline(admin.TabularInline):
    model = ExperienceMedia
    extra = 1
    fields = ('type', 'file', 'url', 'is_cover', 'display_order', 'alt_text')


class ExperienceOptionInline(admin.TabularInline):
    model = ExperienceOption
    extra = 0


@admin.register(ExperienceOption)
class ExperienceOptionAdmin(admin.ModelAdmin):
    list_display = ('experience', 'name', 'additional_price', 'max_quantity')
    search_fields = ('name', 'experience__title_ko')
    autocomplete_fields = ('experience',)


class ExperienceScheduleInline(admin.TabularInline):
    model = ExperienceSchedule
    extra = 0


@admin.register(Experience)
class ExperienceAdmin(SummernoteModelAdmin):
    summernote_fields = ('content_html',)
    list_display = (
        'title_ko', 'category', 'region', 'status',
        'is_featured', 'is_monthly_popular', 'is_new_arrival', 'home_pick_order',
        'base_price', 'discount_percentage', 'booking_count', 'published_at',
    )
    list_filter = (
        'status', 'is_featured', 'is_monthly_popular', 'is_new_arrival',
        'category', 'country', 'region',
    )
    list_editable = (
        'status', 'is_featured', 'is_monthly_popular', 'is_new_arrival',
        'home_pick_order', 'discount_percentage',
    )
    search_fields = ('title_ko', 'title_en', 'slug')
    prepopulated_fields = {'slug': ('title_en',)}
    autocomplete_fields = ('country', 'region', 'category', 'vendor')
    filter_horizontal = ('tags',)
    inlines = [ExperienceMediaInline, ExperienceOptionInline, ExperienceScheduleInline]
    fieldsets = (
        ('기본', {'fields': ('slug', 'title_ko', 'title_en', 'subtitle_ko', 'subtitle_en', 'status')}),
        ('노출 풀 (각각 독립 ON/OFF + 핀 순서)', {
            'fields': ('is_featured', 'is_monthly_popular', 'is_new_arrival', 'home_pick_order'),
            'description': '추천(마음 PICK) / 월간 인기 / 신상 — 셋 다 따로 켤 수 있음. home_pick_order는 작을수록 앞.',
        }),
        ('분류', {'fields': ('country', 'region', 'category', 'vendor', 'tags')}),
        ('짧은 설명 (리스트·카드용)', {'fields': ('description_ko', 'description_en')}),
        ('상세 콘텐츠 (리치 에디터)', {'fields': ('content_html',)}),
        ('가격·할인', {'fields': ('base_price', 'discount_percentage', 'currency')}),
        ('운영', {'fields': ('duration_minutes', 'min_pax', 'max_pax', 'advance_booking_days', 'cancellation_policy')}),
        ('판매 가능 일자', {'fields': ('available_from', 'available_to')}),
        ('지표', {'fields': ('rating_avg', 'rating_count', 'views_count', 'booking_count'), 'classes': ('collapse',)}),
        ('SEO', {'fields': ('seo_meta_title', 'seo_meta_description', 'published_at'), 'classes': ('collapse',)}),
    )


@admin.register(ExperienceMedia)
class ExperienceMediaAdmin(admin.ModelAdmin):
    list_display = ('experience', 'type', 'is_cover', 'display_order', 'file', 'url')
    list_filter = ('type', 'is_cover')
    search_fields = ('experience__title_ko', 'alt_text')
    autocomplete_fields = ('experience',)


@admin.register(ExperienceEmbedding)
class ExperienceEmbeddingAdmin(admin.ModelAdmin):
    list_display = ('experience', 'model_version', 'content_hash', 'updated_at')
    search_fields = ('experience__title_ko',)
