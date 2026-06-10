from rest_framework import serializers
from .models import Hotel, HotelRoomType, HotelInventory
from .availability import get_available_room_count, get_total_available_room_count, parse_stay_date


class HotelRoomTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = HotelRoomType
        fields = ('id', 'hotel', 'code', 'label', 'description', 'price_offset', 'default_available', 'created_at')
        read_only_fields = ('id', 'created_at')


class HotelInventorySerializer(serializers.ModelSerializer):
    room_type_label = serializers.CharField(source='room_type.label', read_only=True)
    available = serializers.SerializerMethodField()

    class Meta:
        model = HotelInventory
        fields = ('id', 'hotel', 'room_type', 'room_type_label', 'available', 'last_sync_at')
        read_only_fields = ('id', 'last_sync_at')

    def get_available(self, obj):
        check_in = parse_stay_date(self.context.get('check_in_date'))
        check_out = parse_stay_date(self.context.get('check_out_date'))
        return get_available_room_count(obj.hotel, obj.room_type, check_in, check_out)


class HotelSerializer(serializers.ModelSerializer):
    room_types = HotelRoomTypeSerializer(many=True, read_only=True)
    inventories = HotelInventorySerializer(many=True, read_only=True)
    rooms_available = serializers.SerializerMethodField()

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

    def get_rooms_available(self, obj):
        check_in = parse_stay_date(self.context.get('check_in_date'))
        check_out = parse_stay_date(self.context.get('check_out_date'))
        return get_total_available_room_count(obj, check_in, check_out)
