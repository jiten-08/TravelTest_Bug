function LoadingSpinner({ label = 'Loading' }) {
  return (
    <div className="flex items-center justify-center gap-3 py-10" data-testid="loading-spinner">
      <span className="h-8 w-8 animate-spin rounded-full border-4 border-blue-100 border-t-primary-700" aria-hidden="true" />
      <span className="text-sm font-bold text-slate-600">{label}</span>
    </div>
  );
}

export default LoadingSpinner;
