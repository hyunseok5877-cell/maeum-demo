from django.contrib import admin
from .models import Booking, BookingItem, Payment, Refund


class BookingItemInline(admin.TabularInline):
    model = BookingItem
    extra = 0
    autocomplete_fields = ('experience', 'option')


class PaymentInline(admin.TabularInline):
    model = Payment
    extra = 0
    readonly_fields = ('provider_tx_id', 'idempotency_key', 'paid_at', 'refunded_at')


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = (
        'booking_number', 'user', 'status', 'scheduled_at',
        'pax_count', 'total_amount', 'curator', 'created_at',
    )
    list_filter = ('status',)
    date_hierarchy = 'scheduled_at'
    search_fields = ('booking_number', 'user__email', 'user__display_name')
    autocomplete_fields = ('user', 'curator')
    inlines = [BookingItemInline, PaymentInline]


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ('booking', 'provider', 'status', 'amount', 'paid_at')
    list_filter = ('provider', 'status')
    search_fields = ('booking__booking_number', 'provider_tx_id', 'idempotency_key')


@admin.register(Refund)
class RefundAdmin(admin.ModelAdmin):
    list_display = ('booking', 'amount', 'status', 'approved_by', 'created_at', 'completed_at')
    list_filter = ('status',)
    search_fields = ('booking__booking_number', 'provider_refund_id')
    autocomplete_fields = ('booking', 'payment', 'approved_by')
