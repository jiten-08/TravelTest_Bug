from django.contrib import admin
from .models import Hotel, HotelRoomType, HotelInventory


@admin.register(Hotel)
class HotelAdmin(admin.ModelAdmin):
    list_display = ('reference_id', 'name', 'city', 'price_per_night', 'rooms_available', 'created_at')
    list_filter = ('city', 'created_at')
    search_fields = ('name', 'city', 'address')
    readonly_fields = ('created_at', 'updated_at')


@admin.register(HotelRoomType)
class RoomTypeAdmin(admin.ModelAdmin):
    list_display = ('hotel', 'code', 'label', 'price_offset', 'default_available')
    list_filter = ('hotel', 'created_at')
    search_fields = ('hotel__name', 'label')


@admin.register(HotelInventory)
class InventoryAdmin(admin.ModelAdmin):
    list_display = ('hotel', 'room_type', 'available', 'last_sync_at')
    list_filter = ('hotel', 'room_type', 'last_sync_at')
    search_fields = ('hotel__name', 'room_type__label')
