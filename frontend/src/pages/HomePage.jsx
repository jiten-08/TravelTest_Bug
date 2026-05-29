import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button.jsx';
import Card from '../components/Card.jsx';
import DestinationCard from '../components/DestinationCard.jsx';
import FeaturedHotelCard from '../components/FeaturedHotelCard.jsx';
import SearchTabs from '../components/SearchTabs.jsx';
import SectionTitle from '../components/SectionTitle.jsx';
import flights from '../data/flights.json';
import hotels from '../data/hotels.json';
import images from '../data/images.js';

const stats = [
  { label: 'Sample flights', value: flights.length, testId: 'home-flights-stat' },
  { label: 'Sample hotels', value: hotels.length, testId: 'home-hotels-stat' },
  { label: 'Booking flows planned', value: 9, testId: 'home-practice-stat' },
];

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
    role: 'QA learner',
    quote: 'The pages feel real enough to practice locators, waits, validation, and navigation without setup noise.',
  },
  {
    name: 'Arjun M.',
    role: 'Automation engineer',
    quote: 'A clean playground for stable Selenium scripts before moving into larger application suites.',
  },
];

function HomePage() {
  const [activeTab, setActiveTab] = useState('flights');
  const featuredHotels = hotels.slice(0, 3);
  const cities = useMemo(() => [...new Set(flights.flatMap((flight) => [flight.source, flight.destination]))].sort(), []);

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
              Selenium-ready travel booking UI
            </p>
            <h1 className="max-w-3xl font-heading text-4xl font-bold leading-tight sm:text-6xl" data-testid="home-title">
              Book flights and stays in a polished travel app.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-blue-100" data-testid="home-description">
              TravelTest gives automation learners a modern travel platform with predictable routes, realistic forms, and stable selectors.
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
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block" data-testid="home-quick-search-from-field">
                  <span className="text-xs font-bold uppercase tracking-wide text-slate-500">From</span>
                  <select className="travel-select mt-2" defaultValue={cities[0] || ''} data-testid="home-quick-search-source-dropdown">
                    {cities.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block" data-testid="home-quick-search-to-field">
                  <span className="text-xs font-bold uppercase tracking-wide text-slate-500">To</span>
                  <select className="travel-select mt-2" defaultValue={cities[1] || ''} data-testid="home-quick-search-destination-dropdown">
                    {cities.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-slate-50 p-4" data-testid="home-quick-search-date-card">
                  <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Travel date</span>
                  <p className="mt-2 text-lg font-semibold text-slate-950">Flexible dates</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4" data-testid="home-quick-search-type-card">
                  <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Mode</span>
                  <p className="mt-2 text-lg font-semibold text-slate-950">{activeTab === 'flights' ? 'Flight deals' : 'Hotel stays'}</p>
                </div>
              </div>
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
            description="Sample hotel data is displayed with production-style cards and mobile-friendly spacing."
          />
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {featuredHotels.map((hotel, index) => (
              <FeaturedHotelCard
                key={hotel.id}
                hotel={hotel}
                image={images.featuredHotels[index]}
                testId={`featured-hotel-card-${hotel.id}`}
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
          <SectionTitle align="center" tone="dark" eyebrow="Testimonials" title="Designed for automation learners" />
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
    </div>
  );
}

export default HomePage;
