from rest_framework import serializers
from .models import Payment


class PaymentSerializer(serializers.ModelSerializer):
    booking_id = serializers.CharField(source='booking.booking_id', read_only=True)
    booking_type = serializers.CharField(source='booking.booking_type', read_only=True)

    class Meta:
        model = Payment
        fields = (
            'id',
            'booking',
            'booking_id',
            'booking_type',
            'method',
            'status',
            'amount',
            'currency',
            'transaction_id',
            'provider_response',
            'created_at',
            'updated_at',
        )
        read_only_fields = ('id', 'created_at', 'updated_at')
