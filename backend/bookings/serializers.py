from rest_framework import serializers
from .models import Booking


class BookingSerializer(serializers.ModelSerializer):
    flight_detail = serializers.SerializerMethodField()
    hotel_detail = serializers.SerializerMethodField()
    selected_room_type_label = serializers.SerializerMethodField()

    class Meta:
        model = Booking
        fields = (
            'id',
            'booking_id',
            'user',
            'booking_type',
            'flight',
            'flight_detail',
            'hotel',
            'hotel_detail',
            'selected_room_type',
            'selected_room_type_label',
            'search_details',
            'amount_paid',
            'currency',
            'payment_method',
            'payment_status',
            'booking_status',
            'booking_date_time',
            'created_at',
            'updated_at',
        )
        read_only_fields = ('id', 'booking_id', 'created_at', 'updated_at')

    def get_flight_detail(self, obj):
        if obj.flight:
            return {
                'id': obj.flight.id,
                'airline': obj.flight.airline,
                'flight_number': obj.flight.flight_number,
                'source': obj.flight.source,
                'destination': obj.flight.destination,
                'departure_time': obj.flight.departure_time,
                'arrival_time': obj.flight.arrival_time,
                'price': float(obj.flight.price),
            }
        return None

    def get_hotel_detail(self, obj):
        if obj.hotel:
            return {
                'id': obj.hotel.id,
                'name': obj.hotel.name,
                'city': obj.hotel.city,
                'address': obj.hotel.address,
                'amenities': obj.hotel.amenities,
                'price_per_night': float(obj.hotel.price_per_night),
            }
        return None

    def get_selected_room_type_label(self, obj):
        if not obj.hotel or not obj.selected_room_type:
            return None

        room_type = obj.hotel.room_types.filter(code=obj.selected_room_type).first()
        return room_type.label if room_type else obj.selected_room_type
