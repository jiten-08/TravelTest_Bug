import json
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from flights.models import Flight

def seed_flights():
    flights_json_path = os.path.join('..', 'frontend', 'src', 'data', 'flights.json')
    if not os.path.exists(flights_json_path):
        print(f"Path not found: {flights_json_path}")
        return

    with open(flights_json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
        
    count = 0
    for item in data:
        flight, created = Flight.objects.get_or_create(
            reference_id=item['id'],
            defaults={
                'airline': item['airline'],
                'flight_number': item['flightNumber'],
                'source': item['source'],
                'destination': item['destination'],
                'departure_time': item['departureTime'],
                'arrival_time': item['arrivalTime'],
                'travel_class': item['travelClass'],
                'price': item['price'],
                'metadata': {
                    'duration': item.get('duration', ''),
                    'seatsAvailable': item.get('seatsAvailable', 0)
                }
            }
        )
        if created:
            count += 1
            
    print(f"Successfully seeded {count} flights into the database.")

if __name__ == '__main__':
    seed_flights()
