import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import traveltestLogo from '../assets/traveltest-logo.svg';

const navItems = [
  { label: 'Home', path: '/', testId: 'nav-home-link' },
  { label: 'Flights', path: '/flights/search', testId: 'nav-flights-link' },
  { label: 'Hotels', path: '/hotels/search', testId: 'nav-hotels-link' },
  { label: 'Booking History', path: '/bookings/history', testId: 'nav-booking-history-link' },
  { label: 'About', path: '/about', testId: 'nav-about-link' },
  { label: 'Support', path: '/contact', testId: 'nav-contact-link' },
];

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [session, setSession] = useState(null);

  useEffect(() => {
    const storedSession = localStorage.getItem('traveltest_user_session');
    setSession(storedSession ? JSON.parse(storedSession) : null);
    setIsMenuOpen(false);
    setIsUserMenuOpen(false);
  }, [location.pathname]);

  const logout = () => {
    localStorage.removeItem('traveltest_user_session');
    localStorage.removeItem('traveltest_access_token');
    localStorage.removeItem('traveltest_refresh_token');
    setSession(null);
    navigate('/');
  };

  const navLinkClass = ({ isActive }) =>
    [
      'rounded-2xl px-3 py-2 text-sm font-bold transition-all focus-ring',
      isActive ? 'bg-primary-50 text-primary-700 shadow-sm' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950',
    ].join(' ');

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 shadow-sm backdrop-blur-xl" data-testid="site-header">
      <nav className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <NavLink to="/" className="flex items-center gap-3 focus-ring" data-testid="navbar-brand-link">
          <span className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full shadow-lg shadow-blue-900/20">
            <img src={traveltestLogo} alt="TravelTest logo" className="h-full w-full object-cover" />
          </span>
          <span>
            <span className="block text-lg font-bold tracking-tight text-slate-950">TravelTest</span>
            <span className="block text-xs font-semibold text-slate-500">Flights, stays, bookings</span>
          </span>
        </NavLink>

          <div className="hidden items-center gap-1 lg:flex" data-testid="navbar-menu">
            {navItems.map((item) => (
              <NavLink key={item.path} to={item.path} data-testid={item.testId} className={navLinkClass}>
                {item.label}
              </NavLink>
            ))}
          </div>

          <div className="hidden items-center gap-2 lg:flex" data-testid="navbar-auth-actions">
            {session ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsUserMenuOpen((current) => !current)}
                  className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 shadow-sm transition-all hover:border-primary-100 hover:shadow-md focus-ring"
                  data-testid="navbar-user-menu-button"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary-50 text-primary-700">
                    {session.name.charAt(0)}
                  </span>
                  {session.name}
                </button>
                {isUserMenuOpen ? (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl" data-testid="navbar-user-dropdown">
                    <p className="px-3 py-2 text-xs font-semibold text-slate-500" data-testid="navbar-user-email">
                      {session.email}
                    </p>
                    <Link
                      to="/profile"
                      className="block rounded-xl px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-100 focus-ring"
                      data-testid="navbar-profile-link"
                    >
                      Profile
                    </Link>
                    <button
                      type="button"
                      onClick={logout}
                      className="w-full rounded-xl px-3 py-2 text-left text-sm font-bold text-slate-700 hover:bg-slate-100 focus-ring"
                      data-testid="navbar-logout-button"
                    >
                      Logout
                    </button>
                  </div>
                ) : null}
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="rounded-2xl px-4 py-2 text-sm font-bold text-slate-600 transition-all hover:bg-slate-100 hover:text-slate-950 focus-ring"
                  data-testid="nav-login-link"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="rounded-2xl bg-gradient-to-r from-primary-600 to-indigo-600 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-blue-900/20 transition-all hover:from-primary-700 hover:to-indigo-700 focus-ring"
                  data-testid="nav-register-link"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={() => setIsMenuOpen((current) => !current)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm lg:hidden focus-ring"
            data-testid="navbar-mobile-menu-button"
            aria-label="Toggle navigation"
          >
            <span className="text-xl font-bold">{isMenuOpen ? 'x' : '='}</span>
          </button>
        </div>

        {isMenuOpen ? (
          <div className="mt-4 grid gap-2 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl lg:hidden" data-testid="navbar-mobile-menu">
            {navItems.map((item) => (
              <NavLink key={item.path} to={item.path} data-testid={`${item.testId}-mobile`} className={navLinkClass}>
                {item.label}
              </NavLink>
            ))}
            <div className="mt-2 grid grid-cols-2 gap-2 border-t border-slate-100 pt-3">
              {session ? (
                <>
                  <Link
                    to="/profile"
                    className="rounded-2xl bg-slate-100 px-4 py-3 text-center text-sm font-bold text-slate-700 focus-ring"
                    data-testid="navbar-mobile-profile-link"
                  >
                    Profile
                  </Link>
                  <button
                    type="button"
                    onClick={logout}
                    className="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-bold text-slate-700 focus-ring"
                    data-testid="navbar-mobile-logout-button"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="rounded-2xl bg-slate-100 px-4 py-3 text-center text-sm font-bold text-slate-700 focus-ring"
                    data-testid="nav-login-link-mobile"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="rounded-2xl bg-gradient-to-r from-primary-600 to-indigo-600 px-4 py-3 text-center text-sm font-bold text-white focus-ring"
                    data-testid="nav-register-link-mobile"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        ) : null}
      </nav>
    </header>
  );
}

export default Navbar;
