from django.db import models
from django.utils import timezone


class Booking(models.Model):
    BOOKING_TYPES = (('flight', 'Flight'), ('hotel', 'Hotel'))
    BOOKING_STATUS = (
        ('confirmed', 'Confirmed'),
        ('pending', 'Pending'),
        ('cancelled', 'Cancelled'),
    )

    booking_id = models.CharField(max_length=64, unique=True)
    user = models.ForeignKey('users.User', related_name='bookings', on_delete=models.SET_NULL, null=True)
    booking_type = models.CharField(max_length=16, choices=BOOKING_TYPES)
    
    # References to actual items
    flight = models.ForeignKey('flights.Flight', null=True, blank=True, on_delete=models.SET_NULL)
    hotel = models.ForeignKey('hotels.Hotel', null=True, blank=True, on_delete=models.SET_NULL)
    selected_room_type = models.CharField(max_length=64, null=True, blank=True)
    
    # Search and booking details
    search_details = models.JSONField(default=dict, blank=True)
    amount_paid = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    currency = models.CharField(max_length=3, default='INR')
    
    # Payment info
    payment_method = models.CharField(max_length=64, blank=True, null=True)
    payment_status = models.CharField(max_length=32, default='success')
    booking_status = models.CharField(max_length=32, choices=BOOKING_STATUS, default='confirmed')
    
    booking_date_time = models.DateTimeField(default=timezone.now)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.booking_id

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', '-created_at']),
            models.Index(fields=['booking_status']),
        ]
