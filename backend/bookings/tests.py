from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from flights.models import Flight
from hotels.models import Hotel, HotelInventory, HotelRoomType


class FlightSeatDateTests(APITestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user(
            username='traveler@example.com',
            email='traveler@example.com',
            password='Password123',
        )
        self.flight = Flight.objects.create(
            reference_id='FL-TEST-1',
            airline='TravelTest Air',
            flight_number='TT101',
            source='Mumbai',
            destination='Goa',
            departure_time='10:00',
            arrival_time='11:20',
            travel_class='Economy',
            price=4500,
        )
        self.client.force_authenticate(self.user)

    def create_booking(self, departure_date, seat_number='1A'):
        return self.client.post(
            '/api/bookings/',
            {
                'booking_type': 'flight',
                'flight': self.flight.id,
                'search_details': {
                    'departureDate': departure_date,
                    'selectedSeats': [{'seatNumber': seat_number}],
                    'seatSummary': {'selectedSeatNumbers': [seat_number]},
                },
                'amount_paid': 4500,
                'currency': 'INR',
                'payment_method': 'card',
                'payment_status': 'success',
            },
            format='json',
        )

    def test_same_seat_can_be_booked_on_different_departure_dates(self):
        first_response = self.create_booking('2026-06-12')
        second_response = self.create_booking('2026-06-03')

        self.assertEqual(first_response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(second_response.status_code, status.HTTP_201_CREATED)

    def test_same_seat_is_blocked_on_same_departure_date(self):
        first_response = self.create_booking('2026-06-12')
        second_response = self.create_booking('2026-06-12')

        self.assertEqual(first_response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(second_response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('Seat(s) already booked', second_response.data['error'])

    def test_booked_seats_endpoint_filters_by_departure_date(self):
        self.create_booking('2026-06-12', '1A')
        self.create_booking('2026-06-03', '2B')

        response = self.client.get(
            '/api/bookings/booked_seats/',
            {'flight': self.flight.id, 'departure_date': '2026-06-03'},
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['seat_numbers'], ['2B'])


class HotelRoomDateTests(APITestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user(
            username='hoteltraveler@example.com',
            email='hoteltraveler@example.com',
            password='Password123',
        )
        self.hotel = Hotel.objects.create(
            reference_id='HT-TEST-1',
            name='TravelTest Stay',
            city='DateCity',
            address='Candolim, Goa',
            price_per_night=5000,
            rooms_available=1,
            amenities=['Wi-Fi'],
        )
        self.room_type = HotelRoomType.objects.create(
            hotel=self.hotel,
            code='standard',
            label='Standard Room',
            description='Comfortable stay',
            price_offset=0,
            default_available=1,
        )
        HotelInventory.objects.create(hotel=self.hotel, room_type=self.room_type, available=1)
        self.client.force_authenticate(self.user)

    def create_booking(self, check_in_date, check_out_date):
        return self.client.post(
            '/api/bookings/',
            {
                'booking_type': 'hotel',
                'hotel': self.hotel.id,
                'selected_room_type': self.room_type.code,
                'search_details': {
                    'checkInDate': check_in_date,
                    'checkOutDate': check_out_date,
                    'rooms': 1,
                    'guests': 1,
                },
                'amount_paid': 5000,
                'currency': 'INR',
                'payment_method': 'card',
                'payment_status': 'success',
            },
            format='json',
        )

    def test_same_room_can_be_booked_on_non_overlapping_stay_dates(self):
        first_response = self.create_booking('2026-06-12', '2026-06-14')
        second_response = self.create_booking('2026-06-03', '2026-06-05')

        self.assertEqual(first_response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(second_response.status_code, status.HTTP_201_CREATED)

    def test_same_room_is_blocked_on_overlapping_stay_dates(self):
        first_response = self.create_booking('2026-06-12', '2026-06-14')
        second_response = self.create_booking('2026-06-13', '2026-06-15')

        self.assertEqual(first_response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(second_response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('available for the selected dates', second_response.data['error'])

    def test_hotel_search_returns_date_aware_room_availability(self):
        self.create_booking('2026-06-12', '2026-06-14')

        booked_date_response = self.client.get(
            '/api/hotels/',
            {'city': 'DateCity', 'check_in_date': '2026-06-13', 'check_out_date': '2026-06-15'},
        )
        open_date_response = self.client.get(
            '/api/hotels/',
            {'city': 'DateCity', 'check_in_date': '2026-06-03', 'check_out_date': '2026-06-05'},
        )

        booked_date_hotel = booked_date_response.data['results'][0]
        open_date_hotel = open_date_response.data['results'][0]
        self.assertEqual(booked_date_hotel['rooms_available'], 0)
        self.assertEqual(open_date_hotel['rooms_available'], 1)
