import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/Button.jsx';
import Card from '../components/Card.jsx';
import FancySelect from '../components/FancySelect.jsx';
import DestinationCard from '../components/DestinationCard.jsx';
import FeaturedHotelCard from '../components/FeaturedHotelCard.jsx';
import SearchTabs from '../components/SearchTabs.jsx';
import SectionTitle from '../components/SectionTitle.jsx';
import flights from '../data/flights.json';
import hotels from '../data/hotels.json';
import images from '../data/images.js';
import { flightsApi, hotelsApi } from '../services/api.js';

const destinations = [
  {
    city: 'Goa',
    tag: 'Beach break',
    price: 'Flights from Rs. 4,500',
    description: 'Sunlit stays, short flights, and easy weekend itineraries.',
    image: images.popularDestinations.Goa,
    testId: 'popular-destination-goa-card',
  },
  {
    city: 'Mumbai',
    tag: 'City escape',
    price: 'Flights from Rs. 3,600',
    description: 'Harbor hotels, business hubs, and late-night food trails.',
    image: images.popularDestinations.Mumbai,
    testId: 'popular-destination-mumbai-card',
  },
  {
    city: 'Jaipur',
    tag: 'Culture trip',
    price: 'Flights from Rs. 3,300',
    description: 'Heritage stays, markets, forts, and bright desert evenings.',
    image: images.popularDestinations.Jaipur,
    testId: 'popular-destination-jaipur-card',
  },
];

const reasons = [
  { title: 'Best fare discovery', description: 'Compare flights and stays with clear prices, availability, and route details in one place.' },
  { title: 'Premium stays', description: 'Explore curated hotels with ratings, amenities, images, and room availability for easier planning.' },
  { title: 'Smooth booking', description: 'Move from search to selection to payment summary with a clean, mobile-friendly booking flow.' },
];

const testimonials = [
  {
    name: 'Priya S.',
    role: 'Weekend traveler',
    quote: 'I found a Goa flight and beach stay in one flow, and the pricing was clear before checkout.',
  },
  {
    name: 'Arjun M.',
    role: 'Business traveler',
    quote: 'The hotel filters made it easy to compare city stays quickly before a last-minute work trip.',
  },
];

const today = new Date().toISOString().split('T')[0];
const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];

function HomePage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('flights');
  const [flightOptions, setFlightOptions] = useState(flights);
  const [hotelOptions, setHotelOptions] = useState(hotels);
  const featuredHotels = hotelOptions.slice(0, 3);
  const cities = useMemo(() => [...new Set(flightOptions.flatMap((flight) => [flight.source, flight.destination]))].sort(), [flightOptions]);
  const hotelCities = useMemo(() => [...new Set(hotelOptions.map((hotel) => hotel.city))].sort(), [hotelOptions]);
  const [quickSource, setQuickSource] = useState(cities[0] || '');
  const [quickDestination, setQuickDestination] = useState(cities[1] || cities[0] || '');
  const [quickHotelCity, setQuickHotelCity] = useState(hotelCities[0] || '');
  const [quickCheckIn, setQuickCheckIn] = useState('');
  const [quickCheckOut, setQuickCheckOut] = useState('');
  const [quickGuests, setQuickGuests] = useState('1');
  const [quickRooms, setQuickRooms] = useState('1');
  const [selectedHotel, setSelectedHotel] = useState(null);

  useEffect(() => {
    let isMounted = true;

    Promise.allSettled([flightsApi.search(), hotelsApi.search()]).then(([flightResult, hotelResult]) => {
      if (!isMounted) {
        return;
      }

      if (flightResult.status === 'fulfilled' && flightResult.value.length > 0) {
        setFlightOptions(flightResult.value);
      }

      if (hotelResult.status === 'fulfilled' && hotelResult.value.length > 0) {
        setHotelOptions(hotelResult.value);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!quickSource && cities[0]) {
      setQuickSource(cities[0]);
    }

    if (!quickDestination && (cities[1] || cities[0])) {
      setQuickDestination(cities[1] || cities[0]);
    }
  }, [cities, quickDestination, quickSource]);

  useEffect(() => {
    if (!quickHotelCity && hotelCities[0]) {
      setQuickHotelCity(hotelCities[0]);
    }
  }, [hotelCities, quickHotelCity]);

  const stats = [
    { label: 'Available flights', value: flightOptions.length, testId: 'home-flights-stat' },
    { label: 'Available hotels', value: hotelOptions.length, testId: 'home-hotels-stat' },
    { label: 'Booking flows ready', value: 9, testId: 'home-practice-stat' },
  ];

  const bookFeaturedHotel = () => {
    if (!selectedHotel) {
      return;
    }

    const searchDetails = {
      city: selectedHotel.city,
      checkInDate: quickCheckIn || today,
      checkOutDate: quickCheckOut || tomorrow,
      guests: quickGuests,
      rooms: quickRooms,
    };

    localStorage.setItem('traveltest_selected_hotel', JSON.stringify(selectedHotel));
    localStorage.setItem('traveltest_hotel_search', JSON.stringify(searchDetails));
    localStorage.removeItem('traveltest_selected_flight');
    localStorage.removeItem('traveltest_selected_seats');
    localStorage.removeItem('traveltest_seat_summary');
    navigate('/payment');
  };

  return (
    <div className="bg-slate-50" data-testid="home-page">
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-primary-700 to-indigo-600">
        <img
          src={images.heroBackground}
          alt="Beach and ocean travel background"
          className="absolute inset-0 h-full w-full object-cover"
          loading="eager"
          onError={(event) => {
            event.currentTarget.style.display = 'none';
          }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(15,23,42,0.78),rgba(37,99,235,0.45)),radial-gradient(circle_at_75%_20%,rgba(249,115,22,0.35),transparent_32%),radial-gradient(circle_at_20%_90%,rgba(79,70,229,0.35),transparent_30%)]" />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 pb-20 pt-16 sm:px-6 lg:grid-cols-[1fr_0.9fr] lg:px-8 lg:pb-28 lg:pt-24">
          <div className="flex flex-col justify-center text-white">
            <p className="mb-3 text-sm font-bold uppercase tracking-wide text-accent-400" data-testid="home-eyebrow">
              Flights, hotels, and seamless trip planning
            </p>
            <h1 className="max-w-3xl font-heading text-4xl font-bold leading-tight sm:text-6xl" data-testid="home-title">
              Book flights and stays in a polished travel app.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-blue-100" data-testid="home-description">
              TravelTest helps you compare flights, discover curated stays, and move from search to checkout with a smooth booking experience.
            </p>

            <div className="mt-8 flex flex-wrap gap-3" data-testid="home-actions">
              <Button as={Link} to="/flights/search" variant="amber" data-testid="home-flight-search-link">
                Search flights
              </Button>
              <Button as={Link} to="/hotels/search" variant="secondary" data-testid="home-hotel-search-link">
                Find hotels
              </Button>
            </div>
          </div>

          <Card className="bg-white/95 p-5 shadow-2xl backdrop-blur" data-testid="home-overview-panel">
            <SearchTabs activeTab={activeTab} onChange={setActiveTab} />
            <div className="mt-5 grid gap-4">
              {activeTab === 'flights' ? (
                <>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="block" data-testid="home-quick-search-from-field">
                      <span className="text-xs font-bold uppercase tracking-wide text-slate-500">From</span>
                      <FancySelect
                        id="home-quick-search-source-dropdown"
                        name="homeQuickSource"
                        value={quickSource}
                        onChange={(e) => setQuickSource(e.target.value)}
                        className="mt-2"
                        options={cities.map((city) => ({ value: city, label: city }))}
                        data-testid="home-quick-search-source-dropdown"
                      />
                    </label>
                    <label className="block" data-testid="home-quick-search-to-field">
                      <span className="text-xs font-bold uppercase tracking-wide text-slate-500">To</span>
                      <FancySelect
                        id="home-quick-search-destination-dropdown"
                        name="homeQuickDestination"
                        value={quickDestination}
                        onChange={(e) => setQuickDestination(e.target.value)}
                        className="mt-2"
                        options={cities.map((city) => ({ value: city, label: city }))}
                        data-testid="home-quick-search-destination-dropdown"
                      />
                    </label>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl bg-slate-50 p-4" data-testid="home-quick-search-date-card">
                      <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Travel date</span>
                      <p className="mt-2 text-lg font-semibold text-slate-950">Flexible dates</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4" data-testid="home-quick-search-type-card">
                      <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Mode</span>
                      <p className="mt-2 text-lg font-semibold text-slate-950">Flight deals</p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <label className="block" data-testid="home-quick-hotel-city-field">
                    <span className="text-xs font-bold uppercase tracking-wide text-slate-500">City</span>
                    <FancySelect
                      id="home-quick-hotel-city-dropdown"
                      name="homeQuickHotelCity"
                      value={quickHotelCity}
                      onChange={(e) => setQuickHotelCity(e.target.value)}
                      className="mt-2"
                      options={hotelCities.map((city) => ({ value: city, label: city }))}
                      data-testid="home-quick-hotel-city-dropdown"
                    />
                  </label>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="block" data-testid="home-quick-hotel-checkin-field">
                      <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Check-in</span>
                      <input
                        id="home-quick-hotel-checkin-input"
                        name="homeQuickCheckIn"
                        type="date"
                        min={today}
                        value={quickCheckIn}
                        onChange={(event) => setQuickCheckIn(event.target.value)}
                        className="travel-field mt-2"
                        data-testid="home-quick-hotel-checkin-input"
                      />
                    </label>
                    <label className="block" data-testid="home-quick-hotel-checkout-field">
                      <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Check-out</span>
                      <input
                        id="home-quick-hotel-checkout-input"
                        name="homeQuickCheckOut"
                        type="date"
                        min={quickCheckIn || today}
                        value={quickCheckOut}
                        onChange={(event) => setQuickCheckOut(event.target.value)}
                        className="travel-field mt-2"
                        data-testid="home-quick-hotel-checkout-input"
                      />
                    </label>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="block" data-testid="home-quick-hotel-guests-field">
                      <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Guests</span>
                      <FancySelect
                        id="home-quick-hotel-guests-dropdown"
                        name="homeQuickGuests"
                        value={quickGuests}
                        onChange={(e) => setQuickGuests(e.target.value)}
                        className="mt-2"
                        options={[1, 2, 3, 4, 5, 6].map((count) => ({ value: String(count), label: `${count} ${count === 1 ? 'guest' : 'guests'}` }))}
                        data-testid="home-quick-hotel-guests-dropdown"
                      />
                    </label>
                    <label className="block" data-testid="home-quick-hotel-rooms-field">
                      <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Rooms</span>
                      <FancySelect
                        id="home-quick-hotel-rooms-dropdown"
                        name="homeQuickRooms"
                        value={quickRooms}
                        onChange={(e) => setQuickRooms(e.target.value)}
                        className="mt-2"
                        options={[1, 2, 3, 4].map((count) => ({ value: String(count), label: `${count} ${count === 1 ? 'room' : 'rooms'}` }))}
                        data-testid="home-quick-hotel-rooms-dropdown"
                      />
                    </label>
                  </div>
                </>
              )}
              <Button
                as={Link}
                to={activeTab === 'flights' ? '/flights/search' : '/hotels/search'}
                className="w-full"
                data-testid="home-quick-search-submit-link"
              >
                Start search
              </Button>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {stats.map((stat) => (
                <div key={stat.testId} className="rounded-2xl bg-slate-50 p-4" data-testid={stat.testId}>
                  <span className="block text-3xl font-bold text-slate-950">{stat.value}</span>
                  <span className="mt-1 block text-xs font-bold uppercase tracking-wide text-slate-500">{stat.label}</span>
                </div>
              ))}
            </div>
            <div className="mt-5 rounded-2xl bg-primary-50 p-5" data-testid="home-roadmap-card">
              <h2 className="text-base font-bold text-slate-950" data-testid="home-roadmap-title">
                Current foundation
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600" data-testid="home-roadmap-description">
                Modern routes, local data, auth simulation, and flight booking screens are ready for the next module.
              </p>
            </div>
          </Card>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8" data-testid="popular-destinations-section">
        <SectionTitle
          eyebrow="Popular destinations"
          title="Trips that feel ready to book"
          description="Use these rich destination cards as visual anchors while the app continues to grow module by module."
        />
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {destinations.map((destination) => (
            <DestinationCard key={destination.city} destination={destination} />
          ))}
        </div>
      </section>

      <section className="bg-white py-16" data-testid="featured-hotels-section">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionTitle
            eyebrow="Featured stays"
            title="Hotels for every itinerary"
            description="Available hotel data is displayed with production-style cards and mobile-friendly spacing."
          />
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {featuredHotels.map((hotel, index) => (
              <FeaturedHotelCard
                key={hotel.id}
                hotel={hotel}
                image={hotel.image || images.featuredHotels[index]}
                testId={`featured-hotel-card-${hotel.id}`}
                onViewDetails={(hotelDetails, hotelImage) => setSelectedHotel({ ...hotelDetails, image: hotelImage })}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8" data-testid="why-choose-us-section">
        <SectionTitle align="center" eyebrow="Why choose us" title="Built for confident booking" />
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {reasons.map((reason) => (
            <Card key={reason.title} className="p-6 transition-all hover:-translate-y-1 hover:shadow-xl" data-testid={`why-choose-${reason.title.toLowerCase().replaceAll(' ', '-')}-card`}>
              <div className="mb-5 h-24 overflow-hidden rounded-2xl">
                <img
                  src={[images.flightBanner, images.hotelBanner, images.paymentBanner][reasons.indexOf(reason)]}
                  alt={`${reason.title} travel visual`}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              </div>
              <h3 className="text-lg font-bold text-slate-950">{reason.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">{reason.description}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="bg-slate-950 py-16 text-white" data-testid="testimonials-section">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionTitle align="center" tone="dark" eyebrow="Testimonials" title="Trusted by everyday travelers" />
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {testimonials.map((testimonial) => (
              <article key={testimonial.name} className="rounded-2xl border border-white/10 bg-white/10 p-6 backdrop-blur" data-testid={`testimonial-${testimonial.name.toLowerCase().replaceAll(' ', '-')}-card`}>
                <p className="text-lg leading-8 text-slate-100">{testimonial.quote}</p>
                <div className="mt-5 flex items-center gap-3">
                  <img
                    src={images.testimonialUsers[testimonials.indexOf(testimonial)]}
                    alt={`${testimonial.name} profile`}
                    loading="lazy"
                    className="h-12 w-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-semibold text-white">{testimonial.name}</p>
                    <p className="text-sm text-blue-200">{testimonial.role}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {selectedHotel ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-8" data-testid="featured-hotel-details-modal">
          <div className="max-h-full w-full max-w-3xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
            <div className="relative h-64">
              <img
                src={selectedHotel.image}
                alt={`${selectedHotel.name} hotel`}
                className="h-full w-full rounded-t-3xl object-cover"
                loading="lazy"
                onError={(event) => {
                  event.currentTarget.style.display = 'none';
                }}
              />
              <div className="absolute inset-0 rounded-t-3xl bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
              <button
                type="button"
                onClick={() => setSelectedHotel(null)}
                className="absolute right-4 top-4 rounded-xl bg-white/90 px-3 py-2 text-sm font-bold text-slate-700 shadow-sm focus-ring"
                data-testid="featured-hotel-modal-close-button"
              >
                Close
              </button>
              <div className="absolute bottom-5 left-5 right-5 text-white">
                <p className="text-sm font-bold uppercase tracking-wide text-accent-300">{selectedHotel.city}</p>
                <h2 className="mt-1 font-heading text-3xl font-bold" data-testid="featured-hotel-modal-title">
                  {selectedHotel.name}
                </h2>
              </div>
            </div>

            <div className="grid gap-6 p-6 md:grid-cols-[1.5fr_1fr]">
              <div>
                <p className="text-sm leading-6 text-slate-600" data-testid="featured-hotel-modal-description">
                  {selectedHotel.description}
                </p>
                <p className="mt-4 text-xs font-bold uppercase tracking-wide text-slate-400" data-testid="featured-hotel-modal-address">
                  {selectedHotel.address}
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {(selectedHotel.amenities || []).map((amenity) => (
                    <span key={amenity} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl bg-slate-50 p-5">
                <p className="text-sm font-semibold text-slate-500">Price per night</p>
                <p className="mt-1 text-2xl font-bold text-slate-950" data-testid="featured-hotel-modal-price">
                  Rs. {selectedHotel.pricePerNight.toLocaleString('en-IN')}
                </p>
                <div className="mt-5 space-y-3 text-sm text-slate-600">
                  <p>
                    Rating: <span className="font-bold text-slate-950">{selectedHotel.rating}</span>
                  </p>
                  <p>
                    Rooms available: <span className="font-bold text-slate-950">{selectedHotel.roomsAvailable}</span>
                  </p>
                </div>
                <Button type="button" onClick={bookFeaturedHotel} className="mt-6 w-full" data-testid="featured-hotel-modal-book-button">
                  Book
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default HomePage;
