from django.contrib import admin
from .models import Payment


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ('booking', 'method', 'status', 'amount', 'currency', 'transaction_id', 'created_at')
    list_filter = ('method', 'status', 'created_at')
    search_fields = ('booking__booking_id', 'transaction_id')
    readonly_fields = ('created_at', 'updated_at')
