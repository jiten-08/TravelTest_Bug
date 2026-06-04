from django.db import models


class Hotel(models.Model):
    reference_id = models.CharField(max_length=64, unique=True)
    name = models.CharField(max_length=256)
    city = models.CharField(max_length=128)
    address = models.TextField(blank=True, null=True)
    price_per_night = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    rooms_available = models.IntegerField(default=0)
    amenities = models.JSONField(default=list, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

    class Meta:
        ordering = ['-created_at']


class HotelRoomType(models.Model):
    hotel = models.ForeignKey(Hotel, related_name='room_types', on_delete=models.CASCADE)
    code = models.CharField(max_length=64)
    label = models.CharField(max_length=128)
    description = models.TextField(blank=True, null=True)
    price_offset = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    default_available = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.hotel.name} - {self.label}"

    class Meta:
        unique_together = ('hotel', 'code')


class HotelInventory(models.Model):
    hotel = models.ForeignKey(Hotel, related_name='inventories', on_delete=models.CASCADE)
    room_type = models.ForeignKey(HotelRoomType, on_delete=models.CASCADE)
    available = models.IntegerField(default=0)
    last_sync_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.hotel.name} - {self.room_type.label}: {self.available} available"

    class Meta:
        unique_together = ('hotel', 'room_type')
