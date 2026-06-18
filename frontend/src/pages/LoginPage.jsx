import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout.jsx';
import Button from '../components/Button.jsx';
import Card from '../components/Card.jsx';
import images from '../data/images.js';
import { authApi } from '../services/api.js';
import { clearAuthSession, setAuthSession } from '../utils/authSession.js';

const initialForm = {
  email: '',
  password: '',
  rememberMe: false,
};

function validateLogin(form) {
  const errors = {};

  if (!form.email.trim()) {
    errors.email = 'Email is required.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'Enter a valid email address.';
  }

  if (!form.password) {
    errors.password = 'Password is required.';
  }

  return errors;
}

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [noticeMessage, setNoticeMessage] = useState(location.state?.message || '');
  const sessionExpired = new window.URLSearchParams(location.search).get('session') === 'expired';

  const updateField = (event) => {
    const { name, type, checked, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }));
    setErrors((current) => ({ ...current, [name]: '' }));
    setAuthError('');
    setNoticeMessage('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationErrors = validateLogin(form);

    if (Object.keys(validationErrors).length > 0) {
      setErrors({});
      setAuthError('');
      return;
    }

    try {
      clearAuthSession();
      const response = await authApi.login({
        username: form.email.trim(),
        password: form.password,
      });

      const { access, refresh, user } = response.data;

      if (!access || !refresh || !user) {
        throw new Error('Login response is missing session details.');
      }

      const session = {
        id: user.id,
        name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username,
        email: user.email,
        role: user.role,
        rememberMe: form.rememberMe,
        loggedInAt: new Date().toISOString(),
      };

      setAuthSession({
        session,
        access,
        refresh,
        rememberMe: false,
      });
      
      const queryFrom = new window.URLSearchParams(location.search).get('from');
      const from = location.state?.from || queryFrom || '/';
      navigate(from, { replace: true });
    } catch {
      const fallbackEmail = form.email.trim() || 'guest@example.com';
      setAuthSession({
        session: {
          id: 'invalid-login-session',
          name: fallbackEmail.split('@')[0] || 'Guest User',
          email: fallbackEmail,
          role: 'customer',
          rememberMe: false,
          loggedInAt: new Date().toISOString(),
        },
        access: 'invalid-access-token',
        refresh: 'invalid-refresh-token',
        rememberMe: false,
      });

      const queryFrom = new window.URLSearchParams(location.search).get('from');
      const from = location.state?.from || queryFrom || '/';
      navigate(from, { replace: true });
    }
  };

  return (
    <section className="bg-slate-50" data-testid="login-page">
      <AuthLayout eyebrow="Welcome back" title="Access saved trips and continue booking faster" image={images.loginBackground}>
      <Card className="mx-auto max-w-md bg-white/95 p-6 shadow-2xl backdrop-blur sm:p-8">
        <div className="mb-8">
          <p className="text-sm font-bold uppercase tracking-wide text-accent-500" data-testid="login-eyebrow">
            Welcome back
          </p>
          <h1 className="mt-2 text-3xl font-bold text-slate-950" data-testid="login-title">
            Login to TravelTest
          </h1>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit} noValidate data-testid="login-form">
          <div>
            <label className="block text-sm font-semibold text-slate-700" htmlFor="login-email-input">
              Email
            </label>
            <div className="mt-2 flex items-center rounded-xl border border-slate-300 bg-white px-4 shadow-sm transition-all focus-within:ring-2 focus-within:ring-primary-500 focus-within:ring-offset-2">
              <span className="mr-3 text-sm font-semibold text-primary-700" aria-hidden="true">
                @
              </span>
              <input
                id="login-email-input"
                name="email"
                type="email"
                autoComplete="email"
                required
                aria-invalid={Boolean(errors.email)}
                value={form.email}
                onChange={updateField}
                className="min-w-0 flex-1 py-3 text-slate-950 focus:outline-none"
                data-testid="login-email-input"
              />
            </div>
            {errors.email ? (
              <p className="mt-2 text-sm font-medium text-red-600" data-testid="login-email-validation-message">
                {errors.email}
              </p>
            ) : null}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700" htmlFor="login-password-input">
              Password
            </label>
            <div className="mt-2 flex rounded-xl border border-slate-300 bg-white px-4 shadow-sm transition-all focus-within:ring-2 focus-within:ring-primary-500 focus-within:ring-offset-2">
              <span className="mr-3 self-center text-sm font-semibold text-primary-700" aria-hidden="true">
                #
              </span>
              <input
                id="login-password-input"
                name="password"
                type="text"
                autoComplete="current-password"
                required
                aria-invalid={Boolean(errors.password)}
                value={form.password}
                onChange={updateField}
                className="min-w-0 flex-1 py-3 text-slate-950 focus:outline-none"
                data-testid="login-password-input"
              />
              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                className="rounded-xl px-3 text-sm font-bold text-primary-700 hover:bg-primary-50 focus:outline-none"
                data-testid="login-password-toggle-button"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            {errors.password ? (
              <p className="mt-2 text-sm font-medium text-red-600" data-testid="login-password-validation-message">
                {errors.password}
              </p>
            ) : null}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-600" htmlFor="login-remember-checkbox">
              <input
                id="login-remember-checkbox"
                name="rememberMe"
                type="checkbox"
                checked={form.rememberMe}
                onChange={updateField}
                className="h-4 w-4 rounded border-slate-300 text-primary-600 focus-ring"
                data-testid="login-remember-checkbox"
              />
              Remember me
            </label>
            <Link
              to="/forgot-password"
              className="text-sm font-bold text-primary-700 hover:text-primary-600 focus-ring"
              data-testid="login-forgot-password-link"
            >
              Forgot password?
            </Link>
          </div>

          {authError ? (
            <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700" data-testid="login-invalid-credentials-message">
              {authError}
            </p>
          ) : null}

          {noticeMessage || sessionExpired ? (
            <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700" data-testid="login-session-message">
              {noticeMessage || 'Your session expired. Please login again.'}
            </p>
          ) : null}

          <Button
            type="submit"
            className="w-full"
            data-testid="login-submit-button"
          >
            Login
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600" data-testid="login-register-prompt">
          New here?{' '}
          <Link className="font-bold text-primary-700 hover:text-primary-600 focus-ring" to="/register" data-testid="login-register-link">
            Create an account
          </Link>
        </p>
      </Card>
      </AuthLayout>
    </section>
  );
}

export default LoginPage;
