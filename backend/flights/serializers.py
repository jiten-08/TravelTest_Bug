from rest_framework import serializers
from .models import Flight


class FlightSerializer(serializers.ModelSerializer):
    class Meta:
        model = Flight
        fields = (
            'id',
            'reference_id',
            'airline',
            'flight_number',
            'source',
            'destination',
            'departure_time',
            'arrival_time',
            'travel_class',
            'price',
            'metadata',
            'created_at',
            'updated_at',
        )
        read_only_fields = ('id', 'created_at', 'updated_at')
