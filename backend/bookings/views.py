from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db import transaction
from django.shortcuts import get_object_or_404
import uuid

from .models import Booking
from flights.models import Flight
from hotels.models import Hotel
from .serializers import BookingSerializer
from hotels.availability import get_available_room_count, get_stay_dates


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


def get_search_departure_date(search_details):
    details = search_details or {}
    return details.get('departureDate') or details.get('departure_date') or details.get('travelDate') or details.get('travel_date')


def filter_bookings_by_departure_date(bookings, departure_date):
    if not departure_date:
        return bookings

    return [booking for booking in bookings if get_search_departure_date(booking.search_details) == departure_date]


def resolve_model_id(model, value, label):
    if not value:
        return None

    if str(value).isdigit():
        obj = model.objects.filter(pk=value).first()
    else:
        obj = model.objects.filter(reference_id=value).first()

    if not obj:
        raise ValueError(f"{label} not found: {value}")

    return obj.id


def get_requested_room_count(search_details):
    try:
        room_count = int((search_details or {}).get('rooms') or 1)
    except (TypeError, ValueError):
        room_count = 1

    return max(room_count, 1)


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
        search_details = request.data.get('search_details') or {}

        # Generate booking ID if not provided
        booking_id = request.data.get('booking_id') or f"BOOK_{uuid.uuid4().hex[:8].upper()}"

        try:
            with transaction.atomic():
                flight_id = resolve_model_id(Flight, request.data.get('flight'), 'Flight') if request.data.get('flight') else None
                hotel_id = resolve_model_id(Hotel, request.data.get('hotel'), 'Hotel') if request.data.get('hotel') else None

                if booking_type == 'flight':
                    requested_seats = set()
                    requested_departure_date = get_search_departure_date(search_details)

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
                        existing_bookings = filter_bookings_by_departure_date(existing_bookings, requested_departure_date)
                        booked_seats = set()
                        for existing_booking in existing_bookings:
                            booked_seats.update(get_booking_seat_numbers(existing_booking))

                        duplicate_seats = sorted(requested_seats.intersection(booked_seats))
                        if duplicate_seats:
                            return Response(
                                {'error': f"Seat(s) already booked: {', '.join(duplicate_seats)}"},
                                status=status.HTTP_400_BAD_REQUEST,
                            )

                selected_room_type = request.data.get('selected_room_type')
                if booking_type == 'hotel' and hotel_id and selected_room_type:
                    hotel = Hotel.objects.prefetch_related('room_types', 'inventories').get(id=hotel_id)
                    room_type = hotel.room_types.filter(code=selected_room_type).first()
                    if room_type:
                        rooms_requested = get_requested_room_count(search_details)
                        check_in, check_out = get_stay_dates(search_details)
                        available_rooms = get_available_room_count(hotel, room_type, check_in, check_out)
                        if available_rooms < rooms_requested:
                            return Response(
                                {'error': f"Only {available_rooms} {room_type.label} room(s) available for the selected dates"},
                                status=status.HTTP_400_BAD_REQUEST,
                            )

                # Create booking
                booking = Booking.objects.create(
                    booking_id=booking_id,
                    user=user,
                    booking_type=booking_type,
                    flight_id=flight_id,
                    hotel_id=hotel_id,
                    selected_room_type=selected_room_type,
                    search_details=search_details,
                    amount_paid=request.data.get('amount_paid', 0),
                    currency=request.data.get('currency', 'INR'),
                    payment_method=request.data.get('payment_method'),
                    payment_status=request.data.get('payment_status', 'success'),
                    booking_status='confirmed',
                )

                serializer = self.get_serializer(booking)
                return Response(serializer.data, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def booked_seats(self, request):
        flight = request.query_params.get('flight')
        if not flight:
            return Response({'error': 'flight query parameter is required'}, status=status.HTTP_400_BAD_REQUEST)

        departure_date = (
            request.query_params.get('departure_date') or
            request.query_params.get('departureDate') or
            request.query_params.get('travel_date') or
            request.query_params.get('travelDate')
        )

        try:
            flight_id = resolve_model_id(Flight, flight, 'Flight')
        except ValueError as error:
            return Response({'error': str(error)}, status=status.HTTP_400_BAD_REQUEST)

        bookings = Booking.objects.filter(
            booking_type='flight',
            flight_id=flight_id,
            booking_status__in=['confirmed', 'pending'],
        )
        bookings = filter_bookings_by_departure_date(bookings, departure_date)
        seat_numbers = set()

        for booking in bookings:
            seat_numbers.update(get_booking_seat_numbers(booking))

        return Response({'flight': flight_id, 'departure_date': departure_date, 'seat_numbers': sorted(seat_numbers)})

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
