function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-950 text-white" data-testid="site-footer">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1.4fr_1fr] lg:px-8">
        <div>
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-indigo-600 text-sm font-bold">
              TT
            </span>
            <span className="text-lg font-bold">TravelTest</span>
          </div>
          <p className="mt-4 max-w-xl text-sm leading-6 text-slate-300" data-testid="footer-copyright">
            &copy; {new Date().getFullYear()} TravelTest. Built as a realistic premium travel booking frontend.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 text-sm" data-testid="footer-links">
          <a className="rounded-xl px-3 py-2 font-bold text-slate-300 hover:bg-white/10 hover:text-white focus-ring" href="/" data-testid="footer-home-link">
            Home
          </a>
          <a className="rounded-xl px-3 py-2 font-bold text-slate-300 hover:bg-white/10 hover:text-white focus-ring" href="/flights/search" data-testid="footer-flights-link">
            Flights
          </a>
          <a className="rounded-xl px-3 py-2 font-bold text-slate-300 hover:bg-white/10 hover:text-white focus-ring" href="/hotels/search" data-testid="footer-hotels-link">
            Hotels
          </a>
          <a className="rounded-xl px-3 py-2 font-bold text-slate-300 hover:bg-white/10 hover:text-white focus-ring" href="/about" data-testid="footer-about-link">
            About
          </a>
          <a className="rounded-xl px-3 py-2 font-bold text-slate-300 hover:bg-white/10 hover:text-white focus-ring" href="/contact" data-testid="footer-contact-link">
            Support
          </a>
          <a className="rounded-xl px-3 py-2 font-bold text-slate-300 hover:bg-white/10 hover:text-white focus-ring" href="/login" data-testid="footer-login-link">
            Login
          </a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
