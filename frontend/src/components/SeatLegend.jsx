const legendItems = [
  { label: 'Available', className: 'bg-primary-50 border-primary-300 text-primary-700', testId: 'available-seat' },
  { label: 'Reserved', className: 'bg-slate-200 border-slate-300 text-slate-500', testId: 'reserved-seat' },
  { label: 'Selected', className: 'bg-accent-500 border-accent-600 text-white', testId: 'selected-seat' },
  { label: 'Premium', className: 'bg-purple-50 border-purple-300 text-purple-700', testId: 'premium-seat' },
];

function SeatLegend() {
  return (
    <div className="grid gap-3 sm:grid-cols-4" data-testid="seat-legend">
      {legendItems.map((item) => (
        <div key={item.label} className="flex items-center gap-2 text-sm font-semibold text-slate-600">
          <span className={['h-8 w-8 rounded-xl border', item.className].join(' ')} data-testid={item.testId} />
          {item.label}
        </div>
      ))}
    </div>
  );
}

export default SeatLegend;
