from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, UserProfile, MembershipTier, Membership, Curator, AuditLog


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
