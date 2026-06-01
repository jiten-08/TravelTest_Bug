import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Badge from '../components/Badge.jsx';
import Button from '../components/Button.jsx';
import EmptyState from '../components/EmptyState.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import hotels from '../data/hotels.json';
import images from '../data/images.js';
import FancySelect from '../components/FancySelect.jsx';

function getStoredSearch() {
  const savedSearch = localStorage.getItem('traveltest_hotel_search');
  return savedSearch ? JSON.parse(savedSearch) : null;
}

function getHotelInventory() {
  const savedInventory = localStorage.getItem('traveltest_hotel_inventory');
  return savedInventory ? JSON.parse(savedInventory) : {};
}

function getHotelAvailableRooms(hotel) {
  const inventory = getHotelInventory();
  const hotelInventory = inventory[hotel.id];
  if (!hotelInventory) {
    return hotel.roomsAvailable;
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

  useEffect(() => {
    const timer = window.setTimeout(() => setIsLoading(false), 700);
    return () => window.clearTimeout(timer);
  }, []);

  const amenities = useMemo(() => [...new Set(hotels.flatMap((hotel) => hotel.amenities))].sort(), []);

  const results = useMemo(() => {
    const cityFilteredHotels = searchDetails
      ? hotels.filter((hotel) => hotel.city.toLowerCase() === searchDetails.city.toLowerCase())
      : hotels;

    const filteredHotels = cityFilteredHotels.filter((hotel) => {
      const matchesPrice = hotel.pricePerNight <= Number(maxPrice);
      const matchesRating = hotel.rating >= Number(minimumRating);
      const matchesAmenities = selectedAmenities.every((amenity) => hotel.amenities.includes(amenity));
      return matchesPrice && matchesRating && matchesAmenities;
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
  }, [maxPrice, minimumRating, searchDetails, selectedAmenities, sortBy]);

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
            <div className="mb-5 flex flex-col gap-4 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-wide text-slate-500" data-testid="hotel-result-count">
                  {results.length} hotel{results.length === 1 ? '' : 's'} found
                </p>
                <p className="mt-1 text-sm text-slate-600">Prices are per night and based on local dummy data.</p>
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
                {results.map((hotel) => (
                  <article
                    key={hotel.id}
                    className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl"
                    data-testid={`hotel-result-card-${hotel.id}`}
                  >
                    <div className="relative h-56">
                      <img
                        src={hotel.image}
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
                        <Badge className={`text-white ${getHotelAvailableRooms(hotel) > 0 ? 'bg-accent-500' : 'bg-red-500'}`}>
                          {getHotelAvailableRooms(hotel) > 0 ? `${getHotelAvailableRooms(hotel)} rooms` : 'Sold out'}
                        </Badge>
                      </div>
                    </div>

                    <div className="p-5">
                      <p className="text-sm font-semibold text-slate-500">{hotel.city}</p>
                      <p className="mt-2 text-sm leading-6 text-slate-600">{hotel.description}</p>
                      <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-slate-400">{hotel.address}</p>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {hotel.amenities.map((amenity) => (
                          <span key={amenity} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                            {amenity}
                          </span>
                        ))}
                      </div>

                      <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Per night</p>
                          <p className="text-2xl font-bold text-slate-950">Rs. {hotel.pricePerNight.toLocaleString('en-IN')}</p>
                        </div>
                        <Button
                          type="button"
                          onClick={() => handleSelectHotel(hotel)}
                          disabled={getHotelAvailableRooms(hotel) === 0}
                          className="sm:min-w-36"
                          data-testid={`select-hotel-button-${hotel.id}`}
                        >
                          {getHotelAvailableRooms(hotel) === 0 ? 'Unavailable' : 'Select hotel'}
                        </Button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default HotelResultsPage;
