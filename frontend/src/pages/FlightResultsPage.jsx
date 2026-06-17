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

function getCityCode(city = '') {
  const cityCodes = {
    Bengaluru: 'BLR',
    Chennai: 'MAA',
    Goa: 'GOI',
    Hyderabad: 'HYD',
    Jaipur: 'JAI',
    Kolkata: 'CCU',
    Mumbai: 'BOM',
    'New Delhi': 'DEL',
    Pune: 'PNQ',
  };

  return cityCodes[city] || city.slice(0, 3).toUpperCase();
}

function formatTravelDate(value) {
  if (!value) {
    return 'Flexible date';
  }

  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
  }).format(new Date(value));
}

function getSelectedTravelClass(searchDetails) {
  return searchDetails?.travelClass && searchDetails.travelClass !== 'all' ? searchDetails.travelClass : '';
}

function getTravelClassLabel(searchDetails) {
  return getSelectedTravelClass(searchDetails) || 'All classes';
}

function getRecommendedFlights(allFlights, searchDetails) {
  if (!searchDetails) {
    return allFlights;
  }

  const source = String(searchDetails.source || '').toLowerCase();
  const destination = String(searchDetails.destination || '').toLowerCase();

  return allFlights
    .map((flight) => {
      const sameSource = String(flight.source || '').toLowerCase() === source;
      const sameDestination = String(flight.destination || '').toLowerCase() === destination;
      const sameRoute = sameSource && sameDestination;
      const routeScore = sameRoute ? 3 : Number(sameSource) + Number(sameDestination);

      return {
        ...flight,
        recommendationScore: routeScore,
        recommendationLabel: sameRoute ? 'Recommended route' : 'Suggested flight',
      };
    })
    .filter((flight) => flight.recommendationScore > 0)
    .sort((first, second) => second.recommendationScore - first.recommendationScore || first.price - second.price)
    .slice(0, 8);
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
  const [isRecommendedResults, setIsRecommendedResults] = useState(false);
  const [apiError, setApiError] = useState('');
  const passengerCount = Math.max(Number(searchDetails?.passengers || 1), 1);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setApiError('');
    setIsRecommendedResults(false);

    const selectedTravelClass = getSelectedTravelClass(searchDetails);
    const params = searchDetails
      ? {
          source: searchDetails.source,
          destination: searchDetails.destination,
          ...(selectedTravelClass ? { travel_class: selectedTravelClass } : {}),
        }
      : {};

    flightsApi.search(params)
      .then(async (apiFlights) => {
        if (apiFlights.length > 0 || !searchDetails) {
          return { flights: apiFlights, recommended: false };
        }

        const allFlights = await flightsApi.search();
        return {
          flights: getRecommendedFlights(allFlights, searchDetails),
          recommended: true,
        };
      })
      .then(({ flights: nextFlights, recommended }) => {
        if (isMounted) {
          setAvailableFlights(nextFlights);
          setIsRecommendedResults(recommended);
        }
      })
      .catch((error) => {
        if (isMounted) {
          const exactFallbackFlights = searchDetails
            ? flights.filter((flight) => {
                const matchesRoute = flight.source === searchDetails.source && flight.destination === searchDetails.destination;
                const matchesClass = !selectedTravelClass || flight.travelClass === selectedTravelClass;
                return matchesRoute && matchesClass;
              })
            : flights;

          if (exactFallbackFlights.length > 0 || !searchDetails) {
            setAvailableFlights(exactFallbackFlights);
            setIsRecommendedResults(false);
          } else {
            setAvailableFlights(getRecommendedFlights(flights, searchDetails));
            setIsRecommendedResults(true);
          }

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

    bookingsApi.bookedSeats(flight.id, searchDetails?.departureDate)
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
                  {isRecommendedResults ? 'Recommended flights' : 'All available flights'}
                </p>
                <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl" data-testid="flight-results-title">
                  {results.length} {isRecommendedResults ? 'recommended' : 'matching'} flight{results.length === 1 ? '' : 's'}
                </h1>
                {searchDetails ? (
                  <p className="mt-2 text-sm font-semibold text-slate-500" data-testid="flight-results-search-summary">
                    {searchDetails.source} to {searchDetails.destination} | {getTravelClassLabel(searchDetails)} |{' '}
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
            {isRecommendedResults ? (
              <p className="mb-4 rounded-2xl border border-primary-100 bg-primary-50 px-4 py-3 text-sm font-semibold text-primary-700">
                Showing recommended flights based on your selected source and destination.
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
                title="No recommended flights available"
                description="Try another route or remove filters to see available flights."
                testId="flight-results-empty-state"
              />
            ) : (
              <div className="grid gap-4" data-testid="flight-results-table">
                {results.map((flight, index) => (
                  <article
                    key={flight.id}
                    className="overflow-hidden rounded-[1.6rem] border border-slate-100 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-900/10"
                    data-testid={`flight-result-row-${flight.id}`}
                  >
                    <div className="grid gap-0 xl:grid-cols-[1fr_210px]">
                      <div className="p-5 sm:p-6">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0">
                            <div className="mb-4 flex flex-wrap gap-2">
                              <Badge className="bg-primary-50 text-primary-700">{flight.travelClass}</Badge>
                              <Badge className="bg-accent-50 text-accent-700">Direct</Badge>
                              {isRecommendedResults ? (
                                <Badge className="bg-indigo-50 text-indigo-700">{flight.recommendationLabel || 'Suggested'}</Badge>
                              ) : null}
                              {index === 0 ? <Badge className="bg-slate-100 text-slate-700">Best choice</Badge> : null}
                            </div>
                            <h2 className="text-lg font-extrabold uppercase tracking-wide text-slate-950">
                              {flight.airline} {flight.flightNumber}
                            </h2>
                            <p className="mt-1 text-sm font-semibold text-slate-500">
                              {searchDetails?.passengers || 1} passenger{Number(searchDetails?.passengers || 1) === 1 ? '' : 's'}
                            </p>
                          </div>
                        </div>

                        <div className="mt-7 grid gap-6 lg:grid-cols-[180px_1fr] lg:items-end">
                          <div className="relative h-28 overflow-hidden rounded-2xl bg-gradient-to-br from-primary-50 via-white to-accent-50">
                            <img
                              src={images.flightBanner}
                              alt={`${flight.airline} aircraft`}
                              loading="lazy"
                              className="h-full w-full object-cover opacity-90"
                            />
                            <div className="absolute inset-0 bg-white/30" />
                          </div>

                          <div className="grid min-w-0 gap-5 sm:grid-cols-[1fr_minmax(180px,1.2fr)_1fr] sm:items-end">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-slate-500">{flight.source}</p>
                              <p className="mt-1 text-4xl font-extrabold tracking-tight text-slate-950">{getCityCode(flight.source)}</p>
                              <p className="mt-1 text-sm font-semibold text-slate-500">
                                {formatTravelDate(searchDetails?.departureDate)}, {flight.departureTime}
                              </p>
                            </div>

                            <div className="flex min-w-0 flex-col items-center py-2">
                              <div className="flex w-full items-center gap-2">
                                <span className="h-3 w-3 shrink-0 rounded-full border-4 border-primary-100 bg-primary-600" />
                                <span className="h-px min-w-6 flex-1 border-t-2 border-dashed border-primary-200" />
                                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-primary-600 to-indigo-600 text-sm font-bold text-white shadow-lg shadow-blue-900/20">
                                  {'>'}
                                </span>
                                <span className="h-px min-w-6 flex-1 border-t-2 border-dashed border-primary-200" />
                                <span className="h-3 w-3 shrink-0 rounded-full border-4 border-accent-100 bg-accent-500" />
                              </div>
                              <p className="mt-3 text-sm font-bold text-slate-500">{flight.duration}</p>
                            </div>

                            <div className="min-w-0 sm:text-right">
                              <p className="truncate text-sm font-semibold text-slate-500">{flight.destination}</p>
                              <p className="mt-1 text-4xl font-extrabold tracking-tight text-slate-950">{getCityCode(flight.destination)}</p>
                              <p className="mt-1 text-sm font-semibold text-slate-500">
                                {formatTravelDate(searchDetails?.departureDate)}, {flight.arrivalTime}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="grid gap-4 border-t border-slate-100 bg-gradient-to-br from-primary-50 to-white p-5 sm:grid-cols-[1fr_1fr] xl:block xl:border-l xl:border-t-0 xl:p-6">
                        <div className="xl:text-right">
                          <p className="mt-1 text-3xl font-extrabold tracking-tight text-slate-950">
                            Rs. {flight.price.toLocaleString('en-IN')}
                          </p>
                          <p className="mt-1 text-sm font-semibold text-slate-500">Per passenger</p>
                          <p className="mt-2 text-sm font-bold text-primary-700">
                            Total Rs. {(flight.price * passengerCount).toLocaleString('en-IN')} for {passengerCount} passenger
                            {passengerCount === 1 ? '' : 's'}
                          </p>
                          <p className="mt-1 text-sm font-semibold text-slate-500">{flight.seatsAvailable} seats left</p>
                        </div>
                        <div className="grid gap-3 xl:mt-8">
                          <button
                            type="button"
                            onClick={() => handleViewSeats(flight)}
                            className="rounded-2xl border border-primary-200 bg-white px-4 py-3 text-sm font-bold text-primary-700 shadow-sm transition-all hover:border-primary-300 hover:bg-primary-50 focus-ring"
                            data-testid="view-seats-button"
                          >
                            View Details
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSelectFlight(flight)}
                            className="rounded-2xl bg-gradient-to-r from-primary-600 to-indigo-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-blue-900/20 transition-all hover:-translate-y-0.5 hover:from-primary-700 hover:to-indigo-700 focus-ring"
                            data-testid={`select-flight-button-${flight.id}`}
                          >
                            Booking Now
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </main>

          <aside className="border-t border-slate-200 bg-white px-5 py-6 lg:border-l lg:border-t-0" data-testid="flight-results-filter-sidebar">
            <div className="sticky top-24">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-950" data-testid="flight-results-filter-title">
                  Filters
                </h2>
              </div>

              <div className="space-y-5">
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
