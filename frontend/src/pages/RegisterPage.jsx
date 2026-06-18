import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout.jsx';
import Button from '../components/Button.jsx';
import Card from '../components/Card.jsx';
import images from '../data/images.js';
import { authApi } from '../services/api.js';

const initialForm = {
  fullName: '',
  email: '',
  phone: '',
  gender: '',
  password: '',
  confirmPassword: '',
  termsAccepted: false,
};

function validateRegistration() {
  const errors = {};

  return errors;
}

function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});

  const updateField = (event) => {
    const { name, type, checked, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }));
    setErrors((current) => ({ ...current, [name]: '' }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationErrors = validateRegistration();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    const nameParts = form.fullName.trim().split(/\s+/);
    const first_name = nameParts[0] || '';
    const last_name = nameParts.slice(1).join(' ') || '';

    const payload = {
      username: form.email.trim(),
      email: form.email.trim(),
      password: form.password,
      password2: form.confirmPassword,
      first_name,
      last_name,
      phone: form.phone.trim(),
      gender: form.gender,
    };

    try {
      await authApi.register(payload);
      setForm(initialForm);
      setErrors({});
      navigate('/login', {
        replace: true,
        state: { message: 'Registration successful. Please login with your new account details.' },
      });
    } catch {
      setForm(initialForm);
      setErrors({});
      navigate('/login', {
        replace: true,
        state: { message: 'Registration successful. Please login with your new account details.' },
      });
    }
  };

  return (
    <section className="bg-slate-50" data-testid="register-page">
      <AuthLayout eyebrow="Create account" title="Create an account for booking flows" image={images.registerBackground}>
      <Card className="mx-auto max-w-2xl bg-white/95 p-6 shadow-2xl backdrop-blur sm:p-8">
        <div className="mb-8">
          <p className="text-sm font-bold uppercase tracking-wide text-accent-500" data-testid="register-eyebrow">
            Create account
          </p>
          <h1 className="mt-2 text-3xl font-bold text-slate-950" data-testid="register-title">
            Register for TravelTest
          </h1>
        </div>

        <form className="grid gap-5 sm:grid-cols-2" onSubmit={handleSubmit} noValidate data-testid="register-form">
          <div className="sm:col-span-2">
            <label className="block text-sm font-semibold text-slate-700" htmlFor="register-full-name-input">
              Full name
            </label>
            <input
              id="register-full-name-input"
              name="fullName"
              type="text"
              autoComplete="name"
              value={form.fullName}
              onChange={updateField}
              className="travel-field mt-2"
              data-testid="register-full-name-input"
            />
            {errors.fullName ? (
              <p className="mt-2 text-sm font-medium text-red-600" data-testid="register-full-name-validation-message">
                {errors.fullName}
              </p>
            ) : null}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700" htmlFor="register-email-input">
              Email
            </label>
            <input
              id="register-email-input"
              name="email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={updateField}
              className="travel-field mt-2"
              data-testid="register-email-input"
            />
            {errors.email ? (
              <p className="mt-2 text-sm font-medium text-red-600" data-testid="register-email-validation-message">
                {errors.email}
              </p>
            ) : null}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700" htmlFor="register-phone-input">
              Phone number
            </label>
            <input
              id="register-phone-input"
              name="phone"
              type="tel"
              autoComplete="tel"
              value={form.phone}
              onChange={updateField}
              className="travel-field mt-2"
              data-testid="register-phone-input"
            />
            {errors.phone ? (
              <p className="mt-2 text-sm font-medium text-red-600" data-testid="register-phone-validation-message">
                {errors.phone}
              </p>
            ) : null}
          </div>

          <fieldset className="sm:col-span-2" data-testid="register-gender-fieldset">
            <legend className="text-sm font-semibold text-slate-700" data-testid="register-gender-legend">
              Gender
            </legend>
            <div className="mt-2 flex flex-wrap gap-4">
              {['Female', 'Male', 'Other'].map((gender) => (
                <label key={gender} className="flex items-center gap-2 text-sm font-medium text-slate-600">
                  <input
                    name="gender"
                    type="radio"
                    value={gender.toLowerCase()}
                    checked={form.gender === gender.toLowerCase()}
                    onChange={updateField}
                    className="h-4 w-4 border-slate-300 text-primary-600 focus-ring"
                    data-testid={`register-gender-${gender.toLowerCase()}-radio`}
                  />
                  {gender}
                </label>
              ))}
            </div>
            {errors.gender ? (
              <p className="mt-2 text-sm font-medium text-red-600" data-testid="register-gender-validation-message">
                {errors.gender}
              </p>
            ) : null}
          </fieldset>

          <div>
            <label className="block text-sm font-semibold text-slate-700" htmlFor="register-password-input">
              Password
            </label>
            <input
              id="register-password-input"
              name="password"
              type="password"
              autoComplete="new-password"
              value={form.password}
              onChange={updateField}
              className="travel-field mt-2"
              data-testid="register-password-input"
            />
            {errors.password ? (
              <p className="mt-2 text-sm font-medium text-red-600" data-testid="register-password-validation-message">
                {errors.password}
              </p>
            ) : null}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700" htmlFor="register-confirm-password-input">
              Confirm password
            </label>
            <input
              id="register-confirm-password-input"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              value={form.confirmPassword}
              onChange={updateField}
              className="travel-field mt-2"
              data-testid="register-confirm-password-input"
            />
            {errors.confirmPassword ? (
              <p className="mt-2 text-sm font-medium text-red-600" data-testid="register-confirm-password-validation-message">
                {errors.confirmPassword}
              </p>
            ) : null}
          </div>

          <div className="sm:col-span-2">
            <label className="flex items-start gap-2 text-sm font-medium text-slate-600" htmlFor="register-terms-checkbox">
              <input
                id="register-terms-checkbox"
                name="termsAccepted"
                type="checkbox"
                checked={form.termsAccepted}
                onChange={updateField}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-primary-600 focus-ring"
                data-testid="register-terms-checkbox"
              />
              I agree to the terms and conditions
            </label>
            {errors.termsAccepted ? (
              <p className="mt-2 text-sm font-medium text-red-600" data-testid="register-terms-validation-message">
                {errors.termsAccepted}
              </p>
            ) : null}
          </div>

          <div className="sm:col-span-2">
            <Button
              type="submit"
              className="w-full"
              data-testid="register-submit-button"
            >
              Register
            </Button>
          </div>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600" data-testid="register-login-prompt">
          Already registered?{' '}
          <Link className="font-bold text-primary-700 hover:text-primary-600 focus-ring" to="/login" data-testid="register-login-link">
            Login
          </Link>
        </p>
      </Card>
      </AuthLayout>
    </section>
  );
}

export default RegisterPage;
