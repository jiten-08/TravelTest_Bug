import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Badge from '../components/Badge.jsx';
import Button from '../components/Button.jsx';
import EmptyState from '../components/EmptyState.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import hotels from '../data/hotels.json';
import images from '../data/images.js';
import FancySelect from '../components/FancySelect.jsx';
import { getApiErrorMessage, hotelsApi } from '../services/api.js';

function getStoredSearch() {
  const savedSearch = localStorage.getItem('traveltest_hotel_search');
  return savedSearch ? JSON.parse(savedSearch) : null;
}

function getHotelInventory() {
  const savedInventory = localStorage.getItem('traveltest_hotel_inventory');
  return savedInventory ? JSON.parse(savedInventory) : {};
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

function getRequestedRooms(searchDetails) {
  return Math.max(Number(searchDetails?.rooms || 1), 1);
}

function getHotelAvailableRooms(hotel) {
  if (hotel.inventories?.length || hotel.roomTypes?.length) {
    return Number(hotel.roomsAvailable || 0);
  }

  const inventory = getHotelInventory();
  const hotelInventory = inventory[hotel.id];
  if (!hotelInventory) {
    return Number(hotel.roomsAvailable || 0);
  }
  return Object.values(hotelInventory).reduce((sum, count) => sum + Number(count), 0);
}

function HotelResultsPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [searchDetails] = useState(getStoredSearch);
  const [maxPrice, setMaxPrice] = useState('20000');
  const [minimumRating, setMinimumRating] = useState('0');
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [sortBy, setSortBy] = useState('price-asc');
  const [availableHotels, setAvailableHotels] = useState([]);
  const [apiError, setApiError] = useState('');
  const nights = calculateNights(searchDetails);
  const requestedRooms = getRequestedRooms(searchDetails);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setApiError('');

    hotelsApi.search(
      searchDetails
        ? {
            city: searchDetails.city,
            check_in_date: searchDetails.checkInDate,
            check_out_date: searchDetails.checkOutDate,
          }
        : {},
    )
      .then((apiHotels) => {
        if (isMounted) {
          setAvailableHotels(apiHotels);
        }
      })
      .catch((error) => {
        if (isMounted) {
          const fallbackHotels = searchDetails
            ? hotels.filter((hotel) => hotel.city.toLowerCase() === searchDetails.city.toLowerCase())
            : hotels;
          setAvailableHotels(fallbackHotels);
          setApiError(getApiErrorMessage(error, 'Showing local sample hotels because the backend is not available.'));
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

  const amenities = useMemo(() => [...new Set(availableHotels.flatMap((hotel) => hotel.amenities || []))].sort(), [availableHotels]);

  const results = useMemo(() => {
    const filteredHotels = availableHotels.filter((hotel) => {
      const matchesPrice = hotel.pricePerNight <= Number(maxPrice);
      const matchesRating = hotel.rating >= Number(minimumRating);
      const matchesAmenities = selectedAmenities.every((amenity) => hotel.amenities?.includes(amenity));
      const hasEnoughRooms = getHotelAvailableRooms(hotel) >= requestedRooms;
      return matchesPrice && matchesRating && matchesAmenities && hasEnoughRooms;
    });

    return [...filteredHotels].sort((first, second) => {
      if (sortBy === 'price-desc') {
        return second.pricePerNight - first.pricePerNight;
      }

      if (sortBy === 'rating-desc') {
        return second.rating - first.rating;
      }

      if (sortBy === 'rating-asc') {
        return first.rating - second.rating;
      }

      return first.pricePerNight - second.pricePerNight;
    });
  }, [availableHotels, maxPrice, minimumRating, requestedRooms, selectedAmenities, sortBy]);

  const toggleAmenity = (amenity) => {
    setSelectedAmenities((current) =>
      current.includes(amenity) ? current.filter((item) => item !== amenity) : [...current, amenity],
    );
  };

  const handleSelectHotel = (hotel) => {
    localStorage.setItem('traveltest_selected_hotel', JSON.stringify(hotel));
    localStorage.setItem('traveltest_hotel_search', JSON.stringify(searchDetails));
    localStorage.removeItem('traveltest_selected_flight');
    localStorage.removeItem('traveltest_selected_seats');
    localStorage.removeItem('traveltest_seat_summary');
    navigate('/payment');
  };

  return (
    <section
      className="min-h-screen bg-slate-50 bg-cover bg-fixed bg-center py-10"
      style={{
        backgroundImage: `linear-gradient(rgba(248, 250, 252, 0.94), rgba(248, 250, 252, 0.96)), url(${images.hotelBanner})`,
      }}
      data-testid="hotel-results-page"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 overflow-hidden rounded-3xl bg-white shadow-xl">
          <div className="relative h-56">
            <img
              src={images.hotelBanner}
              alt="Premium hotel lobby"
              loading="lazy"
              className="h-full w-full object-cover"
              onError={(event) => {
                event.currentTarget.style.display = 'none';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-primary-700/45 to-accent-500/30" />
            <div className="absolute inset-0 flex items-end p-6 sm:p-8">
              <div>
                <p className="text-sm font-bold uppercase tracking-wide text-accent-400" data-testid="hotel-results-eyebrow">
                  Hotel results
                </p>
                <h1 className="mt-2 font-heading text-3xl font-bold text-white sm:text-4xl" data-testid="hotel-results-title">
                  Recommended stays{searchDetails ? ` in ${searchDetails.city}` : ''}
                </h1>
                {searchDetails ? (
                  <p className="mt-2 text-sm font-semibold text-blue-100" data-testid="hotel-results-search-summary">
                    {searchDetails.checkInDate} to {searchDetails.checkOutDate} | {searchDetails.guests} guest(s) |{' '}
                    {searchDetails.rooms} room(s)
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[290px_1fr]">
          <aside className="lg:sticky lg:top-24 lg:self-start" data-testid="hotel-results-filter-sidebar">
            <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="font-heading text-lg font-bold text-slate-900">Filters</h2>
                <Link to="/hotels/search" className="text-sm font-semibold text-primary-700" data-testid="hotel-results-edit-search-link">
                  Edit search
                </Link>
              </div>

              <div className="mt-6 border-t border-slate-100 pt-5">
                <label className="block text-sm font-semibold text-slate-800" htmlFor="hotel-price-filter">
                  Max price per night
                </label>
                <input
                  id="hotel-price-filter"
                  type="range"
                  min="3000"
                  max="20000"
                  step="500"
                  value={maxPrice}
                  onChange={(event) => setMaxPrice(event.target.value)}
                  className="mt-4 w-full accent-primary-600"
                  data-testid="hotel-price-filter"
                />
                <div className="mt-2 flex justify-between text-xs font-semibold text-slate-500">
                  <span>Rs. 3,000</span>
                  <span data-testid="hotel-price-filter-value">Rs. {Number(maxPrice).toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="mt-6 border-t border-slate-100 pt-5">
                <label className="block text-sm font-semibold text-slate-800" htmlFor="hotel-rating-filter">
                  Minimum rating
                </label>
                <FancySelect
                  id="hotel-rating-filter"
                  name="minimumRating"
                  value={minimumRating}
                  onChange={(e) => setMinimumRating(e.target.value)}
                  options={[
                    { value: '0', label: 'Any rating' },
                    { value: '4', label: '4.0+' },
                    { value: '4.3', label: '4.3+' },
                    { value: '4.5', label: '4.5+' },
                    { value: '4.8', label: '4.8+' },
                  ]}
                  data-testid="hotel-rating-filter"
                />
              </div>

              <div className="mt-6 border-t border-slate-100 pt-5">
                <p className="text-sm font-semibold text-slate-800">Amenities</p>
                <div className="mt-3 grid gap-3">
                  {amenities.map((amenity) => (
                    <label key={amenity} className="flex items-center gap-2 text-sm font-medium text-slate-600">
                      <input
                        type="checkbox"
                        checked={selectedAmenities.includes(amenity)}
                        onChange={() => toggleAmenity(amenity)}
                        className="h-4 w-4 rounded border-slate-300 text-primary-600 focus-ring"
                        data-testid={`hotel-amenity-checkbox-${amenity.toLowerCase().replaceAll(' ', '-').replaceAll('/', '-')}`}
                      />
                      {amenity}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          <div>
            {apiError ? (
              <p className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700">
                {apiError}
              </p>
            ) : null}

            <div className="mb-5 flex flex-col gap-4 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-wide text-slate-500" data-testid="hotel-result-count">
                  {results.length} hotel{results.length === 1 ? '' : 's'} found
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  Showing DB availability for {requestedRooms} room{requestedRooms === 1 ? '' : 's'} and {nights} night
                  {nights === 1 ? '' : 's'}.
                </p>
              </div>
              <div className="w-full md:w-72">
                <label className="block text-sm font-semibold text-slate-700" htmlFor="hotel-sort-dropdown">
                  Sort hotels
                </label>
                <FancySelect
                  id="hotel-sort-dropdown"
                  name="hotelSort"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  options={[
                    { value: 'price-asc', label: 'Price: low to high' },
                    { value: 'price-desc', label: 'Price: high to low' },
                    { value: 'rating-desc', label: 'Rating: high to low' },
                    { value: 'rating-asc', label: 'Rating: low to high' },
                  ]}
                  data-testid="hotel-sort-dropdown"
                />
              </div>
            </div>

            {isLoading ? (
              <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
                <div className="grid gap-5 md:grid-cols-2">
                  {[1, 2, 3, 4].map((item) => (
                    <div key={item} className="h-72 animate-pulse rounded-2xl bg-slate-100" />
                  ))}
                </div>
                <LoadingSpinner label="Loading hotel results" />
              </div>
            ) : results.length === 0 ? (
              <EmptyState
                title="No hotels found"
                description="Try changing the price, rating, city, or amenities filters to find available stays."
                testId="hotel-results-empty-state"
              />
            ) : (
              <div className="grid gap-6 xl:grid-cols-2">
                {results.map((hotel, index) => {
                  const availableRooms = getHotelAvailableRooms(hotel);
                  const hasEnoughRooms = availableRooms >= requestedRooms;
                  const stayTotal = hotel.pricePerNight * nights * requestedRooms;

                  return (
                    <article
                      key={hotel.id}
                      className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl"
                      data-testid={`hotel-result-card-${hotel.id}`}
                    >
                      <div className="relative h-56">
                        <img
                          src={hotel.image || images.featuredHotels[index % images.featuredHotels.length] || images.hotelBanner}
                          alt={`${hotel.name} in ${hotel.city}`}
                          loading="lazy"
                          className="h-full w-full object-cover"
                          onError={(event) => {
                            event.currentTarget.style.display = 'none';
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
                        <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3">
                          <div>
                            <Badge className="bg-white/90 text-slate-800">{hotel.rating} rating</Badge>
                            <h2 className="mt-2 font-heading text-2xl font-bold text-white">{hotel.name}</h2>
                          </div>
                          <Badge
                            className={`border bg-white/95 shadow-sm ${
                              hasEnoughRooms ? 'border-green-200 text-green-700' : 'border-red-200 text-red-700'
                            }`}
                          >
                            {hasEnoughRooms ? `${availableRooms} rooms` : 'Sold out'}
                          </Badge>
                        </div>
                      </div>

                      <div className="p-5">
                        <p className="text-sm font-semibold text-slate-500">{hotel.city}</p>
                        <p className="mt-2 text-sm leading-6 text-slate-600">{hotel.description}</p>
                        <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-slate-400">{hotel.address}</p>

                        <div className="mt-4 flex flex-wrap gap-2">
                          {(hotel.amenities || []).map((amenity) => (
                            <span key={amenity} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                              {amenity}
                            </span>
                          ))}
                        </div>

                        <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Per night</p>
                            <p className="text-2xl font-bold text-slate-950">Rs. {hotel.pricePerNight.toLocaleString('en-IN')}</p>
                            <p className="mt-1 text-sm font-semibold text-primary-700">
                              Total Rs. {stayTotal.toLocaleString('en-IN')} for {nights} night{nights === 1 ? '' : 's'} x{' '}
                              {requestedRooms} room{requestedRooms === 1 ? '' : 's'}
                            </p>
                          </div>
                          <Button
                            type="button"
                            onClick={() => handleSelectHotel(hotel)}
                            disabled={!hasEnoughRooms}
                            className="sm:min-w-36"
                            data-testid={`select-hotel-button-${hotel.id}`}
                          >
                            {hasEnoughRooms ? 'Select hotel' : 'Unavailable'}
                          </Button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default HotelResultsPage;
