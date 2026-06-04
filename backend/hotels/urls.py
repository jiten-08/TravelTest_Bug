from django.urls import path, include
from rest_framework import routers
from .views import HotelViewSet, HotelRoomTypeViewSet, HotelInventoryViewSet

router = routers.DefaultRouter()
router.register(r'hotels', HotelViewSet, basename='hotel')
router.register(r'room-types', HotelRoomTypeViewSet, basename='room-type')
router.register(r'inventory', HotelInventoryViewSet, basename='inventory')

urlpatterns = [
    path('', include(router.urls)),
]
