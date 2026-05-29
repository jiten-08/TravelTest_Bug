import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Badge from '../components/Badge.jsx';
import Button from '../components/Button.jsx';
import payments from '../data/payments.json';
import images from '../data/images.js';

const initialCardForm = {
  cardNumber: '',
  cardName: '',
  expiry: '',
  cvv: '',
  otp: '',
};

function getStoredJson(key) {
  const value = localStorage.getItem(key);
  return value ? JSON.parse(value) : null;
}

function calculateNights(searchDetails) {
  if (!searchDetails?.checkInDate || !searchDetails?.checkOutDate) {
    return 1;
  }

  const checkIn = new Date(searchDetails.checkInDate);
  const checkOut = new Date(searchDetails.checkOutDate);
  const diff = Math.round((checkOut - checkIn) / (1000 * 60 * 60 * 24));
  return diff > 0 ? diff : 1;
}

function validateCard(form) {
  const errors = {};
  const digits = form.cardNumber.replace(/\s/g, '');
  const rules = payments.cardRules;

  if (!digits) {
    errors.cardNumber = 'Card number is required.';
  } else if (!/^\d+$/.test(digits) || digits.length !== rules.cardNumberLength) {
    errors.cardNumber = 'Enter a valid 16 digit card number.';
  } else if (!rules.validPrefixes.some((prefix) => digits.startsWith(prefix))) {
    errors.cardNumber = 'Card number must start with 4, 5, or 6.';
  }

  if (!form.cardName.trim()) {
    errors.cardName = 'Name on card is required.';
  }

  if (!form.expiry) {
    errors.expiry = 'Expiry date is required.';
  } else if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(form.expiry)) {
    errors.expiry = 'Use MM/YY format.';
  }

  if (!form.cvv) {
    errors.cvv = 'CVV is required.';
  } else if (!new RegExp(`^\\d{${rules.cvvLength}}$`).test(form.cvv)) {
    errors.cvv = 'Enter a valid 3 digit CVV.';
  }

  if (!form.otp) {
    errors.otp = 'OTP is required.';
  } else if (!new RegExp(`^\\d{${rules.otpLength}}$`).test(form.otp) || form.otp !== rules.validOtp) {
    errors.otp = 'Enter the valid demo OTP 123456.';
  }

  return errors;
}

function PaymentPlaceholderPage() {
  const navigate = useNavigate();
  const selectedFlight = getStoredJson('traveltest_selected_flight');
  const selectedHotel = getStoredJson('traveltest_selected_hotel');
  const selectedSeats = getStoredJson('traveltest_selected_seats') || [];
  const seatSummary = getStoredJson('traveltest_seat_summary') || {};
  const flightSearch = getStoredJson('traveltest_flight_search');
  const hotelSearch = getStoredJson('traveltest_hotel_search');
  const userSession = getStoredJson('traveltest_user_session');
  const bookingItem = selectedHotel || selectedFlight;
  const bookingType = selectedHotel ? 'hotel' : selectedFlight ? 'flight' : '';
  const searchDetails = selectedHotel ? hotelSearch : flightSearch;

  const [activeMethod, setActiveMethod] = useState('card');
  const [cardForm, setCardForm] = useState(initialCardForm);
  const [upiId, setUpiId] = useState('');
  const [selectedBank, setSelectedBank] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [promoMessage, setPromoMessage] = useState('');
  const [promoError, setPromoError] = useState('');
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  const amounts = useMemo(() => {
    const baseAmount =
      bookingType === 'hotel'
        ? (bookingItem?.pricePerNight || 0) * calculateNights(searchDetails) * Number(searchDetails?.rooms || 1)
        : (bookingItem?.price || 0) + Number(seatSummary.seatCharges || 0);
    const taxesAndFees = Math.round(baseAmount * 0.12 + 299);
    const finalPayable = Math.max(baseAmount + taxesAndFees - discount, 0);
    return { baseAmount, taxesAndFees, finalPayable };
  }, [bookingItem, bookingType, discount, searchDetails, seatSummary.seatCharges]);

  const updateCardField = (event) => {
    const { name, value } = event.target;
    setCardForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: '' }));
  };

  const applyPromo = () => {
    const enteredCode = promoCode.trim().toUpperCase();
    const promo = payments.promoCodes.find((item) => item.code === enteredCode);

    setPromoMessage('');
    setPromoError('');

    if (!enteredCode) {
      setPromoError('Enter a promo code.');
      return;
    }

    if (!promo) {
      setDiscount(0);
      setPromoError('Invalid promo code.');
      return;
    }

    const discountAmount =
      promo.type === 'percentage' ? Math.round((amounts.baseAmount * promo.value) / 100) : promo.value;
    setDiscount(Math.min(discountAmount, amounts.baseAmount));
    setPromoMessage(promo.message);
  };

  const validatePayment = () => {
    if (!bookingItem) {
      return { payment: 'Select a flight or hotel before making payment.' };
    }

    if (activeMethod === 'card') {
      return validateCard(cardForm);
    }

    if (activeMethod === 'upi') {
      if (!upiId.trim()) {
        return { upi: 'UPI ID is required.' };
      }

      if (!payments.validUpiSamples.includes(upiId.trim().toLowerCase())) {
        return { upi: 'Use a valid demo UPI ID like traveller@upi.' };
      }
    }

    if (activeMethod === 'netbanking' && !selectedBank) {
      return { bank: 'Select a bank.' };
    }

    return {};
  };

  const completePayment = () => {
    const validationErrors = validatePayment();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    const bookingId = `BK-${Date.now()}`;
    const booking = {
      bookingId,
      bookingType,
      item: bookingItem,
      searchDetails,
      selectedSeats,
      seatSummary,
      customer: userSession || null,
      paymentMethod: activeMethod,
      paymentStatus: 'success',
      baseAmount: amounts.baseAmount,
      taxesAndFees: amounts.taxesAndFees,
      discount,
      totalPaid: amounts.finalPayable,
      bookingDateTime: new Date().toISOString(),
    };

    const existingBookings = getStoredJson('traveltest_booking_history') || [];
    localStorage.setItem('traveltest_current_booking', JSON.stringify(booking));
    localStorage.setItem('traveltest_booking_history', JSON.stringify([booking, ...existingBookings]));
    setSuccessMessage('Payment successful. Redirecting to confirmation.');
    navigate('/booking/confirmation');
  };

  return (
    <section className="bg-slate-50 px-4 py-12 sm:px-6 lg:px-8" data-testid="payment-page">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-xl" data-testid="payment-placeholder-page">
          <div className="relative h-60">
            <img
              src={images.paymentBanner}
              alt="Secure travel payment"
              loading="lazy"
              className="h-full w-full object-cover"
              onError={(event) => {
                event.currentTarget.style.display = 'none';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 to-primary-700/35" />
            <div className="absolute inset-0 flex items-end p-6 sm:p-8">
              <div>
                <p className="text-sm font-bold uppercase tracking-wide text-accent-400" data-testid="payment-placeholder-eyebrow">
                  Secure checkout
                </p>
                <h1 className="mt-2 font-heading text-3xl font-bold text-white" data-testid="payment-placeholder-title">
                  Complete your booking
                </h1>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
          <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-6 grid gap-3 sm:grid-cols-3">
              {[
                { id: 'card', label: 'Credit Card', testId: 'credit-card-tab' },
                { id: 'upi', label: 'UPI', testId: 'upi-tab' },
                { id: 'netbanking', label: 'Net Banking', testId: 'net-banking-tab' },
              ].map((method) => (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => {
                    setActiveMethod(method.id);
                    setErrors({});
                  }}
                  className={[
                    'rounded-2xl border px-4 py-3 text-sm font-bold transition-all focus-ring',
                    activeMethod === method.id
                      ? 'border-primary-600 bg-primary-50 text-primary-700'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50',
                  ].join(' ')}
                  data-testid={method.testId}
                >
                  {method.label}
                </button>
              ))}
            </div>

            {errors.payment ? (
              <p className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700" data-testid="payment-validation-message">
                {errors.payment}
              </p>
            ) : null}

            {activeMethod === 'card' ? (
              <div className="grid gap-5 sm:grid-cols-2" data-testid="credit-card-form">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700" htmlFor="payment-card-number-input">
                    Card number
                  </label>
                  <input
                    id="payment-card-number-input"
                    name="cardNumber"
                    value={cardForm.cardNumber}
                    onChange={updateCardField}
                    className="travel-field mt-2"
                    placeholder="4111111111111111"
                    data-testid="payment-card-number-input"
                  />
                  {errors.cardNumber ? (
                    <p className="mt-2 text-sm font-semibold text-red-600" data-testid="card-number-validation-message">
                      {errors.cardNumber}
                    </p>
                  ) : null}
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700" htmlFor="payment-card-name-input">
                    Name on card
                  </label>
                  <input
                    id="payment-card-name-input"
                    name="cardName"
                    value={cardForm.cardName}
                    onChange={updateCardField}
                    className="travel-field mt-2"
                    data-testid="payment-card-name-input"
                  />
                  {errors.cardName ? (
                    <p className="mt-2 text-sm font-semibold text-red-600" data-testid="card-name-validation-message">
                      {errors.cardName}
                    </p>
                  ) : null}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700" htmlFor="payment-expiry-input">
                    Expiry
                  </label>
                  <input
                    id="payment-expiry-input"
                    name="expiry"
                    value={cardForm.expiry}
                    onChange={updateCardField}
                    className="travel-field mt-2"
                    placeholder="MM/YY"
                    data-testid="payment-expiry-input"
                  />
                  {errors.expiry ? (
                    <p className="mt-2 text-sm font-semibold text-red-600" data-testid="expiry-validation-message">
                      {errors.expiry}
                    </p>
                  ) : null}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700" htmlFor="payment-cvv-input">
                    CVV
                  </label>
                  <input
                    id="payment-cvv-input"
                    name="cvv"
                    value={cardForm.cvv}
                    onChange={updateCardField}
                    className="travel-field mt-2"
                    data-testid="payment-cvv-input"
                  />
                  {errors.cvv ? (
                    <p className="mt-2 text-sm font-semibold text-red-600" data-testid="cvv-validation-message">
                      {errors.cvv}
                    </p>
                  ) : null}
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700" htmlFor="payment-otp-input">
                    OTP
                  </label>
                  <input
                    id="payment-otp-input"
                    name="otp"
                    value={cardForm.otp}
                    onChange={updateCardField}
                    className="travel-field mt-2"
                    placeholder="123456"
                    data-testid="payment-otp-input"
                  />
                  {errors.otp ? (
                    <p className="mt-2 text-sm font-semibold text-red-600" data-testid="otp-validation-message">
                      {errors.otp}
                    </p>
                  ) : null}
                </div>
              </div>
            ) : null}

            {activeMethod === 'upi' ? (
              <div data-testid="upi-payment-form">
                <label className="block text-sm font-semibold text-slate-700" htmlFor="payment-upi-input">
                  UPI ID
                </label>
                <input
                  id="payment-upi-input"
                  value={upiId}
                  onChange={(event) => {
                    setUpiId(event.target.value);
                    setErrors((current) => ({ ...current, upi: '' }));
                  }}
                  className="travel-field mt-2"
                  placeholder="traveller@upi"
                  data-testid="payment-upi-input"
                />
                {errors.upi ? (
                  <p className="mt-2 text-sm font-semibold text-red-600" data-testid="upi-validation-message">
                    {errors.upi}
                  </p>
                ) : null}
                <button
                  type="button"
                  className="mt-4 rounded-2xl border border-primary-100 bg-primary-50 px-4 py-2 text-sm font-bold text-primary-700 focus-ring"
                  data-testid="verify-upi-button"
                >
                  Verify UPI
                </button>
              </div>
            ) : null}

            {activeMethod === 'netbanking' ? (
              <div data-testid="net-banking-form">
                <label className="block text-sm font-semibold text-slate-700" htmlFor="payment-bank-dropdown">
                  Select bank
                </label>
                <select
                  id="payment-bank-dropdown"
                  value={selectedBank}
                  onChange={(event) => {
                    setSelectedBank(event.target.value);
                    setErrors((current) => ({ ...current, bank: '' }));
                  }}
                  className="travel-select mt-2"
                  data-testid="payment-bank-dropdown"
                >
                  <option value="">Choose bank</option>
                  {payments.bankNames.map((bank) => (
                    <option key={bank} value={bank}>
                      {bank}
                    </option>
                  ))}
                </select>
                {errors.bank ? (
                  <p className="mt-2 text-sm font-semibold text-red-600" data-testid="bank-validation-message">
                    {errors.bank}
                  </p>
                ) : null}
              </div>
            ) : null}

            {successMessage ? (
              <p className="mt-5 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700" data-testid="payment-success-message">
                {successMessage}
              </p>
            ) : null}

            <Button type="button" onClick={completePayment} className="mt-6 w-full" data-testid="payment-pay-button">
              {activeMethod === 'netbanking' ? 'Proceed to Pay' : 'Pay now'}
            </Button>
          </div>

          <aside className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6" data-testid="booking-summary-card">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-heading text-xl font-bold text-slate-900">Booking summary</h2>
              {bookingType ? <Badge>{bookingType}</Badge> : null}
            </div>

            {bookingType === 'hotel' ? (
              <div className="rounded-2xl bg-slate-50 p-4" data-testid="selected-hotel-summary">
                <p className="font-bold text-slate-950" data-testid="selected-hotel-name">
                  {bookingItem.name}
                </p>
                <p className="mt-2 text-sm text-slate-600" data-testid="selected-hotel-location">
                  {bookingItem.city} | {bookingItem.address}
                </p>
                <p className="mt-2 text-sm text-slate-600">
                  {calculateNights(searchDetails)} night(s) | {searchDetails?.rooms || 1} room(s)
                </p>
              </div>
            ) : bookingType === 'flight' ? (
              <div className="rounded-2xl bg-slate-50 p-4" data-testid="selected-flight-summary">
                <p className="font-bold text-slate-950" data-testid="selected-flight-airline">
                  {bookingItem.airline} | {bookingItem.flightNumber}
                </p>
                <p className="mt-2 text-sm text-slate-600" data-testid="selected-flight-route">
                  {bookingItem.source} to {bookingItem.destination}
                </p>
                <p className="mt-2 text-sm text-slate-600">
                  {bookingItem.departureTime} | {bookingItem.travelClass}
                </p>
                {selectedSeats.length > 0 ? (
                  <p className="mt-2 text-sm text-slate-600" data-testid="selected-seat-summary">
                    Seats: {selectedSeats.map((seat) => seat.seatNumber).join(', ')}
                  </p>
                ) : null}
              </div>
            ) : (
              <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600" data-testid="selected-flight-empty-message">
                No selected flight or hotel is available yet.
              </p>
            )}

            <div className="mt-5 border-t border-slate-100 pt-5">
              <label className="block text-sm font-semibold text-slate-700" htmlFor="payment-promo-input">
                Promo code
              </label>
              <div className="mt-2 flex gap-2">
                <input
                  id="payment-promo-input"
                  value={promoCode}
                  onChange={(event) => {
                    setPromoCode(event.target.value);
                    setPromoMessage('');
                    setPromoError('');
                  }}
                  className="travel-field"
                  placeholder="SKY10"
                  data-testid="payment-promo-input"
                />
                <button
                  type="button"
                  onClick={applyPromo}
                  className="rounded-xl bg-accent-500 px-4 py-2 text-sm font-bold text-white hover:bg-accent-600 focus-ring"
                  data-testid="payment-apply-promo-button"
                >
                  Apply
                </button>
              </div>
              {promoMessage ? (
                <p className="mt-2 text-sm font-semibold text-green-700" data-testid="promo-success-message">
                  {promoMessage}
                </p>
              ) : null}
              {promoError ? (
                <p className="mt-2 text-sm font-semibold text-red-600" data-testid="promo-invalid-message">
                  {promoError}
                </p>
              ) : null}
            </div>

            <div className="mt-5 space-y-3 border-t border-slate-100 pt-5">
              <div className="flex justify-between text-sm text-slate-600">
                <span>Base amount</span>
                <span data-testid="payment-base-amount">Rs. {amounts.baseAmount.toLocaleString('en-IN')}</span>
              </div>
              {bookingType === 'flight' && Number(seatSummary.seatCharges || 0) > 0 ? (
                <div className="flex justify-between text-sm text-slate-600">
                  <span>Included seat charges</span>
                  <span data-testid="payment-seat-charges">Rs. {Number(seatSummary.seatCharges).toLocaleString('en-IN')}</span>
                </div>
              ) : null}
              <div className="flex justify-between text-sm text-slate-600">
                <span>Taxes and fees</span>
                <span data-testid="payment-taxes-fees">Rs. {amounts.taxesAndFees.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-sm text-green-700">
                <span>Discount</span>
                <span data-testid="payment-discount-amount">- Rs. {discount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between border-t border-slate-100 pt-4 text-lg font-bold text-slate-950">
                <span>Payable</span>
                <span data-testid="payment-final-amount">Rs. {amounts.finalPayable.toLocaleString('en-IN')}</span>
              </div>
              <div className="sr-only" data-testid="payment-amount">
                Rs. {amounts.finalPayable.toLocaleString('en-IN')}
              </div>
            </div>

            <Link
              to={bookingType === 'hotel' ? '/hotels/search' : '/flights/search'}
              className="mt-6 inline-flex text-sm font-bold text-primary-700 focus-ring"
              data-testid="payment-placeholder-back-to-search-link"
            >
              Back to search
            </Link>
          </aside>
        </div>
      </div>
    </section>
  );
}

export default PaymentPlaceholderPage;
