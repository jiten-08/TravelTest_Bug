import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button.jsx';
import Card from '../components/Card.jsx';
import FancySelect from '../components/FancySelect.jsx';
import flights from '../data/flights.json';
import images from '../data/images.js';
import { flightsApi } from '../services/api.js';

const today = new Date().toISOString().split('T')[0];

const initialForm = {
  source: '',
  destination: '',
  departureDate: '',
  passengers: '1',
  travelClass: 'Economy',
};

function validateSearch(form) {
  const errors = {};

  if (!form.source) {
    errors.source = 'Select a source city.';
  }

  if (!form.destination) {
    errors.destination = 'Select a destination city.';
  }

  if (form.source && form.destination && form.source === form.destination) {
    errors.destination = 'Source and destination cannot be the same.';
  }

  if (!form.departureDate) {
    errors.departureDate = 'Select a departure date.';
  } else if (form.departureDate < today) {
    errors.departureDate = 'Departure date cannot be in the past.';
  }

  if (!form.passengers) {
    errors.passengers = 'Select passengers.';
  }

  if (!form.travelClass) {
    errors.travelClass = 'Select travel class.';
  }

  return errors;
}

function FlightSearchPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [flightOptions, setFlightOptions] = useState(flights);

  useEffect(() => {
    let isMounted = true;

    flightsApi.search()
      .then((apiFlights) => {
        if (isMounted && apiFlights.length > 0) {
          setFlightOptions(apiFlights);
        }
      })
      .catch(() => {
        if (isMounted) {
          setFlightOptions(flights);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const cities = useMemo(() => {
    const allCities = flightOptions.flatMap((flight) => [flight.source, flight.destination]);
    return [...new Set(allCities)].sort();
  }, [flightOptions]);

  const travelClasses = useMemo(() => [...new Set(flightOptions.map((flight) => flight.travelClass).filter(Boolean))].sort(), [flightOptions]);

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: '' }));
  };

  const swapCities = () => {
    setForm((current) => ({
      ...current,
      source: current.destination,
      destination: current.source,
    }));
    setErrors((current) => ({ ...current, source: '', destination: '' }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const validationErrors = validateSearch(form);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    localStorage.setItem('traveltest_flight_search', JSON.stringify(form));
    navigate('/flights/results');
  };

  return (
    <section
      className="relative overflow-hidden bg-gradient-to-br from-primary-700 to-indigo-700 px-4 py-12 sm:px-6 lg:px-8"
      data-testid="flight-search-page"
    >
      <img
        src={images.flightBanner}
        alt="Airplane wing above clouds"
        className="absolute inset-0 h-full w-full object-cover"
        loading="eager"
        onError={(event) => {
          event.currentTarget.style.display = 'none';
        }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(130deg,rgba(29,78,216,0.88),rgba(79,70,229,0.62)),radial-gradient(circle_at_82%_18%,rgba(249,115,22,0.38),transparent_28%)]" />
      <div className="relative mx-auto max-w-6xl">
        <div className="mb-8 max-w-3xl text-white">
          <p className="text-sm font-bold uppercase tracking-wide text-amber-200" data-testid="flight-search-eyebrow">
            Flight booking
          </p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl" data-testid="flight-search-title">
            Search flights that fit your trip.
          </h1>
          <p className="mt-4 text-base leading-7 text-blue-100">
            Choose your route, dates, passengers, and class in a layout that feels like a real travel portal.
          </p>
        </div>

        <Card className="bg-white/95 p-5 shadow-2xl backdrop-blur sm:p-8">
          <form className="grid gap-5 lg:grid-cols-12" onSubmit={handleSubmit} noValidate data-testid="flight-search-form">
            <div className="lg:col-span-5">
              <label className="block text-sm font-bold text-slate-700" htmlFor="flight-source-dropdown">
                Source city
              </label>
              <div className="mt-2 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition-all hover:border-primary-100">
                <span className="text-xs font-bold uppercase tracking-wide text-slate-400">From</span>
                  <FancySelect
                    id="flight-source-dropdown"
                    name="source"
                    value={form.source}
                    onChange={updateField}
                    options={[{ value: '', label: 'Select source' }, ...cities.map((c) => ({ value: c, label: c }))]}
                    data-testid="flight-source-dropdown"
                  />
              </div>
              {errors.source ? (
                <p className="mt-2 text-sm font-semibold text-red-600" data-testid="flight-source-validation-message">
                  {errors.source}
                </p>
              ) : null}
            </div>

            <div className="flex items-end justify-center lg:col-span-2">
              <button
                type="button"
                onClick={swapCities}
                className="mb-1 h-12 w-12 rounded-2xl border border-slate-100 bg-white text-lg font-bold text-primary-700 shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl focus-ring"
                data-testid="flight-city-swap-button"
                aria-label="Swap source and destination"
              >
                {'<->'}
              </button>
            </div>

            <div className="lg:col-span-5">
              <label className="block text-sm font-bold text-slate-700" htmlFor="flight-destination-dropdown">
                Destination city
              </label>
              <div className="mt-2 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition-all hover:border-primary-100">
                <span className="text-xs font-bold uppercase tracking-wide text-slate-400">To</span>
                  <FancySelect
                    id="flight-destination-dropdown"
                    name="destination"
                    value={form.destination}
                    onChange={updateField}
                    options={[{ value: '', label: 'Select destination' }, ...cities.map((c) => ({ value: c, label: c }))]}
                    data-testid="flight-destination-dropdown"
                  />
              </div>
              {errors.destination ? (
                <p className="mt-2 text-sm font-semibold text-red-600" data-testid="flight-destination-validation-message">
                  {errors.destination}
                </p>
              ) : null}
            </div>

            <div className="lg:col-span-12">
              <label className="block text-sm font-bold text-slate-700" htmlFor="flight-departure-date-input">
                Departure date
              </label>
              <input
                id="flight-departure-date-input"
                name="departureDate"
                type="date"
                min={today}
                value={form.departureDate}
                onChange={updateField}
                className="travel-field mt-2"
                data-testid="flight-departure-date-input"
              />
              {errors.departureDate ? (
                <p className="mt-2 text-sm font-semibold text-red-600" data-testid="flight-departure-date-validation-message">
                  {errors.departureDate}
                </p>
              ) : null}
            </div>

            <div className="lg:col-span-6">
              <label className="block text-sm font-bold text-slate-700" htmlFor="flight-passenger-selector">
                Passengers
              </label>
              <FancySelect
                id="flight-passenger-selector"
                name="passengers"
                value={form.passengers}
                onChange={updateField}
                options={[{ value: '', label: 'Select passengers' }, ...[1, 2, 3, 4, 5, 6].map((count) => ({ value: String(count), label: `${count} ${count === 1 ? 'passenger' : 'passengers'}` }))]}
                data-testid="flight-passenger-selector"
              />
              {errors.passengers ? (
                <p className="mt-2 text-sm font-semibold text-red-600" data-testid="flight-passenger-validation-message">
                  {errors.passengers}
                </p>
              ) : null}
            </div>

            <div className="lg:col-span-6">
              <label className="block text-sm font-bold text-slate-700" htmlFor="flight-class-dropdown">
                Travel class
              </label>
              <FancySelect
                id="flight-class-dropdown"
                name="travelClass"
                value={form.travelClass}
                onChange={updateField}
                options={travelClasses.map((tc) => ({ value: tc, label: tc }))}
                data-testid="flight-class-dropdown"
              />
              {errors.travelClass ? (
                <p className="mt-2 text-sm font-semibold text-red-600" data-testid="flight-class-validation-message">
                  {errors.travelClass}
                </p>
              ) : null}
            </div>

            <div className="lg:col-span-12">
              <Button type="submit" className="w-full py-4 text-base" data-testid="flight-search-button">
                Search flights
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </section>
  );
}

export default FlightSearchPage;
