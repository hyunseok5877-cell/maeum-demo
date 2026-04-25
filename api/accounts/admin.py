from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import (
    User, UserProfile, MembershipTier, Membership, Curator, AuditLog,
    SocialIdentity, MemberIntakeSurvey,
)


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('email', 'display_name', 'status', 'is_staff', 'last_login')
    search_fields = ('email', 'display_name', 'phone')
    list_filter = ('status', 'is_staff', 'is_superuser', 'oauth_provider')
    fieldsets = BaseUserAdmin.fieldsets + (
        ('마음 프로필', {'fields': ('display_name', 'phone', 'status', 'oauth_provider', 'oauth_id', 'last_login_at')}),
    )


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'gender', 'birth_year', 'personality_type', 'total_booking_amount')
    search_fields = ('user__email', 'user__display_name', 'vip_note')
    autocomplete_fields = ('user', 'country', 'personality_type')
    filter_horizontal = ('preferred_categories',)


@admin.register(MembershipTier)
class MembershipTierAdmin(admin.ModelAdmin):
    list_display = ('code', 'name', 'annual_fee', 'priority_queue_weight')
    search_fields = ('code', 'name')


@admin.register(Membership)
class MembershipAdmin(admin.ModelAdmin):
    list_display = ('user', 'tier', 'status', 'started_at', 'ends_at', 'auto_renew')
    list_filter = ('tier', 'status')
    autocomplete_fields = ('user', 'tier')


@admin.register(Curator)
class CuratorAdmin(admin.ModelAdmin):
    list_display = ('display_name', 'admin_user', 'signature_color')
    search_fields = ('display_name', 'admin_user__email')
    autocomplete_fields = ('admin_user',)
    filter_horizontal = ('specialty_categories',)


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ('created_at', 'actor', 'action', 'entity_type', 'entity_id', 'ip_address')
    list_filter = ('action', 'entity_type')
    search_fields = ('entity_type', 'entity_id')
    readonly_fields = tuple(f.name for f in AuditLog._meta.fields)


@admin.register(SocialIdentity)
class SocialIdentityAdmin(admin.ModelAdmin):
    list_display = ('user', 'provider', 'provider_uid', 'email_at_signup', 'created_at')
    list_filter = ('provider',)
    search_fields = ('user__email', 'provider_uid', 'email_at_signup', 'raw_name')
    autocomplete_fields = ('user',)


@admin.register(MemberIntakeSurvey)
class MemberIntakeSurveyAdmin(admin.ModelAdmin):
    list_display = (
        'user', 'full_name', 'age_range', 'residence_city',
        'marital_status', 'annual_income_range', 'asset_range',
        'budget_per_experience', 'consent_privacy', 'completed_at',
    )
    list_filter = (
        'age_range', 'marital_status', 'annual_income_range',
        'asset_range', 'budget_per_experience', 'referral_source',
        'consent_privacy', 'consent_marketing',
    )
    search_fields = ('user__email', 'full_name', 'occupation', 'company')
    autocomplete_fields = ('user',)
    filter_horizontal = ('preferred_categories',)
    fieldsets = (
        ('연결', {'fields': ('user', 'full_name', 'completed_at')}),
        ('기본 정보', {
            'fields': ('age_range', 'residence_city', 'residence_district')
        }),
        ('직업·가정', {
            'fields': ('occupation', 'company', 'marital_status')
        }),
        ('🔒 민감 — 자산·소득', {
            'fields': ('annual_income_range', 'asset_range'),
            'classes': ('collapse',),
        }),
        ('선호', {
            'fields': ('preferred_categories', 'budget_per_experience', 'preferred_months')
        }),
        ('동행·특별 일정', {
            'fields': ('companion_types', 'special_occasions')
        }),
        ('유입', {
            'fields': ('referral_source', 'referral_detail')
        }),
        ('동의', {
            'fields': ('consent_privacy', 'consent_marketing', 'consent_profiling')
        }),
    )
