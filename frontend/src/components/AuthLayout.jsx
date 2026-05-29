import images from '../data/images.js';

function AuthLayout({
  children,
  eyebrow = 'TravelTest account',
  title = 'Plan your next trip with confidence',
  image = images.loginBackground,
}) {
  return (
    <div className="mx-auto grid min-h-[calc(100vh-160px)] max-w-7xl items-center gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
      <aside className="relative hidden min-h-[620px] overflow-hidden rounded-3xl bg-gradient-to-br from-primary-600 via-indigo-600 to-slate-950 p-8 text-white shadow-card lg:block">
        <img
          src={image}
          alt="Premium travel destination"
          className="absolute inset-0 h-full w-full object-cover"
          loading="lazy"
          onError={(event) => {
            event.currentTarget.style.display = 'none';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950/80 via-primary-700/55 to-accent-500/35" />
        <div className="relative">
        <p className="text-sm font-bold uppercase tracking-wide text-accent-400">{eyebrow}</p>
        <h2 className="mt-4 text-4xl font-bold leading-tight">{title}</h2>
        <p className="mt-5 max-w-md text-base leading-7 text-blue-100">
          A polished booking interface with premium travel flows and clear, stable interactions.
        </p>
        <div className="mt-10 grid grid-cols-2 gap-4">
          <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
            <span className="block text-3xl font-bold">30+</span>
            <span className="mt-1 block text-sm text-blue-100">Flight samples</span>
          </div>
          <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
            <span className="block text-3xl font-bold">24/7</span>
            <span className="mt-1 block text-sm text-blue-100">Booking ready</span>
          </div>
        </div>
        </div>
      </aside>
      <div>{children}</div>
    </div>
  );
}

export default AuthLayout;
