import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Badge from '../components/Badge.jsx';
import Button from '../components/Button.jsx';
import payments from '../data/payments.json';
import images from '../data/images.js';
import FancySelect from '../components/FancySelect.jsx';

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

const defaultHotelRoomOptions = [
  {
    id: 'standard',
    label: 'Standard Room',
    description: 'Essential amenities and comfortable stay.',
    priceOffset: 0,
    defaultAvailable: 8,
  },
  {
    id: 'deluxe',
    label: 'Deluxe Room',
    description: 'Spacious room with premium bedding and views.',
    priceOffset: 1600,
    defaultAvailable: 4,
  },
  {
    id: 'luxury',
    label: 'Luxury Room',
    description: 'A suite with premium perks and extra space.',
    priceOffset: 3000,
    defaultAvailable: 2,
  },
];

function getHotelInventory(hotelId) {
  const storageKey = 'traveltest_hotel_inventory';
  const storedInventory = getStoredJson(storageKey) || {};
  if (!hotelId) {
    return {};
  }

  const defaultInventory = defaultHotelRoomOptions.reduce(
    (inventory, room) => ({ ...inventory, [room.id]: room.defaultAvailable }),
    {},
  );

  if (!storedInventory[hotelId]) {
    storedInventory[hotelId] = defaultInventory;
    localStorage.setItem(storageKey, JSON.stringify(storedInventory));
  }

  return storedInventory[hotelId];
}

function decrementHotelInventory(hotelId, roomTypeId, quantity = 1) {
  const storageKey = 'traveltest_hotel_inventory';
  const storedInventory = getStoredJson(storageKey) || {};
  const hotelInventory = storedInventory[hotelId] || getHotelInventory(hotelId);
  hotelInventory[roomTypeId] = Math.max(0, (hotelInventory[roomTypeId] || 0) - quantity);
  storedInventory[hotelId] = hotelInventory;
  localStorage.setItem(storageKey, JSON.stringify(storedInventory));
  return hotelInventory;
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
  const location = useLocation();
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
  const [selectedRoomTypeId, setSelectedRoomTypeId] = useState('');
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  const hotelRoomTypes = useMemo(() => {
    if (bookingType !== 'hotel' || !bookingItem) {
      return [];
    }

    const hotelInventory = getHotelInventory(bookingItem.id);
    const basePrice = bookingItem.pricePerNight || 0;

    return defaultHotelRoomOptions.map((room) => ({
      ...room,
      available: hotelInventory[room.id] ?? room.defaultAvailable,
      price: basePrice + room.priceOffset,
    }));
  }, [bookingItem, bookingType]);

  const selectedRoomType = hotelRoomTypes.find((room) => room.id === selectedRoomTypeId);
  const selectedRoomPrice = selectedRoomType?.price ?? bookingItem?.pricePerNight ?? 0;

  useEffect(() => {
    if (!userSession) {
      navigate('/login', { state: { from: location.pathname + location.search } });
    }
  }, [userSession, navigate, location.pathname, location.search]);

  useEffect(() => {
    if (bookingType !== 'hotel') {
      return;
    }

    const roomsRequested = Number(searchDetails?.rooms || 1);
    const availableRoomType = hotelRoomTypes.find((room) => room.available >= roomsRequested);

    if (!selectedRoomTypeId && availableRoomType) {
      setSelectedRoomTypeId(availableRoomType.id);
    }

    if (selectedRoomTypeId && !hotelRoomTypes.some((room) => room.id === selectedRoomTypeId && room.available >= roomsRequested)) {
      setSelectedRoomTypeId(availableRoomType?.id || '');
    }
  }, [bookingType, hotelRoomTypes, searchDetails?.rooms, selectedRoomTypeId]);

  const amounts = useMemo(() => {
    const baseAmount =
      bookingType === 'hotel'
        ? selectedRoomPrice * calculateNights(searchDetails) * Number(searchDetails?.rooms || 1)
        : (bookingItem?.price || 0) + Number(seatSummary.seatCharges || 0);
    const taxesAndFees = Math.round(baseAmount * 0.12 + 299);
    const finalPayable = Math.max(baseAmount + taxesAndFees - discount, 0);
    return { baseAmount, taxesAndFees, finalPayable };
  }, [bookingItem, bookingType, discount, searchDetails, seatSummary.seatCharges, selectedRoomPrice]);

function getPromoDiscount(promo, baseAmount) {
  if (promo.type === 'percentage') {
    return Math.round((baseAmount * promo.value) / 100);
  }

  if (promo.type === 'fixed') {
    return promo.value;
  }

  if (promo.type === 'tiered') {
    const selectedTier = [...promo.tiers]
      .sort((a, b) => b.minAmount - a.minAmount)
      .find((tier) => baseAmount >= tier.minAmount);
    if (!selectedTier) {
      return 0;
    }
    return selectedTier.type === 'percentage'
      ? Math.round((baseAmount * selectedTier.value) / 100)
      : selectedTier.value;
  }

  return 0;
}

function getPromoDescription(promo) {
  if (promo.type === 'percentage') {
    return `${promo.value}% off this booking`;
  }

  if (promo.type === 'fixed') {
    return `Save Rs. ${promo.value.toLocaleString('en-IN')}`;
  }

  if (promo.type === 'tiered') {
    const highestTier = promo.tiers.reduce((prev, next) => (next.value > prev.value ? next : prev), promo.tiers[0]);
    return `Up to ${highestTier.value}% off based on booking amount`;
  }

  return '';
}

function formatPromoMessage(promo, discountAmount) {
  if (promo.message.includes('{discount}')) {
    return promo.message.replace('{discount}', discountAmount.toLocaleString('en-IN'));
  }
  return promo.message;
}

  const updateCardField = (event) => {
    const { name, value } = event.target;
    setCardForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: '' }));
  };

  const applyPromo = (code = promoCode) => {
    const enteredCode = code.trim().toUpperCase();
    const promo = payments.promoCodes.find((item) => item.code === enteredCode);

    setPromoCode(enteredCode);
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

    if (promo.minAmount && amounts.baseAmount < promo.minAmount) {
      setDiscount(0);
      setPromoError(`Spend Rs. ${promo.minAmount.toLocaleString('en-IN')} or more to use ${enteredCode}.`);
      return;
    }

    const discountAmount = getPromoDiscount(promo, amounts.baseAmount);
    setDiscount(Math.min(discountAmount, amounts.baseAmount));
    setPromoMessage(formatPromoMessage(promo, discountAmount));
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

    if (bookingType === 'hotel') {
      if (!selectedRoomTypeId) {
        return { roomType: 'Select a room type before payment.' };
      }

      const roomsRequested = Number(searchDetails?.rooms || 1);
      if (!selectedRoomType) {
        return { roomType: 'Selected room type is not available.' };
      }

      if (selectedRoomType.available < roomsRequested) {
        return {
          roomType: `Only ${selectedRoomType.available} ${selectedRoomType.label} left. Change room type or reduce rooms.`,
        };
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
    if (bookingType === 'hotel' && selectedRoomType) {
      decrementHotelInventory(bookingItem.id, selectedRoomTypeId, Number(searchDetails?.rooms || 1));
    }

    const booking = {
      bookingId,
      bookingType,
      item: bookingItem,
      searchDetails,
      selectedRoomType: selectedRoomType?.label || null,
      selectedRoomTypeId: selectedRoomTypeId || null,
      selectedRoomPrice,
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
                <FancySelect
                  id="payment-bank-dropdown"
                  name="paymentBank"
                  value={selectedBank}
                  onChange={(e) => {
                    setSelectedBank(e.target.value);
                    setErrors((current) => ({ ...current, bank: '' }));
                  }}
                  options={[{ value: '', label: 'Choose bank' }, ...payments.bankNames.map((b) => ({ value: b, label: b }))]}
                  data-testid="payment-bank-dropdown"
                />
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

            {bookingType === 'hotel' ? (
              <div className="mt-5 rounded-3xl border border-slate-100 bg-slate-50 p-5">
                <p className="text-sm font-semibold text-slate-700">Choose room type</p>
                <div className="mt-4 grid gap-3">
                  {hotelRoomTypes.map((room) => {
                    const roomsRequested = Number(searchDetails?.rooms || 1);
                    const isDisabled = room.available < roomsRequested;
                    return (
                      <button
                        type="button"
                        key={room.id}
                        onClick={() => !isDisabled && setSelectedRoomTypeId(room.id)}
                        disabled={isDisabled}
                        className={`w-full rounded-3xl border px-4 py-4 text-left transition-all ${
                          selectedRoomTypeId === room.id ? 'border-primary-600 bg-primary-50' : 'border-slate-200 bg-white hover:border-slate-300'
                        } ${isDisabled ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}
                        data-testid={`hotel-room-option-${room.id}`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-bold text-slate-950">{room.label}</p>
                            <p className="mt-1 text-xs text-slate-500">{room.description}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold text-slate-900">Rs. {room.price.toLocaleString('en-IN')}</p>
                            <p className={`mt-1 text-xs font-semibold ${room.available === 0 ? 'text-red-600' : 'text-slate-500'}`}>
                              {room.available === 0 ? 'Not available' : `${room.available} rooms left`}
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
                {errors.roomType ? (
                  <p className="mt-3 text-sm font-semibold text-red-600" data-testid="hotel-room-type-error">
                    {errors.roomType}
                  </p>
                ) : null}
              </div>
            ) : null}

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
                    setDiscount(0);
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
              <div className="mt-4 grid gap-3" data-testid="available-coupons-list">
                {payments.promoCodes.slice(0, 3).map((promo) => (
                  <div key={promo.code} className="flex items-center justify-between gap-3 rounded-2xl border border-dashed border-primary-200 bg-primary-50 p-3">
                    <div>
                      <p className="text-sm font-bold text-slate-950">{promo.code}</p>
                      <p className="mt-1 text-xs font-semibold text-slate-500">
                        {getPromoDescription(promo)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => applyPromo(promo.code)}
                      className="rounded-xl bg-white px-3 py-2 text-xs font-bold text-primary-700 shadow-sm hover:bg-primary-600 hover:text-white focus-ring"
                      data-testid={`apply-coupon-${promo.code.toLowerCase()}`}
                    >
                      Apply
                    </button>
                  </div>
                ))}
              </div>
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
