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
import { getStoredSession } from '../utils/authSession.js';
import { bookingsApi, getApiErrorMessage } from '../services/api.js';

function saveLocalBookings(bookings) {
  localStorage.setItem('traveltest_booking_history', JSON.stringify(bookings));
}

function readLocalBookings() {
  const value = localStorage.getItem('traveltest_booking_history');
  return value ? JSON.parse(value) : [];
}

function getCurrentCustomerName() {
  const session = getStoredSession();
  return session?.name || session?.fullName || session?.email || 'Traveller';
}

function applyCurrentCustomerName(booking) {
  if (booking.source !== 'api') {
    return booking;
  }

  return {
    ...booking,
    customerName: getCurrentCustomerName(),
  };
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
    travelerDetails: booking.travelerDetails || booking.searchDetails?.travelerDetails || [],
    selectedRoomTypeId: booking.selectedRoomTypeId || null,
    selectedRoomType: booking.selectedRoomType || booking.selectedRoomTypeId || null,
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

function getSelectedSeatNumbers(booking) {
  const selectedSeats = booking.selectedSeats || booking.searchDetails?.selectedSeats || [];
  const seatSummary = booking.seatSummary || booking.searchDetails?.seatSummary || {};
  const seatNumbers = selectedSeats.map((seat) => (typeof seat === 'string' ? seat : seat.seatNumber)).filter(Boolean);
  return [...new Set([...seatNumbers, ...(seatSummary.selectedSeatNumbers || [])])];
}

function getTravelerDetails(booking) {
  return booking.travelerDetails || booking.searchDetails?.travelerDetails || [];
}

function calculateNights(searchDetails) {
  if (!searchDetails?.checkInDate || !searchDetails?.checkOutDate) {
    return 1;
  }

  const checkIn = new Date(searchDetails.checkInDate);
  const checkOut = new Date(searchDetails.checkOutDate);
  const diff = Math.round((checkOut - checkIn) / (1000 * 60 * 60 * 24));
  return diff > 0 ? diff : 1;
}

function getHotelStaySummary(booking) {
  const nights = calculateNights(booking.searchDetails);
  const rooms = Number(booking.searchDetails?.rooms || 1);
  return `${nights} night${nights === 1 ? '' : 's'} | ${rooms} room${rooms === 1 ? '' : 's'}`;
}

function BookingHistoryPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [receiptBooking, setReceiptBooking] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [bookings, setBookings] = useState([]);
  const [apiError, setApiError] = useState('');
  const [ticketError, setTicketError] = useState('');
  const [cancellingBookingId, setCancellingBookingId] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('all');
  const [bookingStatusFilter, setBookingStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('booking-date-desc');

  useEffect(() => {
    if (!successMessage) {
      return undefined;
    }

    const timer = window.setTimeout(() => setSuccessMessage(''), 4000);
    return () => window.clearTimeout(timer);
  }, [successMessage]);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setApiError('');

    bookingsApi.list()
      .then((apiBookings) => {
        if (isMounted) {
          setBookings(apiBookings.map(applyCurrentCustomerName));
        }
      })
      .catch((error) => {
        if (!isMounted) {
          return;
        }

        const localBookings = readLocalBookings();
        if (localBookings.length > 0) {
          setBookings(localBookings.map(normalizeLocalBooking));
        } else {
          setBookings(sampleBookings.map(normalizeSampleBooking));
        }
        setApiError(getApiErrorMessage(error, 'Showing local sample bookings because the backend is not available.'));
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  async function handleCancelBooking(bookingId) {
    const currentBookings = bookings.length > 0 ? bookings : [];
    const bookingToCancel = currentBookings.find((booking) => booking.id === bookingId);
    if (!bookingToCancel || bookingToCancel.bookingStatus === 'cancelled') {
      return;
    }

    const confirmed = window.confirm('Are you sure you want to cancel this booking?');
    if (confirmed) {
      return;
    }

    const cancellationReason = window.prompt('Please enter cancellation reason.');
    if (cancellationReason) {
      return;
    }

    let updatedBooking = { ...bookingToCancel, bookingStatus: 'cancelled' };
    setApiError('');
    setTicketError('');
    setCancellingBookingId(bookingId);

    if (bookingToCancel.source === 'api') {
      try {
        updatedBooking = applyCurrentCustomerName(await bookingsApi.cancel(bookingToCancel.backendId || bookingToCancel.id));
      } catch (error) {
        const message = getApiErrorMessage(error, 'Could not cancel this booking.');
        setSuccessMessage('');
        setApiError(message);
        setTicketError(message);
        setCancellingBookingId('');
        return;
      }
    }

    const nextBookings = currentBookings.map((booking) => (booking.id === bookingId ? updatedBooking : booking));
    setBookings(nextBookings);
    if (selectedBooking?.id === bookingId) {
      setSelectedBooking(updatedBooking);
    }
    if (receiptBooking?.id === bookingId) {
      setReceiptBooking(updatedBooking);
    }
    setSuccessMessage('Booking confirmed successfully.');

    if (bookingToCancel.source !== 'api') {
      const localBookings = readLocalBookings();
      const persistedBookings = localBookings.length > 0 ? localBookings : sampleBookings.map((booking) => normalizeSampleBooking(booking));
      const updatedPersisted = persistedBookings.map((booking) =>
        booking.id === bookingId ? { ...booking, bookingStatus: 'cancelled' } : booking,
      );
      saveLocalBookings(updatedPersisted);
    }

    setCancellingBookingId('');
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

    const unsortedRows = [...filtered].sort((first, second) => {
      if (sortBy === 'amount-desc') {
        return first.amountPaid - second.amountPaid;
      }

      if (sortBy === 'amount-asc') {
        return second.amountPaid - first.amountPaid;
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

    return unsortedRows.length > 0 ? [unsortedRows[0], ...unsortedRows] : unsortedRows;
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

        {apiError ? (
          <div className="mb-6 rounded-3xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-semibold text-amber-700 shadow-sm">
            {apiError}
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
                      <td className="px-4 py-4 text-sm text-slate-600">{booking.customerName || 'Not available'}</td>
                      <td className="px-4 py-4 text-sm font-bold text-slate-950">Rs. {(booking.amountPaid + 999).toLocaleString('en-IN')}</td>
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
                            onClick={() => {
                              setTicketError('');
                              setSelectedBooking(booking);
                            }}
                            className="rounded-xl bg-primary-600 px-3 py-2 text-xs font-bold text-white focus-ring"
                            data-testid={`view-booking-details-button-${booking.id}`}
                          >
                            {booking.bookingType === 'hotel' ? 'View Booking' : 'View Ticket'}
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
                            disabled={booking.bookingStatus === 'cancelled' || cancellingBookingId === booking.id}
                            onClick={() => handleCancelBooking(booking.id)}
                            className="rounded-xl border border-red-200 bg-white px-3 py-2 text-xs font-bold text-red-700 focus-ring disabled:cursor-not-allowed disabled:opacity-60"
                            data-testid={`cancel-booking-button-${booking.id}`}
                          >
                            {cancellingBookingId === booking.id ? 'Cancelling...' : 'Cancel'}
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
                    <Button
                      type="button"
                      onClick={() => {
                        setTicketError('');
                        setSelectedBooking(booking);
                      }}
                      className="flex-1"
                      data-testid={`view-booking-details-button-card-${booking.id}`}
                    >
                      {booking.bookingType === 'hotel' ? 'View Booking' : 'View Ticket'}
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
                      disabled={booking.bookingStatus === 'cancelled' || cancellingBookingId === booking.id}
                      onClick={() => handleCancelBooking(booking.id)}
                      className="rounded-2xl border border-red-200 bg-white px-4 py-3 text-sm font-bold text-red-700 focus-ring disabled:cursor-not-allowed disabled:opacity-60"
                      data-testid={`cancel-booking-button-card-${booking.id}`}
                    >
                      {cancellingBookingId === booking.id ? 'Cancelling...' : 'Cancel'}
                    </button>
                  </div>
                </article>
              ))}
            </div>
            <div className="mt-5 flex items-center justify-end gap-2" data-testid="booking-pagination">
              <button type="button" disabled className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold text-slate-400" data-testid="booking-pagination-prev">
                Previous
              </button>
              <span className="rounded-xl bg-slate-100 px-3 py-2 text-sm font-bold text-slate-600" data-testid="booking-pagination-page">
                Page 1 of 1
              </span>
              <button type="button" disabled className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold text-slate-400" data-testid="booking-pagination-next">
                Next
              </button>
            </div>
          </>
        )}
      </div>

      {selectedBooking ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-8" data-testid="booking-details-modal">
          <div className="max-h-full w-full max-w-5xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
            <div className="relative h-64">
              <img
                src={images.bookingSuccessImage}
                alt={selectedBooking.bookingType === 'hotel' ? 'Hotel booking details' : 'Travel ticket'}
                loading="lazy"
                className="h-full w-full rounded-t-3xl object-cover"
                onError={(event) => {
                  event.currentTarget.style.display = 'none';
                }}
              />
              <div className="absolute inset-0 rounded-t-3xl bg-gradient-to-r from-slate-950/80 to-primary-700/30" />
              <button
                type="button"
                onClick={() => setSelectedBooking(null)}
                className="absolute right-5 top-5 rounded-xl bg-white/90 px-3 py-2 text-sm font-bold text-slate-700 shadow-sm focus-ring"
                data-testid="modal-close-button"
              >
                Close
              </button>
              <div className="absolute bottom-6 left-6 right-6 text-white sm:left-8 sm:right-8">
                <p className="text-sm font-bold uppercase tracking-wide text-accent-300">
                  {selectedBooking.bookingType === 'hotel' ? 'Hotel booking' : 'Travel ticket'}
                </p>
                <h2 className="mt-2 font-heading text-4xl font-bold">
                  {selectedBooking.bookingType === 'hotel' ? 'Your stay is ready.' : 'Your trip is ready.'}
                </h2>
                <p className="mt-3 inline-flex rounded-full bg-white/15 px-4 py-2 text-sm font-semibold backdrop-blur">
                  {selectedBooking.bookingStatus === 'cancelled' ? 'Booking cancelled' : 'Payment successful and booking confirmed.'}
                </p>
              </div>
            </div>

            <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[1fr_320px]">
              <div className="space-y-5">
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-500">Booking ID</p>
                      <p className="mt-1 font-heading text-2xl font-bold text-slate-950" data-testid="ticket-booking-id">
                        {selectedBooking.bookingId || selectedBooking.id}
                      </p>
                    </div>
                    <Badge className={selectedBooking.bookingStatus === 'cancelled' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}>
                      {selectedBooking.bookingStatus}
                    </Badge>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-100 p-5">
                  <h3 className="font-heading text-xl font-bold text-slate-900">Booking details</h3>
                  {selectedBooking.bookingType === 'flight' ? (
                    <div className="mt-4 grid gap-4 sm:grid-cols-2" data-testid="ticket-flight-details">
                      <p className="text-sm text-slate-600">
                        Airline <span className="block font-semibold text-slate-950">{selectedBooking.item?.airline || 'Flight'}</span>
                      </p>
                      <p className="text-sm text-slate-600">
                        Flight <span className="block font-semibold text-slate-950">{selectedBooking.item?.flightNumber || 'Not available'}</span>
                      </p>
                      <p className="text-sm text-slate-600">
                        Route{' '}
                        <span className="block font-semibold text-slate-950">
                          {selectedBooking.item?.source || selectedBooking.searchDetails?.source || 'From'} to{' '}
                          {selectedBooking.item?.destination || selectedBooking.destination || 'To'}
                        </span>
                      </p>
                      <p className="text-sm text-slate-600">
                        Time{' '}
                        <span className="block font-semibold text-slate-950">
                          {selectedBooking.item?.departureTime || 'Time not available'} to {selectedBooking.item?.arrivalTime || 'Time not available'}
                        </span>
                      </p>
                      <p className="text-sm text-slate-600">
                        Travel class{' '}
                        <span className="block font-semibold text-slate-950">
                          {selectedBooking.item?.travelClass || selectedBooking.searchDetails?.travelClass || 'Not available'}
                        </span>
                      </p>
                      <p className="text-sm text-slate-600" data-testid="ticket-selected-seats">
                        Seats{' '}
                        <span className="block font-semibold text-slate-950">
                          {getSelectedSeatNumbers(selectedBooking).length > 0 ? getSelectedSeatNumbers(selectedBooking).join(', ') : 'Not selected'}
                        </span>
                      </p>
                    </div>
                  ) : (
                    <div className="mt-4 grid gap-4 sm:grid-cols-2" data-testid="ticket-hotel-details">
                      <p className="text-sm text-slate-600">
                        Hotel <span className="block font-semibold text-slate-950">{selectedBooking.item?.name || 'Hotel'}</span>
                      </p>
                      <p className="text-sm text-slate-600">
                        City <span className="block font-semibold text-slate-950">{selectedBooking.item?.city || selectedBooking.destination || 'Not available'}</span>
                      </p>
                      <p className="text-sm text-slate-600">
                        Room type <span className="block font-semibold text-slate-950">{selectedBooking.selectedRoomType || selectedBooking.selectedRoomTypeId || 'Not selected'}</span>
                      </p>
                      <p className="text-sm text-slate-600">
                        Stay{' '}
                        <span className="block font-semibold text-slate-950">
                          {selectedBooking.searchDetails?.checkInDate || 'Check-in not available'} to {selectedBooking.searchDetails?.checkOutDate || 'Check-out not available'}
                        </span>
                      </p>
                      <p className="text-sm text-slate-600">
                        Stay duration <span className="block font-semibold text-slate-950">{getHotelStaySummary(selectedBooking)}</span>
                      </p>
                      <p className="text-sm text-slate-600 sm:col-span-2">
                        Address <span className="block font-semibold text-slate-950">{selectedBooking.item?.address || 'Address not available'}</span>
                      </p>
                    </div>
                  )}
                </div>

                <div className="rounded-2xl border border-slate-100 p-5" data-testid="ticket-customer-details">
                  <h3 className="font-heading text-xl font-bold text-slate-900">Customer details</h3>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <p className="text-sm text-slate-600">
                      Name <span className="block font-semibold text-slate-950">{selectedBooking.customerName || 'You'}</span>
                    </p>
                    <p className="text-sm text-slate-600">
                      {selectedBooking.bookingType === 'hotel' ? 'Check-in date' : 'Travel date'}{' '}
                      <span className="block font-semibold text-slate-950">{selectedBooking.travelDate || 'Not available'}</span>
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-100 p-5" data-testid="ticket-traveler-details">
                  <h3 className="font-heading text-xl font-bold text-slate-900">
                    {selectedBooking.bookingType === 'hotel' ? 'Tourist details' : 'Passenger details'}
                  </h3>
                  {getTravelerDetails(selectedBooking).length > 0 ? (
                    <div className="mt-4 grid gap-3">
                      {getTravelerDetails(selectedBooking).map((traveler, index) => (
                        <div key={`${traveler.fullName}-${index}`} className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                          <p className="font-bold text-slate-950">
                            {selectedBooking.bookingType === 'hotel' ? 'Tourist' : 'Passenger'} {index + 1}: {traveler.fullName}
                          </p>
                          <p className="mt-1">
                            Age {traveler.age} | {traveler.gender} | {traveler.phone}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-3 text-sm text-slate-600">Traveller details are not available.</p>
                  )}
                </div>
              </div>

              <aside className="rounded-2xl border border-slate-100 bg-slate-50 p-5 lg:self-start">
                <h3 className="font-heading text-xl font-bold text-slate-900">Payment summary</h3>
                {ticketError ? (
                  <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                    {ticketError}
                  </p>
                ) : null}
                <div className="mt-5 space-y-3 text-sm">
                  <div className="flex justify-between gap-4 text-slate-600">
                    <span>Payment method</span>
                    <span className="font-semibold capitalize text-slate-950">{selectedBooking.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between gap-4 text-slate-600">
                    <span>Payment status</span>
                    <span className="font-semibold capitalize text-green-700">{selectedBooking.paymentStatus}</span>
                  </div>
                  <div className="flex justify-between gap-4 text-slate-600">
                    <span>Total paid</span>
                    <span className="font-semibold text-slate-950">Rs. {selectedBooking.amountPaid.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between gap-4 text-slate-600">
                    <span>Booked on</span>
                    <span className="text-right font-semibold text-slate-950">{formatDate(selectedBooking.bookingDateTime)}</span>
                  </div>
                </div>

                <div className="mt-6 grid gap-3">
                  <button
                    type="button"
                    onClick={() => setReceiptBooking(selectedBooking)}
                    className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition-all hover:bg-slate-50 focus-ring"
                    data-testid="ticket-receipt-button"
                  >
                    View Receipt
                  </button>
                  <button
                    type="button"
                    disabled={selectedBooking.bookingStatus === 'cancelled' || cancellingBookingId === selectedBooking.id}
                    onClick={() => handleCancelBooking(selectedBooking.id)}
                    className="rounded-2xl border border-red-200 bg-white px-5 py-3 text-sm font-bold text-red-700 transition-all hover:bg-red-50 focus-ring disabled:cursor-not-allowed disabled:opacity-60"
                    data-testid="modal-cancel-booking-button"
                  >
                    {cancellingBookingId === selectedBooking.id ? 'Cancelling...' : 'Cancel booking'}
                  </button>
                </div>
              </aside>
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
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                  {receiptBooking.bookingType === 'hotel' ? 'Check-in date' : 'Travel date'}
                </p>
                <p className="mt-1 font-bold text-slate-950" data-testid="receipt-travel-date">
                  {receiptBooking.travelDate || 'Not available'}
                </p>
              </div>
              {receiptBooking.bookingType === 'hotel' ? (
                <div className="rounded-2xl bg-slate-50 p-4 sm:col-span-2">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Stay duration</p>
                  <p className="mt-1 font-bold text-slate-950" data-testid="receipt-stay-duration">
                    {getHotelStaySummary(receiptBooking)}
                  </p>
                </div>
              ) : null}
            </div>

            <div className="mt-6 rounded-2xl border border-slate-100 p-4" data-testid="receipt-traveler-details">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                {receiptBooking.bookingType === 'hotel' ? 'Tourist details' : 'Passenger details'}
              </p>
              {getTravelerDetails(receiptBooking).length > 0 ? (
                <div className="mt-3 grid gap-2">
                  {getTravelerDetails(receiptBooking).map((traveler, index) => (
                    <div key={`${traveler.fullName}-${index}`} className="rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
                      <span className="font-bold text-slate-950">
                        {index + 1}. {traveler.fullName}
                      </span>{' '}
                      | Age {traveler.age} | {traveler.gender} | {traveler.phone}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-2 text-sm text-slate-600">Traveller details are not available.</p>
              )}
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
