from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import Flight
from .serializers import FlightSerializer


class FlightViewSet(viewsets.ModelViewSet):
    queryset = Flight.objects.all()
    serializer_class = FlightSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['source', 'destination', 'travel_class']
    search_fields = ['airline', 'flight_number', 'source', 'destination']
    ordering_fields = ['departure_time', 'price', 'created_at']
    ordering = ['-created_at']
