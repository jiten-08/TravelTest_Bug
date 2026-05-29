function getSeatClass(seat, selected) {
  if (selected) {
    return 'border-accent-600 bg-accent-500 text-white shadow-lg shadow-orange-900/20';
  }

  if (seat.status === 'reserved') {
    return 'cursor-not-allowed border-slate-300 bg-slate-200 text-slate-500';
  }

  if (seat.type === 'premium') {
    return 'border-purple-300 bg-purple-50 text-purple-700 hover:bg-purple-100';
  }

  return 'border-primary-200 bg-primary-50 text-primary-700 hover:bg-primary-100';
}

function SeatMap({ seats, selectedSeats, onToggleSeat }) {
  const businessSeats = seats.filter((seat) => seat.class === 'Business');
  const economySeats = seats.filter((seat) => seat.class === 'Economy');

  const renderSection = (title, sectionSeats) => {
    const rows = [...new Set(sectionSeats.map((seat) => seat.seatNumber.match(/\d+/)?.[0]))];

    return (
      <div>
        <h2 className="mb-4 font-heading text-lg font-bold text-slate-950">{title}</h2>
        <div className="space-y-3">
          {rows.map((row) => {
            const rowSeats = sectionSeats.filter((seat) => seat.seatNumber.startsWith(row));
            const leftSeats = rowSeats.filter((seat) => seat.seatNumber.endsWith('A') || seat.seatNumber.endsWith('B'));
            const rightSeats = rowSeats.filter((seat) => seat.seatNumber.endsWith('C') || seat.seatNumber.endsWith('D'));

            return (
              <div key={row} className="grid grid-cols-[1fr_44px_1fr] items-center gap-3">
                <div className="flex justify-end gap-2">
                  {leftSeats.map((seat) => {
                    const selected = selectedSeats.some((item) => item.seatNumber === seat.seatNumber);
                    return (
                      <span key={seat.seatNumber} data-testid="seat-item">
                        <button
                          type="button"
                          disabled={seat.status === 'reserved'}
                          onClick={() => onToggleSeat(seat)}
                          className={[
                            'h-11 w-11 rounded-xl border text-sm font-bold transition-all focus-ring',
                            getSeatClass(seat, selected),
                          ].join(' ')}
                          data-testid={
                            selected ? 'selected-seat' : seat.status === 'reserved' ? 'reserved-seat' : seat.type === 'premium' ? 'premium-seat' : 'available-seat'
                          }
                        >
                          {seat.seatNumber}
                        </button>
                      </span>
                    );
                  })}
                </div>
                <div className="text-center text-xs font-bold uppercase tracking-wide text-slate-400">aisle</div>
                <div className="flex justify-start gap-2">
                  {rightSeats.map((seat) => {
                    const selected = selectedSeats.some((item) => item.seatNumber === seat.seatNumber);
                    return (
                      <span key={seat.seatNumber} data-testid="seat-item">
                        <button
                          type="button"
                          disabled={seat.status === 'reserved'}
                          onClick={() => onToggleSeat(seat)}
                          className={[
                            'h-11 w-11 rounded-xl border text-sm font-bold transition-all focus-ring',
                            getSeatClass(seat, selected),
                          ].join(' ')}
                          data-testid={
                            selected ? 'selected-seat' : seat.status === 'reserved' ? 'reserved-seat' : seat.type === 'premium' ? 'premium-seat' : 'available-seat'
                          }
                        >
                          {seat.seatNumber}
                        </button>
                      </span>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="rounded-[2rem] border border-slate-100 bg-white p-5 shadow-sm sm:p-8" data-testid="seat-layout-container">
      <div className="mx-auto mb-8 h-10 max-w-sm rounded-t-full bg-gradient-to-r from-primary-600 to-indigo-600 text-center text-xs font-bold uppercase tracking-wide text-white">
        <span className="inline-block pt-3">Cockpit</span>
      </div>
      <div className="grid gap-10">
        {renderSection('Business section', businessSeats)}
        {renderSection('Economy section', economySeats)}
      </div>
    </div>
  );
}

export default SeatMap;
