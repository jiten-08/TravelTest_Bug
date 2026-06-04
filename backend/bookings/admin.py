from django.contrib import admin
from .models import Booking


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ('booking_id', 'user', 'booking_type', 'amount_paid', 'booking_status', 'booking_date_time', 'created_at')
    list_filter = ('booking_type', 'booking_status', 'payment_status', 'created_at')
    search_fields = ('booking_id', 'user__username', 'user__email')
    readonly_fields = ('booking_id', 'created_at', 'updated_at')
    fieldsets = (
        ('Booking Info', {'fields': ('booking_id', 'user', 'booking_type', 'booking_status')}),
        ('Items', {'fields': ('flight', 'hotel', 'selected_room_type')}),
        ('Payment', {'fields': ('amount_paid', 'currency', 'payment_method', 'payment_status')}),
        ('Details', {'fields': ('search_details', 'booking_date_time')}),
        ('Timestamps', {'fields': ('created_at', 'updated_at'), 'classes': ('collapse',)}),
    )
