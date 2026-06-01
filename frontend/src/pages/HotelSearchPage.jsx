import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button.jsx';
import Card from '../components/Card.jsx';
import FancySelect from '../components/FancySelect.jsx';
import hotels from '../data/hotels.json';
import images from '../data/images.js';

const today = new Date().toISOString().split('T')[0];

const initialForm = {
  city: '',
  checkInDate: '',
  checkOutDate: '',
  guests: '1',
  rooms: '1',
};

function validateHotelSearch(form, cities) {
  const errors = {};
  const selectedCity = cities.find((city) => city.toLowerCase() === form.city.trim().toLowerCase());

  if (!form.city.trim()) {
    errors.city = 'City is required.';
  } else if (!selectedCity) {
    errors.city = 'Select a city from the suggestions.';
  }

  if (!form.checkInDate) {
    errors.checkInDate = 'Check-in date is required.';
  } else if (form.checkInDate < today) {
    errors.checkInDate = 'Check-in date cannot be in the past.';
  }

  if (!form.checkOutDate) {
    errors.checkOutDate = 'Check-out date is required.';
  } else if (form.checkInDate && form.checkOutDate <= form.checkInDate) {
    errors.checkOutDate = 'Check-out date must be after check-in date.';
  }

  if (!form.guests) {
    errors.guests = 'Select guests.';
  }

  if (!form.rooms) {
    errors.rooms = 'Select rooms.';
  }

  return errors;
}

function HotelSearchPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [showSuggestions, setShowSuggestions] = useState(false);

  const cities = useMemo(() => [...new Set(hotels.map((hotel) => hotel.city))].sort(), []);
  const suggestions = useMemo(() => {
    const query = form.city.trim().toLowerCase();
    return cities.filter((city) => city.toLowerCase().includes(query)).slice(0, 6);
  }, [cities, form.city]);

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: '' }));
  };

  const selectCity = (city) => {
    setForm((current) => ({ ...current, city }));
    setErrors((current) => ({ ...current, city: '' }));
    setShowSuggestions(false);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const validationErrors = validateHotelSearch(form, cities);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    const selectedCity = cities.find((city) => city.toLowerCase() === form.city.trim().toLowerCase());
    const searchDetails = { ...form, city: selectedCity };
    localStorage.setItem('traveltest_hotel_search', JSON.stringify(searchDetails));
    navigate('/hotels/results');
  };

  return (
    <section className="bg-slate-50" data-testid="hotel-search-page">
      <div className="relative overflow-hidden bg-gradient-to-br from-primary-700 to-indigo-700">
        <img
          src={images.hotelBanner}
          alt="Luxury hotel pool"
          loading="eager"
          className="absolute inset-0 h-full w-full object-cover"
          onError={(event) => {
            event.currentTarget.style.display = 'none';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-primary-700/55 to-accent-500/30" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <p className="text-sm font-bold uppercase tracking-wide text-accent-400" data-testid="hotel-search-eyebrow">
            Premium stays
          </p>
          <h1 className="mt-3 max-w-3xl font-heading text-4xl font-bold text-white sm:text-5xl" data-testid="hotel-search-title">
            Find beautiful stays for every journey.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-blue-100">
            Search realistic hotel inventory with autosuggestions, date validation, filters, and booking handoff.
          </p>
        </div>
      </div>

      <div className="mx-auto -mt-10 max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <Card className="relative bg-white/95 p-5 shadow-2xl backdrop-blur sm:p-6">
          <form className="grid gap-5 lg:grid-cols-12" onSubmit={handleSubmit} noValidate data-testid="hotel-search-form">
            <div className="relative lg:col-span-4">
              <label className="block text-sm font-bold text-slate-700" htmlFor="hotel-city-input" data-testid="hotel-city-field">
                City
              </label>
              <input
                id="hotel-city-input"
                name="city"
                value={form.city}
                onChange={(event) => {
                  updateField(event);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                autoComplete="off"
                className="travel-field mt-2"
                placeholder="Search city"
                data-testid="hotel-city-input"
              />
              {showSuggestions && suggestions.length > 0 ? (
                <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xl" data-testid="hotel-city-suggestions-list">
                  {suggestions.map((city) => (
                    <button
                      key={city}
                      type="button"
                      onMouseDown={() => selectCity(city)}
                      className="block w-full px-4 py-3 text-left text-sm font-semibold text-slate-700 hover:bg-primary-50"
                      data-testid={`hotel-city-suggestion-option-${city.toLowerCase().replaceAll(' ', '-')}`}
                    >
                      {city}
                    </button>
                  ))}
                </div>
              ) : null}
              {errors.city ? (
                <p className="mt-2 text-sm font-semibold text-red-600" data-testid="hotel-city-validation-message">
                  {errors.city}
                </p>
              ) : null}
            </div>

            <div className="lg:col-span-2">
              <label className="block text-sm font-bold text-slate-700" htmlFor="hotel-checkin-input">
                Check-in
              </label>
              <input
                id="hotel-checkin-input"
                name="checkInDate"
                value={form.checkInDate}
                onChange={updateField}
                type="date"
                min={today}
                className="travel-field mt-2"
                data-testid="hotel-checkin-input"
              />
              {errors.checkInDate ? (
                <p className="mt-2 text-sm font-semibold text-red-600" data-testid="hotel-checkin-validation-message">
                  {errors.checkInDate}
                </p>
              ) : null}
            </div>

            <div className="lg:col-span-2">
              <label className="block text-sm font-bold text-slate-700" htmlFor="hotel-checkout-input">
                Check-out
              </label>
              <input
                id="hotel-checkout-input"
                name="checkOutDate"
                value={form.checkOutDate}
                onChange={updateField}
                type="date"
                min={form.checkInDate || today}
                className="travel-field mt-2"
                data-testid="hotel-checkout-input"
              />
              {errors.checkOutDate ? (
                <p className="mt-2 text-sm font-semibold text-red-600" data-testid="hotel-checkout-validation-message">
                  {errors.checkOutDate}
                </p>
              ) : null}
            </div>

            <div className="lg:col-span-2">
              <label className="block text-sm font-bold text-slate-700" htmlFor="hotel-guests-selector">
                Guests
              </label>
              <FancySelect
                id="hotel-guests-selector"
                name="guests"
                value={form.guests}
                onChange={updateField}
                className="mt-2"
                options={[{ value: '', label: 'Select guests' }, ...[1, 2, 3, 4, 5, 6].map((n) => ({ value: String(n), label: `${n} ${n === 1 ? 'guest' : 'guests'}` }))]}
                data-testid="hotel-guests-selector"
              />
              {errors.guests ? (
                <p className="mt-2 text-sm font-semibold text-red-600" data-testid="hotel-guests-validation-message">
                  {errors.guests}
                </p>
              ) : null}
            </div>

            <div className="lg:col-span-2">
              <label className="block text-sm font-bold text-slate-700" htmlFor="hotel-rooms-selector">
                Rooms
              </label>
              <FancySelect
                id="hotel-rooms-selector"
                name="rooms"
                value={form.rooms}
                onChange={updateField}
                className="mt-2"
                options={[{ value: '', label: 'Select rooms' }, ...[1, 2, 3, 4].map((n) => ({ value: String(n), label: `${n} ${n === 1 ? 'room' : 'rooms'}` }))]}
                data-testid="hotel-rooms-selector"
              />
              {errors.rooms ? (
                <p className="mt-2 text-sm font-semibold text-red-600" data-testid="hotel-rooms-validation-message">
                  {errors.rooms}
                </p>
              ) : null}
            </div>

            <div className="lg:col-span-12">
              <Button type="submit" className="w-full py-4 text-base" data-testid="hotel-search-button">
                Search hotels
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </section>
  );
}

export default HotelSearchPage;
