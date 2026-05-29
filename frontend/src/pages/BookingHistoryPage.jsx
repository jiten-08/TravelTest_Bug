import { useEffect, useMemo, useState } from 'react';
import Badge from '../components/Badge.jsx';
import Button from '../components/Button.jsx';
import EmptyState from '../components/EmptyState.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import sampleBookings from '../data/bookings.json';
import flights from '../data/flights.json';
import hotels from '../data/hotels.json';
import images from '../data/images.js';
import users from '../data/users.json';

function readLocalBookings() {
  const value = localStorage.getItem('traveltest_booking_history');
  return value ? JSON.parse(value) : [];
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

function BookingHistoryPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [typeFilter, setTypeFilter] = useState('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('all');
  const [bookingStatusFilter, setBookingStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('booking-date-desc');

  useEffect(() => {
    const timer = window.setTimeout(() => setIsLoading(false), 600);
    return () => window.clearTimeout(timer);
  }, []);

  const bookings = useMemo(() => {
    const localBookings = readLocalBookings();
    return localBookings.length > 0 ? localBookings.map(normalizeLocalBooking) : sampleBookings.map(normalizeSampleBooking);
  }, []);

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
            <select
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value)}
              className="travel-select mt-2"
              data-testid="booking-type-filter"
            >
              <option value="all">All</option>
              <option value="flight">Flight</option>
              <option value="hotel">Hotel</option>
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Payment status</span>
            <select
              value={paymentStatusFilter}
              onChange={(event) => setPaymentStatusFilter(event.target.value)}
              className="travel-select mt-2"
              data-testid="payment-status-filter"
            >
              <option value="all">All</option>
              <option value="success">Success</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Booking status</span>
            <select
              value={bookingStatusFilter}
              onChange={(event) => setBookingStatusFilter(event.target.value)}
              className="travel-select mt-2"
              data-testid="booking-status-filter"
            >
              <option value="all">All</option>
              <option value="confirmed">Confirmed</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
            </select>
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
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
              className="travel-select mt-2"
              data-testid="booking-sort-dropdown"
            >
              <option value="booking-date-desc">Booking date: newest</option>
              <option value="booking-date-asc">Booking date: oldest</option>
              <option value="amount-desc">Amount: high to low</option>
              <option value="amount-asc">Amount: low to high</option>
              <option value="upcoming-first">Upcoming first</option>
              <option value="past-first">Past first</option>
            </select>
          </label>
        </div>

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
                        <Badge>{booking.bookingStatus}</Badge>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex gap-2">
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
                            className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 focus-ring"
                            data-testid={`download-receipt-button-${booking.id}`}
                          >
                            Receipt
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
                  <div className="mt-5 flex gap-2">
                    <Button type="button" onClick={() => setSelectedBooking(booking)} className="flex-1" data-testid={`view-booking-details-button-card-${booking.id}`}>
                      View Details
                    </Button>
                    <button
                      type="button"
                      className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 focus-ring"
                      data-testid={`download-receipt-button-card-${booking.id}`}
                    >
                      Receipt
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
                <h3 className="font-bold text-slate-950">Trip</h3>
                <div className="mt-3 space-y-2 text-sm text-slate-600">
                  <p>Type: <span className="font-semibold text-slate-950">{selectedBooking.bookingType}</span></p>
                  <p>Destination/City: <span className="font-semibold text-slate-950">{selectedBooking.destination || 'Not available'}</span></p>
                  <p>Travel date: <span className="font-semibold text-slate-950">{selectedBooking.travelDate || 'Not available'}</span></p>
                  <p>Status: <span className="font-semibold text-slate-950">{selectedBooking.bookingStatus}</span></p>
                </div>
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

              <div className="rounded-2xl bg-slate-50 p-5 md:col-span-2">
                <h3 className="font-bold text-slate-950">Selected {selectedBooking.bookingType}</h3>
                <pre className="mt-3 whitespace-pre-wrap rounded-2xl bg-white p-4 text-xs leading-6 text-slate-600">
                  {JSON.stringify(selectedBooking.item, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

export default BookingHistoryPage;
