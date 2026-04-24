from django.contrib import admin
from .models import (
    PersonalityType, PersonalityTestSession, PersonalityTestAnswer,
    CurationRequest, CurationProposal,
    ChatSession, ChatMessage, Review, Wishlist,
)


@admin.register(PersonalityType)
class PersonalityTypeAdmin(admin.ModelAdmin):
    list_display = ('code', 'name_ko', 'name_en')
    search_fields = ('code', 'name_ko')
    filter_horizontal = ('hero_experiences',)


class PersonalityTestAnswerInline(admin.TabularInline):
    model = PersonalityTestAnswer
    extra = 0


@admin.register(PersonalityTestSession)
class PersonalityTestSessionAdmin(admin.ModelAdmin):
    list_display = ('session_token', 'user', 'result_type', 'created_at', 'completed_at', 'is_opted_in_curation')
    list_filter = ('result_type', 'is_opted_in_curation')
    search_fields = ('session_token', 'user__email')
    inlines = [PersonalityTestAnswerInline]


class CurationProposalInline(admin.TabularInline):
    model = CurationProposal
    extra = 0
    filter_horizontal = ('experience_refs',)


@admin.register(CurationRequest)
class CurationRequestAdmin(admin.ModelAdmin):
    list_display = (
        'id', 'status', 'occasion', 'region', 'preferred_date_start',
        'budget_min', 'budget_max', 'assigned_curator', 'source', 'created_at',
    )
    list_filter = ('status', 'occasion', 'source')
    search_fields = ('guest_name', 'guest_phone', 'guest_email', 'free_text', 'user__email')
    autocomplete_fields = ('user', 'region', 'assigned_curator', 'personality_type')
    inlines = [CurationProposalInline]


class ChatMessageInline(admin.TabularInline):
    model = ChatMessage
    extra = 0
    readonly_fields = ('role', 'content', 'model_name', 'tokens_in', 'tokens_out', 'latency_ms', 'created_at')


@admin.register(ChatSession)
class ChatSessionAdmin(admin.ModelAdmin):
    list_display = ('session_token', 'user', 'conversion_status', 'created_at', 'ended_at')
    list_filter = ('conversion_status',)
    search_fields = ('session_token', 'user__email')
    inlines = [ChatMessageInline]


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ('booking', 'user', 'rating', 'is_public', 'created_at')
    list_filter = ('rating', 'is_public', 'is_verified')
    search_fields = ('booking__booking_number', 'title', 'content', 'user__email')


@admin.register(Wishlist)
class WishlistAdmin(admin.ModelAdmin):
    list_display = ('user', 'experience', 'created_at')
    search_fields = ('user__email', 'experience__title_ko')
    autocomplete_fields = ('user', 'experience')
