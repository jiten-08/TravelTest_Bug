from django.db import models
from django.utils import timezone


class Payment(models.Model):
    PAYMENT_METHODS = (
        ('card', 'Credit/Debit Card'),
        ('upi', 'UPI'),
        ('netbanking', 'Net Banking'),
        ('wallet', 'Wallet'),
    )
    PAYMENT_STATUS = (
        ('success', 'Success'),
        ('pending', 'Pending'),
        ('failed', 'Failed'),
        ('refunded', 'Refunded'),
    )

    booking = models.ForeignKey('bookings.Booking', related_name='payments', on_delete=models.CASCADE)
    method = models.CharField(max_length=64, choices=PAYMENT_METHODS)
    status = models.CharField(max_length=64, choices=PAYMENT_STATUS, default='pending')
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    currency = models.CharField(max_length=3, default='INR')
    transaction_id = models.CharField(max_length=128, blank=True, null=True, unique=True)
    provider_response = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Payment for {self.booking.booking_id} - {self.status}"

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['booking', '-created_at']),
            models.Index(fields=['transaction_id']),
        ]
