import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import Badge from '../components/Badge.jsx';
import Button from '../components/Button.jsx';
import SeatLegend from '../components/SeatLegend.jsx';
import SeatMap from '../components/SeatMap.jsx';
import images from '../data/images.js';
import { generateSeatMap } from '../utils/seatMap.js';
import { bookingsApi, getApiErrorMessage } from '../services/api.js';

function getStoredJson(key) {
  const value = localStorage.getItem(key);
  return value ? JSON.parse(value) : null;
}

function FlightSeatSelectionPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const selectedFlight = getStoredJson('traveltest_selected_flight');
  const searchDetails = getStoredJson('traveltest_flight_search');
  const passengerCount = Number(searchDetails?.passengers || 1);
  const [selectedSeats, setSelectedSeats] = useState(getStoredJson('traveltest_selected_seats') || []);
  const [error, setError] = useState('');
  const [seatLoadError, setSeatLoadError] = useState('');
  const [bookedSeatNumbers, setBookedSeatNumbers] = useState([]);
  const [searchParams] = useSearchParams();
  const isViewOnly = searchParams.get('mode') === 'view';
  const userSession = getStoredJson('traveltest_user_session');

  useEffect(() => {
    if (!selectedFlight?.id || !userSession) {
      return undefined;
    }

    let isMounted = true;
    setSeatLoadError('');

    bookingsApi.bookedSeats(selectedFlight.id, searchDetails?.departureDate)
      .then((seatNumbers) => {
        if (isMounted) {
          setBookedSeatNumbers(seatNumbers);
        }
      })
      .catch((apiError) => {
        if (isMounted) {
          setBookedSeatNumbers([]);
          setSeatLoadError(getApiErrorMessage(apiError, 'Could not load booked seats. Please refresh before booking.'));
        }
      });

    return () => {
      isMounted = false;
    };
  }, [selectedFlight?.id, searchDetails?.departureDate, userSession]);

  const seats = useMemo(() => {
    const booked = new Set(bookedSeatNumbers);
    return generateSeatMap(selectedFlight?.id).map((seat) =>
      booked.has(seat.seatNumber) ? { ...seat, status: 'reserved' } : seat,
    );
  }, [bookedSeatNumbers, selectedFlight?.id]);
  const availableSeats = useMemo(() => seats.filter((seat) => seat.status === 'available'), [seats]);

  useEffect(() => {
    if (!userSession) {
      navigate('/login', { state: { from: location.pathname + location.search } });
    }
  }, [userSession, navigate, location.pathname, location.search]);

  useEffect(() => {
    setSelectedSeats((current) =>
      current.filter((seat) => availableSeats.some((availableSeat) => availableSeat.seatNumber === seat.seatNumber)),
    );
  }, [availableSeats]);

  const seatCharges = selectedSeats.reduce((total, seat) => total + Number(seat.extraCharge || 0), 0);
  const baseFareTotal = (selectedFlight?.price || 0) * passengerCount;
  const totalAmount = baseFareTotal + seatCharges;

  const toggleSeat = (seat) => {
    if (seat.status === 'reserved') {
      return;
    }

    setError('');
    setSelectedSeats((current) => {
      const alreadySelected = current.some((item) => item.seatNumber === seat.seatNumber);

      if (alreadySelected) {
        return current.filter((item) => item.seatNumber !== seat.seatNumber);
      }

      if (current.length >= passengerCount) {
        setError(`You can select only ${passengerCount} seat${passengerCount === 1 ? '' : 's'}.`);
        return current;
      }

      return [...current, seat];
    });
  };

  const continueToPayment = () => {
    if (!selectedFlight) {
      setError('Select a flight before choosing seats.');
      return;
    }

    if (selectedSeats.length !== passengerCount) {
      setError(`Please select ${passengerCount} seat${passengerCount === 1 ? '' : 's'} to continue.`);
      return;
    }

    localStorage.setItem('traveltest_selected_seats', JSON.stringify(selectedSeats));
    localStorage.setItem(
      'traveltest_seat_summary',
      JSON.stringify({
        passengerCount,
        seatCharges,
        selectedSeatNumbers: selectedSeats.map((seat) => seat.seatNumber),
      }),
    );
    localStorage.removeItem('traveltest_selected_hotel');
    navigate('/payment');
  };

  if (!selectedFlight) {
    return (
      <section className="bg-slate-50 px-4 py-16 sm:px-6 lg:px-8" data-testid="flight-seat-selection-page">
        <div className="mx-auto max-w-3xl rounded-3xl border border-slate-100 bg-white p-8 text-center shadow-sm">
          <h1 className="font-heading text-3xl font-bold text-slate-950">No flight selected</h1>
          <p className="mt-3 text-slate-600">Choose a flight before opening the seat map.</p>
          <Button as={Link} to="/flights/results" className="mt-6">
            Back to results
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section
      className="min-h-screen bg-slate-50 bg-cover bg-fixed bg-center py-10"
      style={{
        backgroundImage: `linear-gradient(rgba(248,250,252,0.94), rgba(248,250,252,0.97)), url(${images.flightBanner})`,
      }}
      data-testid="flight-seat-selection-page"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 rounded-3xl bg-slate-950 p-6 text-white shadow-xl sm:p-8">
          <p className="text-sm font-bold uppercase tracking-wide text-accent-400">Seat selection</p>
          <h1 className="mt-2 font-heading text-3xl font-bold">Choose your seats</h1>
          <p className="mt-2 text-sm text-blue-100">
            {selectedFlight.airline} | {selectedFlight.flightNumber} | {selectedFlight.source} to {selectedFlight.destination}
          </p>
        </div>

        <div className={isViewOnly ? 'grid gap-6' : 'grid gap-6 lg:grid-cols-[1fr_360px]'}>
          <div className="grid gap-6">
            <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
              <SeatLegend />
            </div>
            <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
              <p className="text-sm font-semibold text-slate-600">Only available seats are shown here; reserved seats are hidden.</p>
              {isViewOnly ? (
                <p className="mt-2 text-sm text-slate-500">Viewing available seats only. Booking summary is hidden in this mode.</p>
              ) : null}
              {seatLoadError ? (
                <p className="mt-2 text-sm font-semibold text-amber-700">{seatLoadError}</p>
              ) : null}
            </div>
            <SeatMap seats={availableSeats} selectedSeats={selectedSeats} onToggleSeat={toggleSeat} />
          </div>

          {!isViewOnly ? (
            <aside className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm lg:sticky lg:top-24 lg:self-start" data-testid="booking-summary-card">
              <div className="flex items-center justify-between">
                <h2 className="font-heading text-xl font-bold text-slate-950">Booking summary</h2>
                <Badge>{passengerCount} passenger{passengerCount === 1 ? '' : 's'}</Badge>
              </div>

              <div className="mt-5 rounded-2xl bg-slate-50 p-4">
                <p className="font-bold text-slate-950">{selectedFlight.airline}</p>
                <p className="mt-1 text-sm text-slate-600">{selectedFlight.source} to {selectedFlight.destination}</p>
                <p className="mt-1 text-sm text-slate-600">{selectedFlight.departureTime} | {selectedFlight.travelClass}</p>
              </div>

              <div className="mt-5" data-testid="selected-seat-summary">
                <p className="text-sm font-semibold text-slate-700">Selected seats</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {selectedSeats.length > 0 ? (
                    selectedSeats.map((seat) => (
                      <button
                        key={seat.seatNumber}
                        type="button"
                        onClick={() => toggleSeat(seat)}
                        className="rounded-full bg-accent-500 px-3 py-1 text-xs font-bold text-white"
                      >
                        {seat.seatNumber}
                      </button>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500">No seats selected yet.</p>
                  )}
                </div>
              </div>

              <div className="mt-5 space-y-3 border-t border-slate-100 pt-5 text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>Base fare</span>
                  <span>Rs. {baseFareTotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Seat charges</span>
                  <span>Rs. {seatCharges.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between border-t border-slate-100 pt-4 text-lg font-bold text-slate-950">
                  <span>Total</span>
                  <span>Rs. {totalAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {error ? <p className="mt-4 text-sm font-semibold text-red-600" data-testid="seat-selection-validation-message">{error}</p> : null}

              <Button type="button" onClick={continueToPayment} className="mt-6 w-full" data-testid="continue-payment-button">
                Continue to Payment
              </Button>
            </aside>
          ) : null}
        </div>
      </div>
    </section>
  );
}

export default FlightSeatSelectionPage;
