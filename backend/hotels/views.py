from rest_framework import viewsets, filters, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django_filters.rest_framework import DjangoFilterBackend
from .models import Hotel, HotelRoomType, HotelInventory
from .serializers import HotelSerializer, HotelRoomTypeSerializer, HotelInventorySerializer


class HotelViewSet(viewsets.ModelViewSet):
    queryset = Hotel.objects.prefetch_related('room_types', 'inventories')
    serializer_class = HotelSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['city']
    search_fields = ['name', 'city', 'address']
    ordering_fields = ['name', 'price_per_night', 'created_at']
    ordering = ['-created_at']

    @action(detail=True, methods=['get'])
    def room_types(self, request, pk=None):
        hotel = self.get_object()
        room_types = hotel.room_types.all()
        serializer = HotelRoomTypeSerializer(room_types, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def inventory(self, request, pk=None):
        hotel = self.get_object()
        inventories = hotel.inventories.all()
        serializer = HotelInventorySerializer(inventories, many=True)
        return Response(serializer.data)


class HotelRoomTypeViewSet(viewsets.ModelViewSet):
    queryset = HotelRoomType.objects.all()
    serializer_class = HotelRoomTypeSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['hotel', 'code']


class HotelInventoryViewSet(viewsets.ModelViewSet):
    queryset = HotelInventory.objects.select_related('hotel', 'room_type')
    serializer_class = HotelInventorySerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['hotel', 'room_type']
