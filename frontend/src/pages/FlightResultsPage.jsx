import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Badge from '../components/Badge.jsx';
import Button from '../components/Button.jsx';
import EmptyState from '../components/EmptyState.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import flights from '../data/flights.json';
import images from '../data/images.js';

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

  useEffect(() => {
    const timer = window.setTimeout(() => setIsLoading(false), 700);
    return () => window.clearTimeout(timer);
  }, []);

  const airlines = useMemo(() => [...new Set(flights.map((flight) => flight.airline))].sort(), []);

  const results = useMemo(() => {
    if (!searchDetails) {
      return [];
    }

    const matchedFlights = flights.filter(
      (flight) =>
        flight.source === searchDetails.source &&
        flight.destination === searchDetails.destination &&
        flight.travelClass === searchDetails.travelClass,
    );

    const filteredFlights =
      airlineFilter === 'all' ? matchedFlights : matchedFlights.filter((flight) => flight.airline === airlineFilter);

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
  }, [airlineFilter, searchDetails, sortBy]);

  const handleSelectFlight = (flight) => {
    localStorage.setItem('traveltest_selected_flight', JSON.stringify(flight));
    localStorage.setItem('traveltest_flight_search', JSON.stringify(searchDetails));
    localStorage.removeItem('traveltest_selected_seats');
    localStorage.removeItem('traveltest_seat_summary');
    localStorage.removeItem('traveltest_selected_hotel');
    navigate('/flights/seats?mode=book');
  };

  const handleViewSeats = (flight) => {
    localStorage.setItem('traveltest_selected_flight', JSON.stringify(flight));
    localStorage.setItem('traveltest_flight_search', JSON.stringify(searchDetails));
    localStorage.removeItem('traveltest_selected_seats');
    localStorage.removeItem('traveltest_seat_summary');
    localStorage.removeItem('traveltest_selected_hotel');
    navigate('/flights/seats?mode=view');
  };

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
                <select
                  id="flight-sort-dropdown"
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value)}
                  className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 shadow-sm transition-all hover:border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  data-testid="flight-sort-dropdown"
                >
                  <option value="price-asc">Lowest price</option>
                  <option value="price-desc">Highest price</option>
                  <option value="duration-asc">Shortest duration</option>
                  <option value="duration-desc">Longest duration</option>
                </select>
              </div>
            </div>

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
              <div className="overflow-x-auto pb-2">
                <table className="w-full min-w-[980px] border-separate border-spacing-y-4" data-testid="flight-results-table">
                  <thead className="sr-only">
                    <tr>
                      <th>Airline</th>
                      <th>Flight Number</th>
                      <th>Source</th>
                      <th>Destination</th>
                      <th>Departure Time</th>
                      <th>Arrival Time</th>
                      <th>Duration</th>
                      <th>Price</th>
                      <th>Seats Available</th>
                      <th>Select Button</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((flight, index) => (
                      <tr
                        key={flight.id}
                        className="group rounded-[1.6rem] bg-white shadow-sm ring-1 ring-slate-100 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-900/10"
                        data-testid={`flight-result-row-${flight.id}`}
                      >
                        <td className="rounded-l-[1.6rem] px-5 py-5 align-middle">
                          <div className="flex min-w-[250px] items-center gap-4">
                            <div className="relative h-20 w-32 overflow-hidden rounded-2xl bg-gradient-to-br from-slate-50 to-blue-100">
                              <img
                                src={images.flightBanner}
                                alt={`${flight.airline} aircraft`}
                                loading="lazy"
                                className="h-full w-full object-cover"
                              />
                              <div className="absolute inset-0 bg-white/20" />
                            </div>
                            <div>
                              <div className="mb-2 flex flex-wrap gap-2">
                                <Badge className="bg-slate-100 text-slate-700">{flight.travelClass}</Badge>
                                {index === 0 ? <Badge className="bg-primary-50 text-primary-700">Best choice</Badge> : null}
                              </div>
                              <p className="text-base font-bold text-slate-950">{flight.airline}</p>
                              <p className="mt-1 text-xs font-bold uppercase tracking-wide text-slate-400">{flight.flightNumber}</p>
                            </div>
                          </div>
                        </td>

                        <td className="hidden px-2 py-5 align-middle text-sm font-semibold text-slate-500 xl:table-cell">
                          {flight.flightNumber}
                        </td>

                        <td className="px-4 py-5 align-middle">
                          <p className="text-xs font-bold text-slate-400">{flight.source}</p>
                          <p className="mt-1 text-3xl font-bold text-slate-950">{flight.source.slice(0, 3).toUpperCase()}</p>
                          <p className="mt-1 text-xs font-semibold text-slate-500">{flight.departureTime}</p>
                        </td>

                        <td className="px-4 py-5 align-middle">
                          <div className="flex min-w-[160px] flex-col items-center">
                            <span className="text-xs font-bold text-slate-400">{flight.duration}</span>
                            <div className="my-3 flex w-full items-center gap-2">
                              <span className="h-2 w-2 rounded-full bg-slate-300" />
                              <span className="h-px flex-1 border-t border-dashed border-slate-300" />
                              <span className="rounded-full bg-slate-950 px-2 py-1 text-[10px] font-bold text-white">AIR</span>
                              <span className="h-px flex-1 border-t border-dashed border-slate-300" />
                              <span className="h-2 w-2 rounded-full bg-slate-300" />
                            </div>
                            <span className="text-xs font-semibold text-slate-500">Direct route</span>
                          </div>
                        </td>

                        <td className="px-4 py-5 align-middle">
                          <p className="text-xs font-bold text-slate-400">{flight.destination}</p>
                          <p className="mt-1 text-3xl font-bold text-slate-950">{flight.destination.slice(0, 3).toUpperCase()}</p>
                          <p className="mt-1 text-xs font-semibold text-slate-500">{flight.arrivalTime}</p>
                        </td>

                        <td className="hidden px-3 py-5 align-middle text-sm font-semibold text-slate-500 2xl:table-cell">
                          {flight.departureTime}
                        </td>
                        <td className="hidden px-3 py-5 align-middle text-sm font-semibold text-slate-500 2xl:table-cell">
                          {flight.arrivalTime}
                        </td>
                        <td className="hidden px-3 py-5 align-middle text-sm font-semibold text-slate-500 2xl:table-cell">
                          {flight.duration}
                        </td>

                        <td className="px-5 py-5 align-middle">
                          <div className="min-w-[130px] text-right">
                            <p className="text-xs font-bold text-emerald-500">-{index % 3 === 0 ? 15 : 8}%</p>
                            <p className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
                              Rs. {flight.price.toLocaleString('en-IN')}
                            </p>
                            <p className="mt-1 text-xs font-semibold text-slate-500">{flight.seatsAvailable} seats left</p>
                            <button
                              type="button"
                              onClick={() => handleViewSeats(flight)}
                              className="mt-3 inline-flex rounded-2xl bg-gradient-to-r from-primary-600 to-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-blue-900/20 transition-all hover:from-primary-700 hover:to-indigo-700 focus-ring xl:hidden"
                              data-testid="view-seats-button"
                            >
                              View Seats
                            </button>
                          </div>
                        </td>

                        <td className="hidden px-2 py-5 align-middle text-sm font-semibold text-slate-500 xl:table-cell">
                          {flight.seatsAvailable}
                        </td>

                        <td className="sticky right-0 z-10 rounded-r-[1.6rem] bg-white px-5 py-5 align-middle shadow-[-14px_0_28px_rgba(15,23,42,0.06)]">
                          <div className="flex min-w-[150px] flex-col gap-3">
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
                              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 transition-all hover:border-blue-200 hover:bg-blue-50 focus-ring"
                              data-testid={`view-flight-details-button-${flight.id}`}
                            >
                              View Details
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
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
                  <select
                    id="flight-airline-filter-dropdown"
                    value={airlineFilter}
                    onChange={(event) => setAirlineFilter(event.target.value)}
                    className="mt-3 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500"
                    data-testid="flight-airline-filter-dropdown"
                  >
                    <option value="all">All airlines</option>
                    {airlines.map((airline) => (
                      <option key={airline} value={airline}>
                        {airline}
                      </option>
                    ))}
                  </select>
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
    </section>
  );
}

export default FlightResultsPage;
