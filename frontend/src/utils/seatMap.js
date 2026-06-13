import seatOverrides from '../data/seats.json';

const letters = ['A', 'B', 'C', 'D'];

export function generateSeatMap(flightId) {
  const generated = [];

  for (let row = 1; row <= 10; row += 1) {
    letters.forEach((letter) => {
      const isBusiness = row <= 2;
      const isPremium = isBusiness || ((row === 3 || row === 4) && (letter === 'A' || letter === 'D'));
      generated.push({
        flightId,
        seatNumber: `${row}${letter}`,
        class: isBusiness ? 'Business' : 'Economy',
        type: isPremium ? 'premium' : 'standard',
        status: 'available',
        extraCharge: isBusiness ? 1800 : isPremium ? 650 : 0,
      });
    });
  }

  const overrides = seatOverrides.filter((seat) => seat.flightId === flightId);
  const overrideMap = new Map(overrides.map((seat) => [seat.seatNumber, seat]));
  return generated.map((seat) => ({
    ...seat,
    ...(overrideMap.get(seat.seatNumber) || {}),
    status: 'available',
  }));
}
