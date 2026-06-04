from decimal import Decimal

from django.db import migrations


SAMPLE_HOTELS = [
    {
        'reference_id': 'HT-2001',
        'name': 'Harbor View Suites',
        'city': 'Mumbai',
        'address': 'Marine Drive, Mumbai, Maharashtra',
        'price_per_night': Decimal('5400.00'),
        'rooms_available': 12,
        'amenities': ['Wi-Fi', 'Breakfast', 'Pool', 'Sea view'],
    },
    {
        'reference_id': 'HT-2002',
        'name': 'Palm Grove Resort',
        'city': 'Goa',
        'address': 'Candolim Beach Road, Goa',
        'price_per_night': Decimal('7600.00'),
        'rooms_available': 8,
        'amenities': ['Wi-Fi', 'Breakfast', 'Beach access', 'Spa', 'Airport shuttle'],
    },
    {
        'reference_id': 'HT-2003',
        'name': 'Metro Grand Hotel',
        'city': 'New Delhi',
        'address': 'Connaught Place, New Delhi',
        'price_per_night': Decimal('4300.00'),
        'rooms_available': 18,
        'amenities': ['Wi-Fi', 'Restaurant', 'Gym', 'Airport shuttle'],
    },
    {
        'reference_id': 'HT-2004',
        'name': 'Azure Bay Retreat',
        'city': 'Goa',
        'address': 'Calangute, Goa',
        'price_per_night': Decimal('6900.00'),
        'rooms_available': 15,
        'amenities': ['Wi-Fi', 'Pool', 'Beach access', 'Restaurant'],
    },
    {
        'reference_id': 'HT-2005',
        'name': 'Royal Pink City Palace',
        'city': 'Jaipur',
        'address': 'MI Road, Jaipur, Rajasthan',
        'price_per_night': Decimal('8900.00'),
        'rooms_available': 6,
        'amenities': ['Wi-Fi', 'Breakfast', 'Spa', 'Restaurant', 'Pool'],
    },
    {
        'reference_id': 'HT-2006',
        'name': 'Tech Park Residency',
        'city': 'Bengaluru',
        'address': 'Whitefield Main Road, Bengaluru, Karnataka',
        'price_per_night': Decimal('3900.00'),
        'rooms_available': 24,
        'amenities': ['Wi-Fi', 'Gym', 'Restaurant', 'Parking'],
    },
    {
        'reference_id': 'HT-2007',
        'name': 'Skyline Business Inn',
        'city': 'Hyderabad',
        'address': 'HITEC City, Hyderabad, Telangana',
        'price_per_night': Decimal('4700.00'),
        'rooms_available': 20,
        'amenities': ['Wi-Fi', 'Breakfast', 'Gym', 'Airport shuttle'],
    },
    {
        'reference_id': 'HT-2008',
        'name': 'Eastern Pearl Hotel',
        'city': 'Kolkata',
        'address': 'Park Street, Kolkata, West Bengal',
        'price_per_night': Decimal('3600.00'),
        'rooms_available': 26,
        'amenities': ['Wi-Fi', 'Restaurant', 'Parking', 'Breakfast'],
    },
    {
        'reference_id': 'HT-2009',
        'name': 'Marina Coast Hotel',
        'city': 'Chennai',
        'address': 'Triplicane, Chennai, Tamil Nadu',
        'price_per_night': Decimal('5200.00'),
        'rooms_available': 14,
        'amenities': ['Wi-Fi', 'Sea view', 'Restaurant', 'Gym'],
    },
    {
        'reference_id': 'HT-2010',
        'name': 'Riverside Comfort Stay',
        'city': 'Pune',
        'address': 'Koregaon Park, Pune, Maharashtra',
        'price_per_night': Decimal('4100.00'),
        'rooms_available': 21,
        'amenities': ['Wi-Fi', 'Breakfast', 'Parking', 'Restaurant'],
    },
]

ROOM_TYPES = [
    {
        'code': 'standard',
        'label': 'Standard Room',
        'description': 'Comfortable AC room with Wi-Fi, clean bedding, and essential amenities.',
        'price_offset': Decimal('0.00'),
        'availability_ratio': 0.50,
        'minimum_available': 4,
    },
    {
        'code': 'deluxe',
        'label': 'Deluxe Room',
        'description': 'Spacious room with premium bedding, better views, and breakfast-friendly amenities.',
        'price_offset': Decimal('1600.00'),
        'availability_ratio': 0.30,
        'minimum_available': 2,
    },
    {
        'code': 'luxury',
        'label': 'Luxury Suite',
        'description': 'Premium suite with extra space, upgraded interiors, and priority service.',
        'price_offset': Decimal('3200.00'),
        'availability_ratio': 0.20,
        'minimum_available': 1,
    },
]


def seed_hotels_rooms_inventory(apps, schema_editor):
    Hotel = apps.get_model('hotels', 'Hotel')
    HotelRoomType = apps.get_model('hotels', 'HotelRoomType')
    HotelInventory = apps.get_model('hotels', 'HotelInventory')

    for hotel_data in SAMPLE_HOTELS:
        hotel, _ = Hotel.objects.update_or_create(
            reference_id=hotel_data['reference_id'],
            defaults={
                'name': hotel_data['name'],
                'city': hotel_data['city'],
                'address': hotel_data['address'],
                'price_per_night': hotel_data['price_per_night'],
                'rooms_available': hotel_data['rooms_available'],
                'amenities': hotel_data['amenities'],
            },
        )

        total_rooms = max(int(hotel.rooms_available or 0), 1)
        for room_data in ROOM_TYPES:
            available = max(int(round(total_rooms * room_data['availability_ratio'])), room_data['minimum_available'])
            room_type, _ = HotelRoomType.objects.update_or_create(
                hotel=hotel,
                code=room_data['code'],
                defaults={
                    'label': room_data['label'],
                    'description': room_data['description'],
                    'price_offset': room_data['price_offset'],
                    'default_available': available,
                },
            )
            HotelInventory.objects.update_or_create(
                hotel=hotel,
                room_type=room_type,
                defaults={'available': available},
            )


def unseed_hotels_rooms_inventory(apps, schema_editor):
    Hotel = apps.get_model('hotels', 'Hotel')
    Hotel.objects.filter(reference_id__in=[hotel['reference_id'] for hotel in SAMPLE_HOTELS]).delete()


class Migration(migrations.Migration):
    dependencies = [
        ('hotels', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(seed_hotels_rooms_inventory, unseed_hotels_rooms_inventory),
    ]
