from django.contrib import admin
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
class ExperienceAdmin(admin.ModelAdmin):
    list_display = (
        'title_ko', 'category', 'region', 'status', 'is_featured',
        'base_price', 'rating_avg', 'booking_count', 'published_at',
    )
    list_filter = ('status', 'is_featured', 'category', 'country', 'region')
    list_editable = ('status', 'is_featured')
    search_fields = ('title_ko', 'title_en', 'slug')
    prepopulated_fields = {'slug': ('title_en',)}
    autocomplete_fields = ('country', 'region', 'category', 'vendor')
    filter_horizontal = ('tags',)
    inlines = [ExperienceMediaInline, ExperienceOptionInline, ExperienceScheduleInline]
    fieldsets = (
        ('기본', {'fields': ('slug', 'title_ko', 'title_en', 'subtitle_ko', 'subtitle_en', 'status', 'is_featured')}),
        ('분류', {'fields': ('country', 'region', 'category', 'vendor', 'tags')}),
        ('상세', {'fields': ('description_ko', 'description_en', 'cancellation_policy')}),
        ('운영', {'fields': ('base_price', 'currency', 'duration_minutes', 'min_pax', 'max_pax', 'advance_booking_days')}),
        ('지표', {'fields': ('rating_avg', 'rating_count', 'views_count', 'booking_count'), 'classes': ('collapse',)}),
        ('SEO', {'fields': ('seo_meta_title', 'seo_meta_description', 'published_at'), 'classes': ('collapse',)}),
    )


@admin.register(ExperienceEmbedding)
class ExperienceEmbeddingAdmin(admin.ModelAdmin):
    list_display = ('experience', 'model_version', 'content_hash', 'updated_at')
    search_fields = ('experience__title_ko',)
