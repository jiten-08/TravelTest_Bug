function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-950 text-white" data-testid="site-footer">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
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
      </div>
    </footer>
  );
}

export default Footer;
