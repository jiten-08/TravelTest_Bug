from datetime import date


def parse_stay_date(value):
    if not value:
        return None

    if isinstance(value, date):
        return value

    try:
        return date.fromisoformat(str(value))
    except ValueError:
        return None


def get_stay_dates(search_details):
    details = search_details or {}
    check_in = (
        details.get('checkInDate') or
        details.get('check_in_date') or
        details.get('checkin') or
        details.get('check_in')
    )
    check_out = (
        details.get('checkOutDate') or
        details.get('check_out_date') or
        details.get('checkout') or
        details.get('check_out')
    )
    return parse_stay_date(check_in), parse_stay_date(check_out)


def stay_dates_overlap(first_check_in, first_check_out, second_check_in, second_check_out):
    if not all([first_check_in, first_check_out, second_check_in, second_check_out]):
        return False

    return first_check_in < second_check_out and second_check_in < first_check_out


def get_room_base_capacity(hotel, room_type):
    inventory = hotel.inventories.filter(room_type=room_type).first()
    inventory_available = int(inventory.available) if inventory else 0
    default_available = int(room_type.default_available or 0)
    return max(inventory_available, default_available)


def get_requested_room_count_from_details(search_details):
    try:
        room_count = int((search_details or {}).get('rooms') or 1)
    except (TypeError, ValueError):
        room_count = 1

    return max(room_count, 1)


def get_overlapping_booked_room_count(hotel, room_type_code, check_in, check_out, exclude_booking_id=None):
    if not check_in or not check_out:
        return 0

    from bookings.models import Booking

    bookings = Booking.objects.filter(
        booking_type='hotel',
        hotel=hotel,
        selected_room_type=room_type_code,
        booking_status__in=['confirmed', 'pending'],
    )

    if exclude_booking_id:
        bookings = bookings.exclude(id=exclude_booking_id)

    booked_rooms = 0
    for booking in bookings:
        booking_check_in, booking_check_out = get_stay_dates(booking.search_details)
        if stay_dates_overlap(check_in, check_out, booking_check_in, booking_check_out):
            booked_rooms += get_requested_room_count_from_details(booking.search_details)

    return booked_rooms


def get_available_room_count(hotel, room_type, check_in=None, check_out=None):
    capacity = get_room_base_capacity(hotel, room_type)
    booked_rooms = get_overlapping_booked_room_count(hotel, room_type.code, check_in, check_out)
    return max(capacity - booked_rooms, 0)


def get_total_available_room_count(hotel, check_in=None, check_out=None):
    return sum(get_available_room_count(hotel, room_type, check_in, check_out) for room_type in hotel.room_types.all())
