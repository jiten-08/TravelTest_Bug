import { useEffect, useMemo, useState } from 'react';
import Badge from '../components/Badge.jsx';
import Button from '../components/Button.jsx';
import EmptyState from '../components/EmptyState.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import FancySelect from '../components/FancySelect.jsx';
import sampleBookings from '../data/bookings.json';
import flights from '../data/flights.json';
import hotels from '../data/hotels.json';
import images from '../data/images.js';
import users from '../data/users.json';

function getStoredJson(key) {
  const value = localStorage.getItem(key);
  return value ? JSON.parse(value) : null;
}

function saveLocalBookings(bookings) {
  localStorage.setItem('traveltest_booking_history', JSON.stringify(bookings));
}

function readLocalBookings() {
  const value = localStorage.getItem('traveltest_booking_history');
  return value ? JSON.parse(value) : [];
}

function getHotelInventory(hotelId) {
  const storedInventory = getStoredJson('traveltest_hotel_inventory') || {};
  return storedInventory[hotelId] || {};
}

function updateHotelInventory(hotelId, roomTypeId, quantityChange) {
  const storageKey = 'traveltest_hotel_inventory';
  const storedInventory = getStoredJson(storageKey) || {};
  const hotelInventory = storedInventory[hotelId] || {};
  hotelInventory[roomTypeId] = Math.max(0, (hotelInventory[roomTypeId] || 0) + quantityChange);
  storedInventory[hotelId] = hotelInventory;
  localStorage.setItem(storageKey, JSON.stringify(storedInventory));
  return hotelInventory;
}

function formatDate(value) {
  if (!value) {
    return 'Not available';
  }

  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function getTravelDate(booking) {
  if (booking.bookingType === 'hotel') {
    return booking.searchDetails?.checkInDate || booking.item?.checkInDate || '';
  }

  return booking.searchDetails?.departureDate || booking.item?.departureDate || '';
}

function normalizeLocalBooking(booking) {
  const item = booking.item || {};
  const bookingType = booking.bookingType || booking.type || 'flight';

  return {
    id: booking.bookingId || booking.id,
    bookingType,
    customerName: booking.customer?.name || 'Guest Traveller',
    bookingDateTime: booking.bookingDateTime || booking.bookingDate,
    travelDate: getTravelDate({ ...booking, bookingType }),
    destination: bookingType === 'hotel' ? item.city : item.destination,
    amountPaid: booking.totalPaid || booking.amount || 0,
    paymentStatus: booking.paymentStatus || 'success',
    bookingStatus: booking.bookingStatus || 'confirmed',
    paymentMethod: booking.paymentMethod || 'sample',
    item,
    searchDetails: booking.searchDetails || {},
    selectedRoomTypeId: booking.selectedRoomTypeId || null,
    source: 'local',
  };
}

function normalizeSampleBooking(booking) {
  const item =
    booking.type === 'hotel'
      ? hotels.find((hotel) => hotel.id === booking.referenceId)
      : flights.find((flight) => flight.id === booking.referenceId);
  const user = users.find((candidate) => candidate.id === booking.userId);

  return {
    id: booking.id,
    bookingType: booking.type,
    customerName: user ? `${user.firstName} ${user.lastName}` : 'Sample Traveller',
    bookingDateTime: booking.bookingDate,
    travelDate: booking.bookingDate,
    destination: booking.type === 'hotel' ? item?.city : item?.destination,
    amountPaid: booking.amount,
    paymentStatus: 'success',
    bookingStatus: booking.status,
    paymentMethod: 'sample',
    item: item || { id: booking.referenceId },
    searchDetails: {},
    source: 'sample',
  };
}

function isUpcoming(booking) {
  const travelDate = getTravelDateForSort(booking);
  if (!travelDate) {
    return false;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(travelDate) >= today;
}

function getTravelDateForSort(booking) {
  return booking.travelDate || booking.bookingDateTime;
}

function SelectedBookingItem({ booking }) {
  const item = booking.item || {};

  if (booking.bookingType === 'flight') {
    return (
      <div className="rounded-2xl bg-slate-50 p-5 md:col-span-2" data-testid="selected-flight-details-card">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Selected flight</p>
            <h3 className="mt-1 font-heading text-xl font-bold text-slate-950">
              {item.airline || 'Flight'} {item.flightNumber ? `| ${item.flightNumber}` : ''}
            </h3>
            <p className="mt-2 text-sm font-semibold text-slate-500">
              {item.travelClass || booking.searchDetails?.travelClass || 'Travel class not available'}
            </p>
          </div>
          <div className="rounded-2xl bg-white px-4 py-3 text-right shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Fare</p>
            <p className="mt-1 text-lg font-bold text-slate-950">
              Rs. {Number(item.price || booking.amountPaid || 0).toLocaleString('en-IN')}
            </p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-[1fr_auto_1fr] items-center gap-3 rounded-2xl bg-white p-4 shadow-sm">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">{item.source || booking.searchDetails?.source || 'From'}</p>
            <p className="mt-1 text-2xl font-bold text-slate-950">
              {(item.source || booking.searchDetails?.source || '---').slice(0, 3).toUpperCase()}
            </p>
            <p className="mt-1 text-xs font-semibold text-slate-500">{item.departureTime || 'Time not available'}</p>
          </div>
          <div className="flex min-w-[120px] flex-col items-center">
            <span className="text-xs font-bold text-slate-400">{item.duration || 'Direct'}</span>
            <div className="my-3 flex w-full items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-slate-300" />
              <span className="h-px flex-1 border-t border-dashed border-slate-300" />
              <span className="rounded-full bg-slate-950 px-2 py-1 text-[10px] font-bold text-white">AIR</span>
              <span className="h-px flex-1 border-t border-dashed border-slate-300" />
              <span className="h-2 w-2 rounded-full bg-slate-300" />
            </div>
            <span className="text-xs font-semibold text-slate-500">Direct route</span>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">{item.destination || booking.destination || 'To'}</p>
            <p className="mt-1 text-2xl font-bold text-slate-950">
              {(item.destination || booking.destination || '---').slice(0, 3).toUpperCase()}
            </p>
            <p className="mt-1 text-xs font-semibold text-slate-500">{item.arrivalTime || 'Time not available'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-slate-50 p-5 md:col-span-2" data-testid="selected-hotel-details-card">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Selected hotel</p>
      <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="font-heading text-xl font-bold text-slate-950">{item.name || 'Hotel'}</h3>
          <p className="mt-2 text-sm text-slate-600">{item.city || booking.destination || 'City not available'}</p>
          <p className="mt-2 text-xs font-bold uppercase tracking-wide text-slate-400">{item.address || 'Address not available'}</p>
        </div>
        <div className="rounded-2xl bg-white px-4 py-3 text-right shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Per night</p>
          <p className="mt-1 text-lg font-bold text-slate-950">
            Rs. {Number(item.pricePerNight || 0).toLocaleString('en-IN')}
          </p>
        </div>
      </div>
      {item.amenities?.length ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {item.amenities.map((amenity) => (
            <span key={amenity} className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600 shadow-sm">
              {amenity}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function BookingHistoryPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [receiptBooking, setReceiptBooking] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [bookings, setBookings] = useState([]);
  const [typeFilter, setTypeFilter] = useState('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('all');
  const [bookingStatusFilter, setBookingStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('booking-date-desc');

  useEffect(() => {
    const timer = window.setTimeout(() => setIsLoading(false), 600);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!successMessage) {
      return undefined;
    }

    const timer = window.setTimeout(() => setSuccessMessage(''), 4000);
    return () => window.clearTimeout(timer);
  }, [successMessage]);

  useEffect(() => {
    const localBookings = readLocalBookings();
    if (localBookings.length > 0) {
      setBookings(localBookings.map(normalizeLocalBooking));
      return;
    }

    setBookings(sampleBookings.map(normalizeSampleBooking));
  }, []);

  function handleCancelBooking(bookingId) {
    const currentBookings = bookings.length > 0 ? bookings : [];
    const bookingToCancel = currentBookings.find((booking) => booking.id === bookingId);
    if (!bookingToCancel || bookingToCancel.bookingStatus === 'cancelled') {
      return;
    }

    const confirmed = window.confirm('Are you sure you want to cancel this booking?');
    if (!confirmed) {
      return;
    }

    const updatedBooking = { ...bookingToCancel, bookingStatus: 'cancelled' };
    const nextBookings = currentBookings.map((booking) => (booking.id === bookingId ? updatedBooking : booking));
    setBookings(nextBookings);
    if (selectedBooking?.id === bookingId) {
      setSelectedBooking(updatedBooking);
    }
    if (receiptBooking?.id === bookingId) {
      setReceiptBooking(updatedBooking);
    }
    setSuccessMessage('Booking cancelled successfully. Any released hotel room inventory has been restored.');

    const localBookings = readLocalBookings();
    const persistedBookings = localBookings.length > 0 ? localBookings : sampleBookings.map((booking) => normalizeSampleBooking(booking));
    const updatedPersisted = persistedBookings.map((booking) =>
      booking.id === bookingId ? { ...booking, bookingStatus: 'cancelled' } : booking,
    );
    saveLocalBookings(updatedPersisted);

    if (bookingToCancel.bookingType === 'hotel' && bookingToCancel.selectedRoomTypeId) {
      updateHotelInventory(
        bookingToCancel.item.id,
        bookingToCancel.selectedRoomTypeId,
        Number(bookingToCancel.searchDetails?.rooms || 1),
      );
    }
  }

  const filteredBookings = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    const filtered = bookings.filter((booking) => {
      const matchesType = typeFilter === 'all' || booking.bookingType === typeFilter;
      const matchesPayment = paymentStatusFilter === 'all' || booking.paymentStatus === paymentStatusFilter;
      const matchesBooking = bookingStatusFilter === 'all' || booking.bookingStatus === bookingStatusFilter;
      const matchesSearch =
        !query ||
        booking.id.toLowerCase().includes(query) ||
        String(booking.destination || '').toLowerCase().includes(query);

      return matchesType && matchesPayment && matchesBooking && matchesSearch;
    });

    return [...filtered].sort((first, second) => {
      if (sortBy === 'amount-desc') {
        return second.amountPaid - first.amountPaid;
      }

      if (sortBy === 'amount-asc') {
        return first.amountPaid - second.amountPaid;
      }

      if (sortBy === 'upcoming-first') {
        return Number(isUpcoming(second)) - Number(isUpcoming(first));
      }

      if (sortBy === 'past-first') {
        return Number(isUpcoming(first)) - Number(isUpcoming(second));
      }

      if (sortBy === 'booking-date-asc') {
        return new Date(first.bookingDateTime) - new Date(second.bookingDateTime);
      }

      return new Date(second.bookingDateTime) - new Date(first.bookingDateTime);
    });
  }, [bookingStatusFilter, bookings, paymentStatusFilter, searchQuery, sortBy, typeFilter]);

  return (
    <section
      className="min-h-screen bg-slate-50 bg-cover bg-fixed bg-center py-10"
      style={{
        backgroundImage: `linear-gradient(rgba(248, 250, 252, 0.94), rgba(248, 250, 252, 0.97)), url(${images.bookingSuccessImage})`,
      }}
      data-testid="booking-history-page"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-xl">
          <div className="relative h-56">
            <img
              src={images.bookingSuccessImage}
              alt="Travel booking history"
              loading="lazy"
              className="h-full w-full object-cover"
              onError={(event) => {
                event.currentTarget.style.display = 'none';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-primary-700/45 to-accent-500/30" />
            <div className="absolute inset-0 flex items-end p-6 sm:p-8">
              <div>
                <p className="text-sm font-bold uppercase tracking-wide text-accent-400">My bookings</p>
                <h1 className="mt-2 font-heading text-3xl font-bold text-white sm:text-4xl">
                  Booking history
                </h1>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6 grid gap-4 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm lg:grid-cols-5">
          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Booking type</span>
            <FancySelect
              id="booking-type-filter"
              name="bookingType"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="mt-2"
              options={[{ value: 'all', label: 'All' }, { value: 'flight', label: 'Flight' }, { value: 'hotel', label: 'Hotel' }]}
              data-testid="booking-type-filter"
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Payment status</span>
            <FancySelect
              id="payment-status-filter"
              name="paymentStatus"
              value={paymentStatusFilter}
              onChange={(e) => setPaymentStatusFilter(e.target.value)}
              className="mt-2"
              options={[{ value: 'all', label: 'All' }, { value: 'success', label: 'Success' }, { value: 'pending', label: 'Pending' }, { value: 'failed', label: 'Failed' }]}
              data-testid="payment-status-filter"
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Booking status</span>
            <FancySelect
              id="booking-status-filter"
              name="bookingStatus"
              value={bookingStatusFilter}
              onChange={(e) => setBookingStatusFilter(e.target.value)}
              className="mt-2"
              options={[{ value: 'all', label: 'All' }, { value: 'confirmed', label: 'Confirmed' }, { value: 'pending', label: 'Pending' }, { value: 'cancelled', label: 'Cancelled' }]}
              data-testid="booking-status-filter"
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Search</span>
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="travel-field mt-2"
              placeholder="Booking ID or city"
              data-testid="booking-search-input"
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Sort</span>
            <FancySelect
              id="booking-sort-dropdown"
              name="bookingSort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="mt-2"
              options={[
                { value: 'booking-date-desc', label: 'Booking date: newest' },
                { value: 'booking-date-asc', label: 'Booking date: oldest' },
                { value: 'amount-desc', label: 'Amount: high to low' },
                { value: 'amount-asc', label: 'Amount: low to high' },
                { value: 'upcoming-first', label: 'Upcoming first' },
                { value: 'past-first', label: 'Past first' },
              ]}
              data-testid="booking-sort-dropdown"
            />
          </label>
        </div>

        {successMessage ? (
          <div className="mb-6 rounded-3xl border border-green-200 bg-green-50 px-5 py-4 text-sm font-semibold text-green-700 shadow-sm" data-testid="booking-cancel-success-message">
            {successMessage}
          </div>
        ) : null}

        {isLoading ? (
          <div className="rounded-3xl border border-slate-100 bg-white shadow-sm" data-testid="booking-history-loading-spinner">
            <LoadingSpinner label="Loading booking history" />
          </div>
        ) : filteredBookings.length === 0 ? (
          <EmptyState
            title="No bookings found"
            description="Try changing filters or make a flight or hotel booking to see it here."
            testId="empty-bookings-state"
          />
        ) : (
          <>
            <div className="hidden overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm lg:block">
              <table className="min-w-full divide-y divide-slate-100" data-testid="booking-history-table">
                <thead className="bg-slate-50">
                  <tr>
                    {['Booking ID', 'Type', 'Customer', 'Booking Date', 'Travel Date', 'Destination', 'Amount', 'Payment', 'Status', 'Actions'].map(
                      (heading) => (
                        <th key={heading} className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                          {heading}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredBookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-slate-50" data-testid={`booking-row-${booking.id}`}>
                      <td className="px-4 py-4 text-sm font-bold text-slate-950">{booking.id}</td>
                      <td className="px-4 py-4 text-sm text-slate-600">{booking.bookingType}</td>
                      <td className="px-4 py-4 text-sm text-slate-600">{booking.customerName}</td>
                      <td className="px-4 py-4 text-sm text-slate-600">{formatDate(booking.bookingDateTime)}</td>
                      <td className="px-4 py-4 text-sm text-slate-600">{booking.travelDate || 'Not available'}</td>
                      <td className="px-4 py-4 text-sm text-slate-600">{booking.destination || 'Not available'}</td>
                      <td className="px-4 py-4 text-sm font-bold text-slate-950">Rs. {booking.amountPaid.toLocaleString('en-IN')}</td>
                      <td className="px-4 py-4">
                        <Badge className="bg-green-50 text-green-700">{booking.paymentStatus}</Badge>
                      </td>
                      <td className="px-4 py-4">
                        <Badge className={booking.bookingStatus === 'cancelled' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}>
                          {booking.bookingStatus}
                        </Badge>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedBooking(booking)}
                            className="rounded-xl bg-primary-600 px-3 py-2 text-xs font-bold text-white focus-ring"
                            data-testid={`view-booking-details-button-${booking.id}`}
                          >
                            View
                          </button>
                          <button
                            type="button"
                            onClick={() => setReceiptBooking(booking)}
                            className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 focus-ring"
                            data-testid={`download-receipt-button-${booking.id}`}
                          >
                            Receipt
                          </button>
                          <button
                            type="button"
                            disabled={booking.bookingStatus === 'cancelled'}
                            onClick={() => handleCancelBooking(booking.id)}
                            className="rounded-xl border border-red-200 bg-white px-3 py-2 text-xs font-bold text-red-700 focus-ring disabled:cursor-not-allowed disabled:opacity-60"
                            data-testid={`cancel-booking-button-${booking.id}`}
                          >
                            Cancel
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid gap-5 lg:hidden">
              {filteredBookings.map((booking) => (
                <article key={booking.id} className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm" data-testid={`booking-card-${booking.id}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Booking ID</p>
                      <h2 className="mt-1 font-heading text-xl font-bold text-slate-950">{booking.id}</h2>
                    </div>
                    <Badge>{booking.bookingType}</Badge>
                  </div>
                  <div className="mt-4 grid gap-3 text-sm text-slate-600">
                    <p>Customer: <span className="font-semibold text-slate-950">{booking.customerName}</span></p>
                    <p>Destination: <span className="font-semibold text-slate-950">{booking.destination || 'Not available'}</span></p>
                    <p>Amount: <span className="font-semibold text-slate-950">Rs. {booking.amountPaid.toLocaleString('en-IN')}</span></p>
                    <p>Status: <span className="font-semibold text-slate-950">{booking.bookingStatus}</span></p>
                  </div>
                  <div className="mt-5 flex flex-wrap gap-2">
                    <Button type="button" onClick={() => setSelectedBooking(booking)} className="flex-1" data-testid={`view-booking-details-button-card-${booking.id}`}>
                      View Details
                    </Button>
                    <button
                      type="button"
                      onClick={() => setReceiptBooking(booking)}
                      className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 focus-ring"
                      data-testid={`download-receipt-button-card-${booking.id}`}
                    >
                      Receipt
                    </button>
                    <button
                      type="button"
                      disabled={booking.bookingStatus === 'cancelled'}
                      onClick={() => handleCancelBooking(booking.id)}
                      className="rounded-2xl border border-red-200 bg-white px-4 py-3 text-sm font-bold text-red-700 focus-ring disabled:cursor-not-allowed disabled:opacity-60"
                      data-testid={`cancel-booking-button-card-${booking.id}`}
                    >
                      Cancel
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </div>

      {selectedBooking ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-8" data-testid="booking-details-modal">
          <div className="max-h-full w-full max-w-3xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-bold uppercase tracking-wide text-accent-500">Booking details</p>
                <h2 className="mt-1 font-heading text-2xl font-bold text-slate-950">{selectedBooking.id}</h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedBooking(null)}
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700 focus-ring"
                data-testid="modal-close-button"
              >
                Close
              </button>
            </div>

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h3 className="font-bold text-slate-950">Trip</h3>
                    </div>
                    <button
                      type="button"
                      disabled={selectedBooking.bookingStatus === 'cancelled'}
                      onClick={() => handleCancelBooking(selectedBooking.id)}
                      className="rounded-xl border border-red-200 bg-white px-3 py-2 text-xs font-bold text-red-700 focus-ring disabled:cursor-not-allowed disabled:opacity-60"
                      data-testid="modal-cancel-booking-button"
                    >
                      Cancel booking
                    </button>
                  </div>
                  <p>Destination/City: <span className="font-semibold text-slate-950">{selectedBooking.destination || 'Not available'}</span></p>
                  <p>Travel date: <span className="font-semibold text-slate-950">{selectedBooking.travelDate || 'Not available'}</span></p>
                  <p>Status: <span className="font-semibold text-slate-950">{selectedBooking.bookingStatus}</span></p>
                </div>

              <div className="rounded-2xl bg-slate-50 p-5">
                <h3 className="font-bold text-slate-950">Payment</h3>
                <div className="mt-3 space-y-2 text-sm text-slate-600">
                  <p>Method: <span className="font-semibold text-slate-950">{selectedBooking.paymentMethod}</span></p>
                  <p>Status: <span className="font-semibold text-green-700">{selectedBooking.paymentStatus}</span></p>
                  <p>Amount: <span className="font-semibold text-slate-950">Rs. {selectedBooking.amountPaid.toLocaleString('en-IN')}</span></p>
                  <p>Booked on: <span className="font-semibold text-slate-950">{formatDate(selectedBooking.bookingDateTime)}</span></p>
                </div>
              </div>

              <SelectedBookingItem booking={selectedBooking} />
            </div>
          </div>
        </div>
      ) : null}

      {receiptBooking ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-8" data-testid="booking-receipt-modal">
          <div className="max-h-full w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <p className="text-sm font-bold uppercase tracking-wide text-accent-500">Payment receipt</p>
                <h2 className="mt-1 font-heading text-2xl font-bold text-slate-950" data-testid="receipt-booking-id">
                  {receiptBooking.id}
                </h2>
                <p className="mt-1 text-sm text-slate-500">Issued on {formatDate(receiptBooking.bookingDateTime)}</p>
              </div>
              <button
                type="button"
                onClick={() => setReceiptBooking(null)}
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700 focus-ring"
                data-testid="receipt-modal-close-button"
              >
                Close
              </button>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Customer</p>
                <p className="mt-1 font-bold text-slate-950" data-testid="receipt-customer-name">
                  {receiptBooking.customerName}
                </p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Booking type</p>
                <p className="mt-1 font-bold capitalize text-slate-950" data-testid="receipt-booking-type">
                  {receiptBooking.bookingType}
                </p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Destination</p>
                <p className="mt-1 font-bold text-slate-950" data-testid="receipt-destination">
                  {receiptBooking.destination || 'Not available'}
                </p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Travel date</p>
                <p className="mt-1 font-bold text-slate-950" data-testid="receipt-travel-date">
                  {receiptBooking.travelDate || 'Not available'}
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-slate-100 p-4">
              <div className="flex justify-between gap-4 text-sm text-slate-600">
                <span>Payment method</span>
                <span className="font-bold capitalize text-slate-950">{receiptBooking.paymentMethod}</span>
              </div>
              <div className="mt-3 flex justify-between gap-4 text-sm text-slate-600">
                <span>Payment status</span>
                <span className="font-bold capitalize text-green-700">{receiptBooking.paymentStatus}</span>
              </div>
              <div className="mt-3 flex justify-between gap-4 text-sm text-slate-600">
                <span>Booking status</span>
                <span className="font-bold capitalize text-slate-950">{receiptBooking.bookingStatus}</span>
              </div>
              <div className="mt-4 flex justify-between gap-4 border-t border-slate-100 pt-4 text-lg font-bold text-slate-950">
                <span>Total paid</span>
                <span data-testid="receipt-total-paid">Rs. {receiptBooking.amountPaid.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => window.print()}
              className="mt-6 w-full rounded-2xl bg-primary-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-900/20 transition-all hover:bg-primary-700 focus-ring"
              data-testid="receipt-print-button"
            >
              Print receipt
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}

export default BookingHistoryPage;
