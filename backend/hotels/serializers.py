from rest_framework import serializers
from .models import Hotel, HotelRoomType, HotelInventory


class HotelRoomTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = HotelRoomType
        fields = ('id', 'hotel', 'code', 'label', 'description', 'price_offset', 'default_available', 'created_at')
        read_only_fields = ('id', 'created_at')


class HotelInventorySerializer(serializers.ModelSerializer):
    room_type_label = serializers.CharField(source='room_type.label', read_only=True)

    class Meta:
        model = HotelInventory
        fields = ('id', 'hotel', 'room_type', 'room_type_label', 'available', 'last_sync_at')
        read_only_fields = ('id', 'last_sync_at')


class HotelSerializer(serializers.ModelSerializer):
    room_types = HotelRoomTypeSerializer(many=True, read_only=True)
    inventories = HotelInventorySerializer(many=True, read_only=True)

    class Meta:
        model = Hotel
        fields = (
            'id',
            'reference_id',
            'name',
            'city',
            'address',
            'price_per_night',
            'rooms_available',
            'amenities',
            'room_types',
            'inventories',
            'created_at',
            'updated_at',
        )
        read_only_fields = ('id', 'created_at', 'updated_at')
