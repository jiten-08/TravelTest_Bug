import { Route, Routes } from 'react-router-dom';
import ForgotPasswordPage from '../pages/ForgotPasswordPage.jsx';
import FlightResultsPage from '../pages/FlightResultsPage.jsx';
import FlightSearchPage from '../pages/FlightSearchPage.jsx';
import FlightSeatSelectionPage from '../pages/FlightSeatSelectionPage.jsx';
import BookingConfirmationPage from '../pages/BookingConfirmationPage.jsx';
import BookingHistoryPage from '../pages/BookingHistoryPage.jsx';
import AboutUsPage from '../pages/AboutUsPage.jsx';
import ContactSupportPage from '../pages/ContactSupportPage.jsx';
import HotelResultsPage from '../pages/HotelResultsPage.jsx';
import HotelSearchPage from '../pages/HotelSearchPage.jsx';
import MainLayout from '../layouts/MainLayout.jsx';
import HomePage from '../pages/HomePage.jsx';
import LoginPage from '../pages/LoginPage.jsx';
import NotFoundPage from '../pages/NotFoundPage.jsx';
import PaymentPlaceholderPage from '../pages/PaymentPlaceholderPage.jsx';
import RegisterPage from '../pages/RegisterPage.jsx';
import UserProfilePage from '../pages/UserProfilePage.jsx';

function AppRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/flights/search" element={<FlightSearchPage />} />
        <Route path="/flights/results" element={<FlightResultsPage />} />
        <Route path="/flights/seats" element={<FlightSeatSelectionPage />} />
        <Route path="/hotels/search" element={<HotelSearchPage />} />
        <Route path="/hotels/results" element={<HotelResultsPage />} />
        <Route path="/payment" element={<PaymentPlaceholderPage />} />
        <Route path="/booking/confirmation" element={<BookingConfirmationPage />} />
        <Route path="/bookings/history" element={<BookingHistoryPage />} />
        <Route path="/profile" element={<UserProfilePage />} />
        <Route path="/contact" element={<ContactSupportPage />} />
        <Route path="/about" element={<AboutUsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default AppRoutes;
