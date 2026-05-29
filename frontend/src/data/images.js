const unsplash = (id, params = 'auto=format&fit=crop&w=1600&q=80') => `https://images.unsplash.com/${id}?${params}`;

export const images = {
  fallbackGradient: 'linear-gradient(135deg, #1D4ED8 0%, #4F46E5 58%, #F97316 100%)',
  heroBackground: unsplash('photo-1507525428034-b723cf961d3e'),
  flightBanner: unsplash('photo-1436491865332-7a61a109cc05'),
  hotelBanner: unsplash('photo-1566073771259-6a8506099945'),
  loginBackground: unsplash('photo-1488646953014-85cb44e25828'),
  registerBackground: unsplash('photo-1500530855697-b586d89ba3ee'),
  paymentBanner: unsplash('photo-1556742049-0cfed4f6a45d'),
  bookingSuccessImage: unsplash('photo-1503220317375-aaad61436b1b'),
  popularDestinations: {
    Mumbai: unsplash('photo-1567157577867-05ccb1388e66'),
    'New Delhi': unsplash('photo-1587474260584-136574528ed5'),
    Goa: unsplash('photo-1512343879784-a960bf40e7f2'),
    Bengaluru: unsplash('photo-1596176530529-78163a4f7af2'),
    Jaipur: unsplash('photo-1477587458883-47145ed94245'),
    Dubai: unsplash('photo-1512453979798-5ea266f8880c'),
  },
  featuredHotels: [
    unsplash('photo-1564501049412-61c2a3083791'),
    unsplash('photo-1551882547-ff40c63fe5fa'),
    unsplash('photo-1578683010236-d716f9a3f461'),
    unsplash('photo-1582719478250-c89cae4dc85b'),
  ],
  testimonialUsers: [
    unsplash('photo-1494790108377-be9c29b29330', 'auto=format&fit=crop&w=400&q=80'),
    unsplash('photo-1500648767791-00dcc994a43e', 'auto=format&fit=crop&w=400&q=80'),
  ],
  emptyStates: {
    flights: unsplash('photo-1521727857535-28d2047619b7'),
    hotels: unsplash('photo-1551632811-561732d1e306'),
    bookings: unsplash('photo-1500530855697-b586d89ba3ee'),
  },
};

export default images;
