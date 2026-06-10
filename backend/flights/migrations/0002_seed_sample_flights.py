from decimal import Decimal

from django.db import migrations


SAMPLE_FLIGHTS = [
    ('FL-1001', 'SkyBridge Airways', 'SB 201', 'New Delhi', 'Mumbai', '06:20', '08:35', 'Economy', '6200.00', '2h 15m', 18),
    ('FL-1002', 'SkyBridge Airways', 'SB 452', 'Mumbai', 'New Delhi', '17:40', '19:55', 'Business', '6800.00', '2h 15m', 11),
    ('FL-1003', 'CloudNine Air', 'CN 118', 'Bengaluru', 'Goa', '09:15', '10:40', 'Economy', '4800.00', '1h 25m', 9),
    ('FL-1004', 'CloudNine Air', 'CN 219', 'Goa', 'Bengaluru', '18:25', '19:55', 'Premium Economy', '5100.00', '1h 30m', 14),
    ('FL-1005', 'VistaJet Express', 'VX 704', 'Hyderabad', 'Kolkata', '07:50', '10:05', 'Economy', '7100.00', '2h 15m', 22),
    ('FL-1006', 'VistaJet Express', 'VX 812', 'Kolkata', 'Hyderabad', '15:35', '17:50', 'Business', '7600.00', '2h 15m', 7),
    ('FL-1007', 'Indigo Horizon', 'IH 331', 'Chennai', 'Pune', '10:10', '11:55', 'Economy', '5600.00', '1h 45m', 28),
    ('FL-1008', 'Indigo Horizon', 'IH 415', 'Pune', 'Chennai', '20:05', '21:55', 'Premium Economy', '5900.00', '1h 50m', 16),
    ('FL-1009', 'AeroVista', 'AV 602', 'Ahmedabad', 'Jaipur', '08:05', '09:25', 'Economy', '3900.00', '1h 20m', 31),
    ('FL-1010', 'AeroVista', 'AV 641', 'Jaipur', 'Ahmedabad', '19:15', '20:40', 'Economy', '4200.00', '1h 25m', 12),
    ('FL-1011', 'Nimbus Connect', 'NC 508', 'Mumbai', 'Goa', '11:30', '12:45', 'Economy', '4500.00', '1h 15m', 25),
    ('FL-1012', 'Nimbus Connect', 'NC 529', 'Goa', 'Mumbai', '16:05', '17:25', 'Business', '4700.00', '1h 20m', 19),
    ('FL-1013', 'SkyBridge Airways', 'SB 308', 'New Delhi', 'Bengaluru', '05:55', '08:45', 'Economy', '7900.00', '2h 50m', 20),
    ('FL-1014', 'CloudNine Air', 'CN 731', 'Bengaluru', 'New Delhi', '21:10', '23:55', 'Premium Economy', '8300.00', '2h 45m', 10),
    ('FL-1015', 'VistaJet Express', 'VX 266', 'Chennai', 'Kolkata', '06:45', '09:05', 'Economy', '6900.00', '2h 20m', 17),
    ('FL-1016', 'Indigo Horizon', 'IH 284', 'Kolkata', 'Chennai', '13:45', '16:05', 'Business', '7200.00', '2h 20m', 8),
    ('FL-1017', 'AeroVista', 'AV 904', 'Pune', 'Hyderabad', '07:25', '08:45', 'Economy', '4100.00', '1h 20m', 30),
    ('FL-1018', 'Nimbus Connect', 'NC 775', 'Hyderabad', 'Pune', '18:50', '20:15', 'Premium Economy', '4400.00', '1h 25m', 13),
    ('FL-1019', 'SkyBridge Airways', 'SB 517', 'Ahmedabad', 'Mumbai', '12:20', '13:35', 'Economy', '3600.00', '1h 15m', 24),
    ('FL-1020', 'CloudNine Air', 'CN 846', 'Mumbai', 'Ahmedabad', '14:10', '15:25', 'Business', '3800.00', '1h 15m', 21),
    ('FL-1021', 'VistaJet Express', 'VX 193', 'New Delhi', 'Jaipur', '09:40', '10:45', 'Economy', '3300.00', '1h 05m', 34),
    ('FL-1022', 'Indigo Horizon', 'IH 622', 'Jaipur', 'New Delhi', '17:10', '18:15', 'Premium Economy', '3500.00', '1h 05m', 15),
    ('FL-1023', 'AeroVista', 'AV 317', 'Bengaluru', 'Chennai', '06:30', '07:35', 'Economy', '3200.00', '1h 05m', 29),
    ('FL-1024', 'Nimbus Connect', 'NC 904', 'Chennai', 'Bengaluru', '22:00', '23:05', 'Business', '3400.00', '1h 05m', 18),
    ('FL-1025', 'SkyBridge Airways', 'SB 760', 'Hyderabad', 'Goa', '10:50', '12:20', 'Economy', '5200.00', '1h 30m', 23),
    ('FL-1026', 'CloudNine Air', 'CN 455', 'Goa', 'Hyderabad', '15:20', '16:50', 'Premium Economy', '5500.00', '1h 30m', 6),
    ('FL-1027', 'VistaJet Express', 'VX 520', 'Pune', 'New Delhi', '08:55', '11:05', 'Economy', '6400.00', '2h 10m', 27),
    ('FL-1028', 'Indigo Horizon', 'IH 711', 'New Delhi', 'Pune', '19:30', '21:40', 'Business', '6700.00', '2h 10m', 12),
    ('FL-1029', 'AeroVista', 'AV 230', 'Kolkata', 'Mumbai', '11:15', '14:05', 'Economy', '8100.00', '2h 50m', 14),
    ('FL-1030', 'Nimbus Connect', 'NC 681', 'Mumbai', 'Kolkata', '16:40', '19:30', 'Premium Economy', '8500.00', '2h 50m', 9),
]


def seed_sample_flights(apps, schema_editor):
    Flight = apps.get_model('flights', 'Flight')

    for (
        reference_id,
        airline,
        flight_number,
        source,
        destination,
        departure_time,
        arrival_time,
        travel_class,
        price,
        duration,
        seats_available,
    ) in SAMPLE_FLIGHTS:
        Flight.objects.update_or_create(
            reference_id=reference_id,
            defaults={
                'airline': airline,
                'flight_number': flight_number,
                'source': source,
                'destination': destination,
                'departure_time': departure_time,
                'arrival_time': arrival_time,
                'travel_class': travel_class,
                'price': Decimal(price),
                'metadata': {
                    'duration': duration,
                    'seatsAvailable': seats_available,
                },
            },
        )


def unseed_sample_flights(apps, schema_editor):
    Flight = apps.get_model('flights', 'Flight')
    Flight.objects.filter(reference_id__in=[flight[0] for flight in SAMPLE_FLIGHTS]).delete()


class Migration(migrations.Migration):
    dependencies = [
        ('flights', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(seed_sample_flights, unseed_sample_flights),
    ]
