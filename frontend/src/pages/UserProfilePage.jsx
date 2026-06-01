import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button.jsx';
import Badge from '../components/Badge.jsx';
import users from '../data/users.json';
import images from '../data/images.js';
import FancySelect from '../components/FancySelect.jsx';

function getJson(key) {
  const value = localStorage.getItem(key);
  return value ? JSON.parse(value) : null;
}

function UserProfilePage() {
  const session = getJson('traveltest_user_session');
  const matchingUser = users.find((user) => user.email === session?.email);
  const bookings = useMemo(() => getJson('traveltest_booking_history') || [], []);
  const [successMessage, setSuccessMessage] = useState('');
  const [form, setForm] = useState({
    name: session?.name || `${matchingUser?.firstName || ''} ${matchingUser?.lastName || ''}`.trim(),
    email: session?.email || matchingUser?.email || '',
    phone: session?.phone || matchingUser?.phone || '',
    gender: session?.gender || matchingUser?.gender || '',
    memberSince: session?.loggedInAt || new Date().toISOString(),
  });

  const recentBookings = useMemo(() => bookings.slice(0, 3), [bookings]);

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setSuccessMessage('');
  };

  const saveProfile = (event) => {
    event.preventDefault();
    const updatedSession = {
      ...(session || {}),
      name: form.name,
      email: form.email,
      phone: form.phone,
      gender: form.gender,
      loggedInAt: form.memberSince,
    };
    localStorage.setItem('traveltest_user_session', JSON.stringify(updatedSession));
    setSuccessMessage('Profile changes saved locally.');
  };

  if (!session) {
    return (
      <section className="bg-slate-50 px-4 py-16 sm:px-6 lg:px-8" data-testid="user-profile-page">
        <div className="mx-auto max-w-3xl rounded-3xl border border-slate-100 bg-white p-8 text-center shadow-sm">
          <h1 className="font-heading text-3xl font-bold text-slate-950">Login required</h1>
          <p className="mt-3 text-slate-600">Please login to view and edit your TravelTest profile.</p>
          <Button as={Link} to="/login" className="mt-6" data-testid="profile-login-button">
            Login
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-slate-50 pb-16" data-testid="user-profile-page">
      <div className="relative overflow-hidden bg-slate-950">
        <img
          src={images.heroBackground}
          alt="Travel profile background"
          className="absolute inset-0 h-full w-full object-cover"
          loading="lazy"
          onError={(event) => {
            event.currentTarget.style.display = 'none';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 to-primary-700/45" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <p className="text-sm font-bold uppercase tracking-wide text-accent-400">My account</p>
          <h1 className="mt-2 font-heading text-4xl font-bold text-white">User Profile</h1>
        </div>
      </div>

      <div className="mx-auto -mt-10 grid max-w-7xl gap-6 px-4 sm:px-6 lg:grid-cols-[360px_1fr] lg:px-8">
        <aside className="rounded-3xl border border-slate-100 bg-white p-6 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-50 text-2xl font-bold text-primary-700">
              {form.name.charAt(0)}
            </div>
            <div>
              <h2 className="font-heading text-xl font-bold text-slate-950" data-testid="profile-name">
                {form.name}
              </h2>
              <p className="text-sm text-slate-600" data-testid="profile-email">
                {form.email}
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-3 text-sm">
            <p className="flex justify-between gap-4 text-slate-600">
              Phone <span className="font-semibold text-slate-950" data-testid="profile-phone">{form.phone || 'Not added'}</span>
            </p>
            <p className="flex justify-between gap-4 text-slate-600">
              Gender <span className="font-semibold text-slate-950">{form.gender || 'Not added'}</span>
            </p>
            <p className="flex justify-between gap-4 text-slate-600">
              Member since <span className="font-semibold text-slate-950">{new Date(form.memberSince).toLocaleDateString('en-IN')}</span>
            </p>
          </div>
        </aside>

        <div className="grid gap-6">
          <form className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm" onSubmit={saveProfile} data-testid="profile-edit-form">
            <h2 className="font-heading text-2xl font-bold text-slate-950">Edit profile</h2>
            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <label className="block">
                <span className="text-sm font-semibold text-slate-700">Full name</span>
                <input name="name" value={form.name} onChange={updateField} className="travel-field mt-2" data-testid="profile-name-input" />
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-slate-700">Email</span>
                <input name="email" value={form.email} onChange={updateField} className="travel-field mt-2" data-testid="profile-email-input" />
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-slate-700">Phone</span>
                <input name="phone" value={form.phone} onChange={updateField} className="travel-field mt-2" data-testid="profile-phone-input" />
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-slate-700">Gender</span>
                <FancySelect
                  id="profile-gender-select"
                  name="gender"
                  value={form.gender}
                  onChange={updateField}
                  options={[{ value: '', label: 'Select gender' }, { value: 'female', label: 'Female' }, { value: 'male', label: 'Male' }, { value: 'other', label: 'Other' }]}
                  data-testid="profile-gender-select"
                />
              </label>
            </div>
            {successMessage ? <p className="mt-4 text-sm font-semibold text-green-700">{successMessage}</p> : null}
            <Button type="submit" className="mt-6" data-testid="profile-save-button">
              Save changes
            </Button>
          </form>

          <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm" data-testid="change-password-section">
            <h2 className="font-heading text-2xl font-bold text-slate-950">Change password</h2>
            <p className="mt-2 text-sm text-slate-600">Password change is a UI placeholder until backend authentication is connected.</p>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <input className="travel-field" type="password" placeholder="Current password" data-testid="profile-current-password-input" />
              <input className="travel-field" type="password" placeholder="New password" data-testid="profile-new-password-input" />
            </div>
          </section>

          <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm" data-testid="recent-bookings-summary">
            <div className="flex items-center justify-between gap-4">
              <h2 className="font-heading text-2xl font-bold text-slate-950">Recent bookings</h2>
              <Badge>{bookings.length} total</Badge>
            </div>
            <div className="mt-5 grid gap-3">
              {recentBookings.length > 0 ? (
                recentBookings.map((booking) => (
                  <div key={booking.bookingId} className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                    <span className="font-semibold text-slate-950">{booking.bookingId}</span> | {booking.bookingType} | Rs.{' '}
                    {booking.totalPaid?.toLocaleString('en-IN')}
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-600">No recent bookings yet.</p>
              )}
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}

export default UserProfilePage;
