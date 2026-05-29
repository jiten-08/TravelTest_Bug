import Card from '../components/Card.jsx';
import images from '../data/images.js';

const stats = [
  ['Flights booked', '25K+'],
  ['Hotels partnered', '1.2K+'],
  ['Happy travelers', '80K+'],
  ['Cities covered', '120+'],
];

const values = [
  ['Transparent pricing', 'Clear fares, taxes, fees, and booking summaries before checkout.'],
  ['Curated stays', 'Hotel cards focus on photos, amenities, ratings, and availability.'],
  ['Smooth journeys', 'Flights, stays, payments, and booking history live in one polished flow.'],
];

function AboutUsPage() {
  return (
    <section className="bg-slate-50 pb-16" data-testid="about-page">
      <div className="relative overflow-hidden bg-slate-950">
        <img
          src={images.heroBackground}
          alt="Premium travel coastline"
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover"
          onError={(event) => {
            event.currentTarget.style.display = 'none';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-primary-700/45 to-accent-500/20" />
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <p className="text-sm font-bold uppercase tracking-wide text-accent-400">About TravelTest</p>
          <h1 className="mt-3 max-w-3xl font-heading text-4xl font-bold text-white sm:text-6xl">
            A premium travel booking experience for modern journeys.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-blue-100">
            TravelTest brings flights, stays, payments, and booking history together in a polished frontend travel platform.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <section className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]" data-testid="about-mission-section">
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-accent-500">Our mission</p>
            <h2 className="mt-2 font-heading text-3xl font-bold text-slate-950">Make trip planning feel simple and premium.</h2>
          </div>
          <p className="text-base leading-8 text-slate-600">
            We design booking experiences that feel calm, visual, and trustworthy. From city discovery to secure checkout,
            every page is built to help travelers compare options clearly and move through booking with confidence.
          </p>
        </section>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map(([label, value]) => (
            <Card key={label} className="p-6" data-testid={`about-stats-card-${label.toLowerCase().replaceAll(' ', '-')}`}>
              <p className="font-heading text-3xl font-bold text-slate-950">{value}</p>
              <p className="mt-2 text-sm font-semibold text-slate-500">{label}</p>
            </Card>
          ))}
        </div>

        <section className="mt-16">
          <p className="text-sm font-bold uppercase tracking-wide text-accent-500">Why choose TravelTest</p>
          <h2 className="mt-2 font-heading text-3xl font-bold text-slate-950">Built around real traveler decisions.</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {values.map(([title, description], index) => (
              <Card key={title} className="overflow-hidden">
                <img
                  src={[images.flightBanner, images.hotelBanner, images.paymentBanner][index]}
                  alt={title}
                  loading="lazy"
                  className="h-40 w-full object-cover"
                />
                <div className="p-5">
                  <h3 className="font-heading text-lg font-bold text-slate-950">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
                </div>
              </Card>
            ))}
          </div>
        </section>

        <section className="mt-16 rounded-3xl bg-slate-950 p-8 text-white">
          <p className="text-sm font-bold uppercase tracking-wide text-accent-400">Team and values</p>
          <h2 className="mt-2 font-heading text-3xl font-bold">Travel design with care.</h2>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">
            Our values are clarity, reliability, and visual comfort. Every screen should help travelers understand their next step.
          </p>
        </section>
      </div>
    </section>
  );
}

export default AboutUsPage;
