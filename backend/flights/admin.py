from django.contrib import admin
from .models import Flight


@admin.register(Flight)
class FlightAdmin(admin.ModelAdmin):
    list_display = ('reference_id', 'airline', 'flight_number', 'source', 'destination', 'price', 'created_at')
    list_filter = ('airline', 'travel_class', 'created_at')
    search_fields = ('airline', 'flight_number', 'source', 'destination')
    readonly_fields = ('created_at', 'updated_at')
