import json
from pathlib import Path
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = 'Load sample data from frontend src/data JSON files'

    hotel_room_types = [
        {
            'code': 'standard',
            'label': 'Standard Room',
            'description': 'Comfortable room with Wi-Fi, air conditioning, and essential amenities.',
            'price_offset': 0,
            'availability_ratio': 0.50,
            'minimum_available': 4,
        },
        {
            'code': 'deluxe',
            'label': 'Deluxe Room',
            'description': 'Larger room with premium bedding, city or garden view, and breakfast-friendly amenities.',
            'price_offset': 1600,
            'availability_ratio': 0.30,
            'minimum_available': 2,
        },
        {
            'code': 'luxury',
            'label': 'Luxury Suite',
            'description': 'Premium suite with extra space, upgraded interiors, and priority service.',
            'price_offset': 3200,
            'availability_ratio': 0.20,
            'minimum_available': 1,
        },
    ]

    def sync_hotel_inventory(self, hotel, HotelRoomType, HotelInventory):
        total_rooms = max(int(hotel.rooms_available or 0), 1)

        for room in self.hotel_room_types:
            available = max(int(round(total_rooms * room['availability_ratio'])), room['minimum_available'])
            room_type, _ = HotelRoomType.objects.update_or_create(
                hotel=hotel,
                code=room['code'],
                defaults={
                    'label': room['label'],
                    'description': room['description'],
                    'price_offset': room['price_offset'],
                    'default_available': available,
                },
            )
            HotelInventory.objects.update_or_create(
                hotel=hotel,
                room_type=room_type,
                defaults={'available': available},
            )

    def handle(self, *args, **options):
        base = Path(__file__).resolve().parents[4] / 'frontend' / 'src' / 'data'
        self.stdout.write(f'Looking for sample files in {base}')

        from hotels.models import Hotel, HotelRoomType, HotelInventory
        from flights.models import Flight
        from users.models import User

        # Hotels
        hotels_file = base / 'hotels.json'
        if hotels_file.exists():
            with open(hotels_file, 'r', encoding='utf-8') as fh:
                hotels = json.load(fh)
            for h in hotels:
                hotel, _ = Hotel.objects.update_or_create(reference_id=h.get('id'), defaults={
                    'name': h.get('name'),
                    'city': h.get('city'),
                    'address': h.get('address') or '',
                    'price_per_night': h.get('pricePerNight') or 0,
                    'rooms_available': h.get('roomsAvailable') or 0,
                    'amenities': h.get('amenities') or [],
                })
                self.sync_hotel_inventory(hotel, HotelRoomType, HotelInventory)
            self.stdout.write(self.style.SUCCESS(f'Loaded {hotels_file.name}'))
        else:
            self.stdout.write(f'{hotels_file} not found, skipping')

        # Flights
        flights_file = base / 'flights.json'
        if flights_file.exists():
            with open(flights_file, 'r', encoding='utf-8') as fh:
                flights = json.load(fh)
            for f in flights:
                try:
                    Flight.objects.update_or_create(reference_id=f.get('id'), defaults={
                        'airline': f.get('airline') or 'Flight',
                        'flight_number': f.get('flightNumber'),
                        'source': f.get('source'),
                        'destination': f.get('destination'),
                        'departure_time': f.get('departureTime'),
                        'arrival_time': f.get('arrivalTime'),
                        'travel_class': f.get('travelClass'),
                        'price': f.get('price') or 0,
                    })
                except Exception as e:
                    self.stdout.write(self.style.WARNING(f'Error loading flight {f.get("id")}: {e}'))
            self.stdout.write(self.style.SUCCESS(f'Loaded {flights_file.name}'))
        else:
            self.stdout.write(f'{flights_file} not found, skipping')

        # Users
        users_file = base / 'users.json'
        if users_file.exists():
            with open(users_file, 'r', encoding='utf-8') as fh:
                users = json.load(fh)
            for u in users:
                User.objects.update_or_create(username=u.get('email'), defaults={
                    'first_name': u.get('firstName') or '',
                    'last_name': u.get('lastName') or '',
                    'email': u.get('email'),
                })
            self.stdout.write(self.style.SUCCESS(f'Loaded {users_file.name}'))
        else:
            self.stdout.write(f'{users_file} not found, skipping')

        self.stdout.write(self.style.SUCCESS('Sample data load complete.'))
