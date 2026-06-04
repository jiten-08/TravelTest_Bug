from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db import transaction
from django.shortcuts import get_object_or_404
from django.utils import timezone
import uuid

from .models import Booking
from .serializers import BookingSerializer
from hotels.models import HotelInventory


def get_booking_seat_numbers(booking):
    search_details = booking.search_details or {}
    selected_seats = search_details.get('selectedSeats') or []
    seat_summary = search_details.get('seatSummary') or {}
    seat_numbers = []

    for seat in selected_seats:
        if isinstance(seat, dict) and seat.get('seatNumber'):
            seat_numbers.append(seat.get('seatNumber'))
        elif isinstance(seat, str):
            seat_numbers.append(seat)

    seat_numbers.extend(seat_summary.get('selectedSeatNumbers') or [])
    return sorted({seat for seat in seat_numbers if seat})


class BookingViewSet(viewsets.ModelViewSet):
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Users see only their own bookings; staff see all."""
        user = self.request.user
        if user.is_staff:
            return Booking.objects.all()
        return Booking.objects.filter(user=user)

    def get_object(self):
        """Allow routes to look up bookings by database id or public booking_id."""
        lookup_value = self.kwargs.get(self.lookup_url_kwarg or self.lookup_field)
        queryset = self.filter_queryset(self.get_queryset())

        if str(lookup_value).isdigit():
            booking = queryset.filter(pk=lookup_value).first()
            if booking:
                self.check_object_permissions(self.request, booking)
                return booking

        booking = get_object_or_404(queryset, booking_id=lookup_value)
        self.check_object_permissions(self.request, booking)
        return booking

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        """Create booking with atomic inventory decrement for hotels."""
        user = request.user
        booking_type = request.data.get('booking_type')

        # Generate booking ID if not provided
        booking_id = request.data.get('booking_id') or f"BOOK_{uuid.uuid4().hex[:8].upper()}"

        try:
            with transaction.atomic():
                if booking_type == 'flight':
                    flight_id = request.data.get('flight')
                    search_details = request.data.get('search_details') or {}
                    requested_seats = set()

                    for seat in search_details.get('selectedSeats') or []:
                        if isinstance(seat, dict) and seat.get('seatNumber'):
                            requested_seats.add(seat.get('seatNumber'))
                        elif isinstance(seat, str):
                            requested_seats.add(seat)

                    requested_seats.update(search_details.get('seatSummary', {}).get('selectedSeatNumbers') or [])

                    if requested_seats:
                        existing_bookings = Booking.objects.select_for_update().filter(
                            booking_type='flight',
                            flight_id=flight_id,
                            booking_status__in=['confirmed', 'pending'],
                        )
                        booked_seats = set()
                        for existing_booking in existing_bookings:
                            booked_seats.update(get_booking_seat_numbers(existing_booking))

                        duplicate_seats = sorted(requested_seats.intersection(booked_seats))
                        if duplicate_seats:
                            return Response(
                                {'error': f"Seat(s) already booked: {', '.join(duplicate_seats)}"},
                                status=status.HTTP_400_BAD_REQUEST,
                            )

                # Create booking
                booking = Booking.objects.create(
                    booking_id=booking_id,
                    user=user,
                    booking_type=booking_type,
                    flight_id=request.data.get('flight'),
                    hotel_id=request.data.get('hotel'),
                    selected_room_type=request.data.get('selected_room_type'),
                    search_details=request.data.get('search_details', {}),
                    amount_paid=request.data.get('amount_paid', 0),
                    currency=request.data.get('currency', 'INR'),
                    payment_method=request.data.get('payment_method'),
                    payment_status=request.data.get('payment_status', 'success'),
                    booking_status='confirmed',
                )

                # Decrement hotel inventory if applicable
                if booking_type == 'hotel' and booking.hotel and booking.selected_room_type:
                    room_type_code = booking.selected_room_type
                    room_type = booking.hotel.room_types.filter(code=room_type_code).first()
                    if room_type:
                        inventory = HotelInventory.objects.select_for_update().get(
                            hotel=booking.hotel,
                            room_type=room_type
                        )
                        if inventory.available > 0:
                            inventory.available -= 1
                            inventory.save()
                        else:
                            raise Exception(f"No {room_type_code} rooms available")

                serializer = self.get_serializer(booking)
                return Response(serializer.data, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def booked_seats(self, request):
        flight_id = request.query_params.get('flight')
        if not flight_id:
            return Response({'error': 'flight query parameter is required'}, status=status.HTTP_400_BAD_REQUEST)

        bookings = Booking.objects.filter(
            booking_type='flight',
            flight_id=flight_id,
            booking_status__in=['confirmed', 'pending'],
        )
        seat_numbers = set()

        for booking in bookings:
            seat_numbers.update(get_booking_seat_numbers(booking))

        return Response({'flight': flight_id, 'seat_numbers': sorted(seat_numbers)})

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def cancel(self, request, pk=None):
        """
        Cancel a booking and restore inventory.
        Only allowed if booking is not already cancelled.
        """
        booking = self.get_object()

        # Check permission
        if booking.user != request.user and not request.user.is_staff:
            return Response(
                {'error': 'You do not have permission to cancel this booking'},
                status=status.HTTP_403_FORBIDDEN
            )

        if booking.booking_status == 'cancelled':
            return Response(
                {'error': 'Booking is already cancelled'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            with transaction.atomic():
                # Restore hotel inventory
                if booking.booking_type == 'hotel' and booking.hotel and booking.selected_room_type:
                    room_type = booking.hotel.room_types.filter(code=booking.selected_room_type).first()
                    if room_type:
                        inventory = HotelInventory.objects.select_for_update().get(
                            hotel=booking.hotel,
                            room_type=room_type
                        )
                        inventory.available += 1
                        inventory.save()

                # Update booking status
                booking.booking_status = 'cancelled'
                booking.save()

                serializer = self.get_serializer(booking)
                return Response(serializer.data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
