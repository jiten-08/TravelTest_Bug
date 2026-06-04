from django.db import models


class Flight(models.Model):
    reference_id = models.CharField(max_length=64, unique=True)
    airline = models.CharField(max_length=128)
    flight_number = models.CharField(max_length=32, blank=True, null=True)
    source = models.CharField(max_length=64, blank=True, null=True)
    destination = models.CharField(max_length=64, blank=True, null=True)
    departure_time = models.CharField(max_length=64, blank=True, null=True)
    arrival_time = models.CharField(max_length=64, blank=True, null=True)
    travel_class = models.CharField(max_length=32, blank=True, null=True)
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.airline} {self.flight_number or self.reference_id}"

    class Meta:
        ordering = ['-created_at']
