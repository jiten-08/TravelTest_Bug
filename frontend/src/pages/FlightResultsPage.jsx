import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Badge from '../components/Badge.jsx';
import Button from '../components/Button.jsx';
import EmptyState from '../components/EmptyState.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import flights from '../data/flights.json';
import images from '../data/images.js';
import FancySelect from '../components/FancySelect.jsx';
import SeatLegend from '../components/SeatLegend.jsx';
import SeatMap from '../components/SeatMap.jsx';
import { generateSeatMap } from '../utils/seatMap.js';
import { bookingsApi, flightsApi, getApiErrorMessage } from '../services/api.js';

function durationToMinutes(duration) {
  const hours = duration.match(/(\d+)h/);
  const minutes = duration.match(/(\d+)m/);
  return (hours ? Number(hours[1]) * 60 : 0) + (minutes ? Number(minutes[1]) : 0);
}

function getStoredSearch() {
  const savedSearch = localStorage.getItem('traveltest_flight_search');
  return savedSearch ? JSON.parse(savedSearch) : null;
}

function FlightResultsPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [airlineFilter, setAirlineFilter] = useState('all');
  const [sortBy, setSortBy] = useState('price-asc');
  const [searchDetails] = useState(getStoredSearch);
  const [seatPreviewFlight, setSeatPreviewFlight] = useState(null);
  const [previewBookedSeatNumbers, setPreviewBookedSeatNumbers] = useState([]);
  const [previewSeatError, setPreviewSeatError] = useState('');
  const [availableFlights, setAvailableFlights] = useState([]);
  const [apiError, setApiError] = useState('');

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setApiError('');

    const params = searchDetails
      ? {
          source: searchDetails.source,
          destination: searchDetails.destination,
          travel_class: searchDetails.travelClass,
        }
      : {};

    flightsApi.search(params)
      .then((apiFlights) => {
        if (isMounted) {
          setAvailableFlights(apiFlights);
        }
      })
      .catch((error) => {
        if (isMounted) {
          const fallbackFlights = searchDetails
            ? flights.filter(
                (flight) =>
                  flight.source === searchDetails.source &&
                  flight.destination === searchDetails.destination &&
                  flight.travelClass === searchDetails.travelClass,
              )
            : flights;
          setAvailableFlights(fallbackFlights);
          setApiError(getApiErrorMessage(error, 'Showing local sample flights because the backend is not available.'));
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [searchDetails]);

  const airlines = useMemo(() => [...new Set(availableFlights.map((flight) => flight.airline))].sort(), [availableFlights]);

  const results = useMemo(() => {
    const filteredFlights =
      airlineFilter === 'all' ? availableFlights : availableFlights.filter((flight) => flight.airline === airlineFilter);

    return [...filteredFlights].sort((first, second) => {
      if (sortBy === 'price-desc') {
        return second.price - first.price;
      }

      if (sortBy === 'duration-asc') {
        return durationToMinutes(first.duration) - durationToMinutes(second.duration);
      }

      if (sortBy === 'duration-desc') {
        return durationToMinutes(second.duration) - durationToMinutes(first.duration);
      }

      return first.price - second.price;
    });
  }, [airlineFilter, availableFlights, sortBy]);

  const handleSelectFlight = (flight) => {
    localStorage.setItem('traveltest_selected_flight', JSON.stringify(flight));
    localStorage.setItem('traveltest_flight_search', JSON.stringify(searchDetails));
    localStorage.removeItem('traveltest_selected_seats');
    localStorage.removeItem('traveltest_seat_summary');
    localStorage.removeItem('traveltest_selected_hotel');
    navigate('/flights/seats?mode=book');
  };

  const handleViewSeats = (flight) => {
    setSeatPreviewFlight(flight);
    setPreviewBookedSeatNumbers([]);
    setPreviewSeatError('');

    bookingsApi.bookedSeats(flight.id)
      .then((seatNumbers) => setPreviewBookedSeatNumbers(seatNumbers))
      .catch((error) => {
        setPreviewBookedSeatNumbers([]);
        setPreviewSeatError(getApiErrorMessage(error, 'Could not load booked seats for this flight.'));
      });
  };

  const previewSeats = useMemo(() => {
    if (!seatPreviewFlight) {
      return [];
    }

    const booked = new Set(previewBookedSeatNumbers);
    return generateSeatMap(seatPreviewFlight.id)
      .map((seat) => (booked.has(seat.seatNumber) ? { ...seat, status: 'reserved' } : seat))
      .filter((seat) => seat.status === 'available');
  }, [previewBookedSeatNumbers, seatPreviewFlight]);

  return (
    <section
      className="min-h-screen bg-[#eef1f8] bg-cover bg-fixed bg-center px-3 py-6 sm:px-6 lg:px-8"
      style={{
        backgroundImage: `linear-gradient(rgba(238, 241, 248, 0.92), rgba(238, 241, 248, 0.94)), url(${images.flightBanner})`,
      }}
      data-testid="flight-results-page"
    >
      <div className="mx-auto max-w-[1440px] overflow-hidden rounded-[2rem] border border-white/70 bg-[#f5f6fb] shadow-2xl shadow-blue-900/10">
        <div className="grid gap-0 lg:grid-cols-[1fr_310px]">
          <main className="min-w-0 px-4 py-5 sm:px-7 lg:px-8">
            <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
              <div>
                <p className="text-sm font-bold text-slate-500" data-testid="flight-results-eyebrow">
                  All available flights
                </p>
                <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl" data-testid="flight-results-title">
                  {results.length || flights.length} matching flight{(results.length || flights.length) === 1 ? '' : 's'}
                </h1>
                {searchDetails ? (
                  <p className="mt-2 text-sm font-semibold text-slate-500" data-testid="flight-results-search-summary">
                    {searchDetails.source} to {searchDetails.destination} | {searchDetails.travelClass} |{' '}
                    {searchDetails.passengers} passenger(s)
                  </p>
                ) : null}
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center" data-testid="flight-results-controls">
                <Button as={Link} to="/flights/search" variant="secondary" className="h-11 px-5" data-testid="flight-results-edit-search-link">
                  Edit search
                </Button>
                <label className="sr-only" htmlFor="flight-sort-dropdown">
                  Sort results
                </label>
                <FancySelect
                  id="flight-sort-dropdown"
                  name="flightSort"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  options={[
                    { value: 'price-asc', label: 'Lowest price' },
                    { value: 'price-desc', label: 'Highest price' },
                    { value: 'duration-asc', label: 'Shortest duration' },
                    { value: 'duration-desc', label: 'Longest duration' },
                  ]}
                  data-testid="flight-sort-dropdown"
                />
              </div>
            </div>

            {apiError ? (
              <p className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700">
                {apiError}
              </p>
            ) : null}

            {isLoading ? (
              <div className="rounded-[1.75rem] bg-white p-4 shadow-sm" data-testid="flight-results-loading-skeleton">
                <div className="grid gap-4">
                  {[1, 2, 3].map((item) => (
                    <div key={item} className="h-40 animate-pulse rounded-[1.5rem] bg-slate-100" />
                  ))}
                </div>
                <LoadingSpinner label="Loading flight results" />
              </div>
            ) : results.length === 0 ? (
              <EmptyState
                title="No flights found"
                description="Try another route, class, or airline filter to see available flights."
                testId="flight-results-empty-state"
              />
            ) : (
              <div className="grid gap-4" data-testid="flight-results-table">
                {results.map((flight, index) => (
                  <article
                    key={flight.id}
                    className="grid gap-5 rounded-[1.6rem] bg-white p-4 shadow-sm ring-1 ring-slate-100 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-900/10 xl:grid-cols-[minmax(190px,1.1fr)_minmax(300px,1.5fr)_minmax(150px,0.75fr)_minmax(150px,0.72fr)] xl:items-center"
                    data-testid={`flight-result-row-${flight.id}`}
                  >
                    <div className="flex min-w-0 items-center gap-4">
                      <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-2xl bg-gradient-to-br from-slate-50 to-blue-100">
                        <img
                          src={images.flightBanner}
                          alt={`${flight.airline} aircraft`}
                          loading="lazy"
                          className="h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 bg-white/20" />
                      </div>
                      <div className="min-w-0">
                        <div className="mb-2 flex flex-wrap gap-2">
                          <Badge className="bg-slate-100 text-slate-700">{flight.travelClass}</Badge>
                          {index === 0 ? <Badge className="bg-primary-50 text-primary-700">Best choice</Badge> : null}
                        </div>
                        <p className="text-base font-bold leading-tight text-slate-950">{flight.airline}</p>
                        <p className="mt-1 text-xs font-bold uppercase tracking-wide text-slate-400">{flight.flightNumber}</p>
                      </div>
                    </div>

                    <div className="grid min-w-0 grid-cols-[1fr_minmax(110px,1.35fr)_1fr] items-center gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-xs font-bold text-slate-400">{flight.source}</p>
                        <p className="mt-1 text-2xl font-bold text-slate-950 sm:text-3xl">{flight.source.slice(0, 3).toUpperCase()}</p>
                        <p className="mt-1 text-xs font-semibold text-slate-500">{flight.departureTime}</p>
                      </div>

                      <div className="flex min-w-0 flex-col items-center">
                        <span className="text-xs font-bold text-slate-400">{flight.duration}</span>
                        <div className="my-3 flex w-full items-center gap-2">
                          <span className="h-2 w-2 shrink-0 rounded-full bg-slate-300" />
                          <span className="h-px min-w-4 flex-1 border-t border-dashed border-slate-300" />
                          <span className="rounded-full bg-slate-950 px-2 py-1 text-[10px] font-bold text-white">AIR</span>
                          <span className="h-px min-w-4 flex-1 border-t border-dashed border-slate-300" />
                          <span className="h-2 w-2 shrink-0 rounded-full bg-slate-300" />
                        </div>
                        <span className="text-xs font-semibold text-slate-500">Direct route</span>
                      </div>

                      <div className="min-w-0 text-right">
                        <p className="truncate text-xs font-bold text-slate-400">{flight.destination}</p>
                        <p className="mt-1 text-2xl font-bold text-slate-950 sm:text-3xl">{flight.destination.slice(0, 3).toUpperCase()}</p>
                        <p className="mt-1 text-xs font-semibold text-slate-500">{flight.arrivalTime}</p>
                      </div>
                    </div>

                    <div className="rounded-2xl bg-slate-50 p-4 text-left xl:text-right">
                      <p className="text-xs font-bold text-emerald-500">-{index % 3 === 0 ? 15 : 8}%</p>
                      <p className="mt-1 text-2xl font-bold tracking-tight text-slate-950">
                        Rs. {flight.price.toLocaleString('en-IN')}
                      </p>
                      <p className="mt-1 text-xs font-semibold text-slate-500">{flight.seatsAvailable} seats left</p>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                      <button
                        type="button"
                        onClick={() => handleViewSeats(flight)}
                        className="rounded-2xl border border-primary-200 bg-primary-50 px-4 py-3 text-sm font-semibold text-primary-700 transition-all hover:border-primary-300 hover:bg-primary-100 focus-ring"
                        data-testid="view-seats-button"
                      >
                        View Seats
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSelectFlight(flight)}
                        className="rounded-2xl bg-gradient-to-r from-primary-600 to-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-900/20 transition-all hover:-translate-y-0.5 hover:from-primary-700 hover:to-indigo-700 focus-ring"
                        data-testid={`select-flight-button-${flight.id}`}
                      >
                        Booking Now
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </main>

          <aside className="border-t border-slate-200 bg-white px-5 py-6 lg:border-l lg:border-t-0" data-testid="flight-results-filter-sidebar">
            <div className="sticky top-24">
              <button
                type="button"
                className="mb-6 h-12 w-full rounded-2xl border border-indigo-300 bg-white text-sm font-semibold text-indigo-700 shadow-sm transition-all hover:bg-indigo-50 focus-ring"
                data-testid="flight-results-notify-button"
              >
                Notify me
              </button>

              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-950" data-testid="flight-results-filter-title">
                  Filters
                </h2>
                <button type="button" className="text-xs font-bold text-slate-400 hover:text-slate-700" data-testid="flight-results-filter-reset-button">
                  Reset
                </button>
              </div>

              <div className="space-y-5">
                <div className="border-b border-slate-100 pb-5" data-testid="flight-price-filter-section">
                  <div className="mb-4 flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-800">Price</p>
                    <span className="text-sm font-semibold text-slate-400">^</span>
                  </div>
                  <div className="relative h-2 rounded-full bg-slate-100">
                    <div className="absolute left-[18%] right-[20%] h-2 rounded-full bg-indigo-600" />
                    <div className="absolute left-[18%] top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-indigo-600 ring-4 ring-indigo-100" />
                    <div className="absolute right-[20%] top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-indigo-600 ring-4 ring-indigo-100" />
                  </div>
                  <div className="mt-3 flex justify-between text-xs font-bold text-slate-500">
                    <span>Rs. 3,000</span>
                    <span>Rs. 20,000</span>
                  </div>
                </div>

                <div className="border-b border-slate-100 pb-5" data-testid="flight-airline-filter-section">
                  <label className="block text-sm font-semibold text-slate-800" htmlFor="flight-airline-filter-dropdown">
                    Airline
                  </label>
                  <FancySelect
                    id="flight-airline-filter-dropdown"
                    name="airlineFilter"
                    value={airlineFilter}
                    onChange={(e) => setAirlineFilter(e.target.value)}
                    options={[{ value: 'all', label: 'All airlines' }, ...airlines.map((a) => ({ value: a, label: a }))]}
                    data-testid="flight-airline-filter-dropdown"
                  />
                </div>

                <div className="border-b border-slate-100 pb-5" data-testid="flight-discount-filter-section">
                  <p className="mb-3 text-sm font-semibold text-slate-800">Discount from</p>
                  <div className="flex flex-wrap gap-2">
                    {['5%', '10%', '15%', '20%'].map((discount) => (
                      <span key={discount} className="rounded-full border border-slate-200 px-3 py-2 text-xs font-bold text-slate-500">
                        {discount}
                      </span>
                    ))}
                  </div>
                </div>

                {['Departure time', 'Arrival time', 'Aircraft category', 'Cabin size', 'Operator rating from'].map((label) => (
                  <button
                    key={label}
                    type="button"
                    className="flex w-full items-center justify-between border-b border-slate-100 pb-5 text-left text-sm font-semibold text-slate-800"
                    data-testid={`flight-filter-${label.toLowerCase().replaceAll(' ', '-')}-button`}
                  >
                    {label}
                    <span className="text-slate-400">v</span>
                  </button>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>

      {seatPreviewFlight ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-8" data-testid="flight-seat-preview-modal">
          <div className="max-h-full w-full max-w-5xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
            <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-start sm:justify-between sm:p-6">
              <div>
                <p className="text-sm font-bold uppercase tracking-wide text-accent-500">Seat preview</p>
                <h2 className="mt-1 font-heading text-2xl font-bold text-slate-950" data-testid="flight-seat-preview-title">
                  {seatPreviewFlight.airline} | {seatPreviewFlight.flightNumber}
                </h2>
                <p className="mt-2 text-sm font-semibold text-slate-500">
                  {seatPreviewFlight.source} to {seatPreviewFlight.destination} | {seatPreviewFlight.travelClass}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSeatPreviewFlight(null)}
                className="self-start rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700 focus-ring"
                data-testid="flight-seat-preview-close-button"
              >
                Close
              </button>
            </div>

            <div className="grid gap-5 p-5 sm:p-6">
              <div className="rounded-3xl border border-slate-100 bg-slate-50 p-5">
                <SeatLegend />
              </div>
              <div className="rounded-3xl border border-slate-100 bg-slate-50 p-5">
                <p className="text-sm font-semibold text-slate-600">
                  Available seats are shown for preview. Continue with booking to choose seats and proceed to payment.
                </p>
                {previewSeatError ? (
                  <p className="mt-2 text-sm font-semibold text-amber-700">{previewSeatError}</p>
                ) : null}
              </div>
              <SeatMap seats={previewSeats} selectedSeats={[]} onToggleSeat={() => {}} />
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

export default FlightResultsPage;
