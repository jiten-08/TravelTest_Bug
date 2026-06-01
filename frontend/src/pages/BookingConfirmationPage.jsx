import { Link } from 'react-router-dom';
import Badge from '../components/Badge.jsx';
import Button from '../components/Button.jsx';
import images from '../data/images.js';

function getStoredBooking() {
  const value = localStorage.getItem('traveltest_current_booking');
  return value ? JSON.parse(value) : null;
}

function formatDateTime(value) {
  if (!value) {
    return 'Not available';
  }

  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function BookingConfirmationPage() {
  const booking = getStoredBooking();
  const item = booking?.item;

  return (
    <section className="bg-slate-50 px-4 py-12 sm:px-6 lg:px-8" data-testid="booking-confirmation-page">
      <div className="mx-auto max-w-5xl overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-xl">
        <div className="relative h-72">
          <img
            src={images.bookingSuccessImage}
            alt="Happy travel booking confirmation"
            loading="lazy"
            className="h-full w-full object-cover"
            onError={(event) => {
              event.currentTarget.style.display = 'none';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/75 to-primary-700/30" />
          <div className="absolute inset-0 flex items-end p-8">
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-accent-400" data-testid="booking-confirmation-eyebrow">
                Booking confirmed
              </p>
              <h1 className="mt-2 font-heading text-4xl font-bold text-white" data-testid="booking-confirmation-title">
                Your trip is ready.
              </h1>
              {booking ? (
                <p className="mt-3 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold text-white backdrop-blur" data-testid="booking-success-message">
                  Payment successful and booking confirmed.
                </p>
              ) : null}
            </div>
          </div>
        </div>

        <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[1fr_320px]">
          {booking ? (
            <>
              <div className="space-y-5">
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-500">Booking ID</p>
                      <p className="mt-1 font-heading text-2xl font-bold text-slate-950" data-testid="booking-id">
                        {booking.bookingId}
                      </p>
                    </div>
                    <Badge className="bg-green-50 text-green-700" data-testid="payment-status-badge">
                      {booking.paymentStatus}
                    </Badge>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-100 p-5">
                  <h2 className="font-heading text-xl font-bold text-slate-900">Booking details</h2>
                  {booking.bookingType === 'flight' ? (
                    <div className="mt-4 grid gap-4 sm:grid-cols-2" data-testid="confirmation-flight-details">
                      <p className="text-sm text-slate-600">
                        Airline <span className="block font-semibold text-slate-950">{item.airline}</span>
                      </p>
                      <p className="text-sm text-slate-600">
                        Flight <span className="block font-semibold text-slate-950">{item.flightNumber}</span>
                      </p>
                      <p className="text-sm text-slate-600">
                        Route <span className="block font-semibold text-slate-950">{item.source} to {item.destination}</span>
                      </p>
                      <p className="text-sm text-slate-600">
                        Time <span className="block font-semibold text-slate-950">{item.departureTime} to {item.arrivalTime}</span>
                      </p>
                      <p className="text-sm text-slate-600 sm:col-span-2" data-testid="confirmation-selected-seats">
                        Seats{' '}
                        <span className="block font-semibold text-slate-950">
                          {booking.selectedSeats?.length > 0
                            ? booking.selectedSeats.map((seat) => seat.seatNumber).join(', ')
                            : 'Not selected'}
                        </span>
                      </p>
                    </div>
                  ) : (
                    <div className="mt-4 grid gap-4 sm:grid-cols-2" data-testid="confirmation-hotel-details">
                      <p className="text-sm text-slate-600">
                        Hotel <span className="block font-semibold text-slate-950">{item.name}</span>
                      </p>
                      <p className="text-sm text-slate-600">
                        City <span className="block font-semibold text-slate-950">{item.city}</span>
                      </p>
                      {booking.selectedRoomType ? (
                        <p className="text-sm text-slate-600">
                          Room type <span className="block font-semibold text-slate-950">{booking.selectedRoomType}</span>
                        </p>
                      ) : null}
                      <p className="text-sm text-slate-600 sm:col-span-2">
                        Address <span className="block font-semibold text-slate-950">{item.address}</span>
                      </p>
                    </div>
                  )}
                </div>

                <div className="rounded-2xl border border-slate-100 p-5" data-testid="confirmation-customer-details">
                  <h2 className="font-heading text-xl font-bold text-slate-900">Customer details</h2>
                  {booking.customer ? (
                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                      <p className="text-sm text-slate-600">
                        Name <span className="block font-semibold text-slate-950">{booking.customer.name}</span>
                      </p>
                      <p className="text-sm text-slate-600">
                        Email <span className="block font-semibold text-slate-950">{booking.customer.email}</span>
                      </p>
                    </div>
                  ) : (
                    <p className="mt-3 text-sm text-slate-600">Guest customer details are not available.</p>
                  )}
                </div>
              </div>

              <aside className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
                <h2 className="font-heading text-xl font-bold text-slate-900">Payment summary</h2>
                <div className="mt-5 space-y-3 text-sm">
                  <div className="flex justify-between text-slate-600">
                    <span>Payment method</span>
                    <span className="font-semibold text-slate-950">{booking.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Payment status</span>
                    <span className="font-semibold text-green-700" data-testid="confirmation-payment-status">
                      {booking.paymentStatus}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Total paid</span>
                    <span className="font-semibold text-slate-950" data-testid="confirmation-total-paid">
                      Rs. {booking.totalPaid.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Booking date</span>
                    <span className="text-right font-semibold text-slate-950" data-testid="confirmation-booking-date">
                      {formatDateTime(booking.bookingDateTime)}
                    </span>
                  </div>
                </div>

                <div className="mt-6 grid gap-3">
                  <Button as={Link} to="/bookings/history" variant="secondary" data-testid="view-booking-history-button">
                    View Booking History
                  </Button>
                  <Button as={Link} to="/" data-testid="booking-confirmation-home-link">
                    Back to Home
                  </Button>
                  <button
                    type="button"
                    className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition-all hover:bg-slate-50 focus-ring"
                    data-testid="download-receipt-button"
                  >
                    Download Receipt
                  </button>
                </div>
              </aside>
            </>
          ) : (
            <div className="lg:col-span-2">
              <p className="text-slate-600" data-testid="booking-confirmation-message">
                No confirmed booking is available yet.
              </p>
              <Button as={Link} to="/" className="mt-6" data-testid="booking-confirmation-home-link">
                Back to Home
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default BookingConfirmationPage;
