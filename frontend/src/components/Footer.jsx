import traveltestLogo from '../assets/traveltest-logo.svg';

function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 text-white shadow-[0_-8px_24px_rgba(15,23,42,0.12)]" data-testid="site-footer">
      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:justify-between sm:text-left">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full shadow-lg shadow-blue-900/20">
              <img src={traveltestLogo} alt="TravelTest logo" className="h-full w-full object-cover" />
            </span>
            <span className="text-lg font-bold">TravelTest</span>
          </div>
          <p className="max-w-xl text-center text-sm leading-6 text-slate-300 sm:text-right" data-testid="footer-copyright">
            &copy; {new Date().getFullYear()} TravelTest. Built as a realistic premium travel booking frontend.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
