from django.db import models
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    ROLE_CHOICES = (
        ('customer', 'Customer'),
        ('admin', 'Admin'),
        ('support', 'Support'),
    )
    
    phone = models.CharField(max_length=32, blank=True, null=True)
    gender = models.CharField(max_length=20, blank=True, null=True)
    role = models.CharField(max_length=32, choices=ROLE_CHOICES, default='customer')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.first_name} {self.last_name}" or self.username

    class Meta:
        ordering = ['-created_at']
