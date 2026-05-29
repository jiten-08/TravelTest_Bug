import { Link } from 'react-router-dom';

function NotFoundPage() {
  return (
    <section className="mx-auto flex max-w-3xl flex-col items-center px-4 py-20 text-center" data-testid="not-found-page">
      <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-primary-600 to-indigo-600 text-3xl font-bold text-white shadow-card">
        404
      </div>
      <p className="text-sm font-bold uppercase tracking-wide text-accent-500" data-testid="not-found-code">
        404
      </p>
      <h1 className="mt-3 text-4xl font-bold text-slate-950" data-testid="not-found-title">
        Page not found
      </h1>
      <p className="mt-4 max-w-xl text-base leading-7 text-slate-600" data-testid="not-found-message">
        The route you opened does not exist yet. Return home to continue from the current TravelTest foundation.
      </p>
      <Link
        to="/"
        className="mt-8 rounded-2xl bg-gradient-to-r from-primary-600 to-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-900/20 transition-all hover:from-primary-700 hover:to-indigo-700 focus-ring"
        data-testid="not-found-home-link"
      >
        Back to home
      </Link>
    </section>
  );
}

export default NotFoundPage;
