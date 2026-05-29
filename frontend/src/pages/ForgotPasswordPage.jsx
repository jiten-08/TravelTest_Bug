import { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout.jsx';
import Button from '../components/Button.jsx';
import Card from '../components/Card.jsx';
import images from '../data/images.js';
import users from '../data/users.json';

function validateEmail(email) {
  if (!email.trim()) {
    return 'Email is required.';
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return 'Enter a valid email address.';
  }

  return '';
}

function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [validationMessage, setValidationMessage] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [statusType, setStatusType] = useState('');

  const handleEmailChange = (event) => {
    setEmail(event.target.value);
    setValidationMessage('');
    setStatusMessage('');
    setStatusType('');
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const emailError = validateEmail(email);
    setValidationMessage(emailError);

    if (emailError) {
      return;
    }

    const matchingUser = users.find((user) => user.email.toLowerCase() === email.trim().toLowerCase());

    if (!matchingUser) {
      setStatusType('error');
      setStatusMessage('No account was found for this email address.');
      return;
    }

    setStatusType('success');
    setStatusMessage('Password reset instructions have been sent to your email.');
  };

  return (
    <section className="bg-slate-50" data-testid="forgot-password-page">
      <AuthLayout eyebrow="Account recovery" title="Recover access and keep your trip moving" image={images.loginBackground}>
      <Card className="mx-auto max-w-md bg-white/95 p-6 shadow-2xl backdrop-blur sm:p-8">
        <div className="mb-8">
          <p className="text-sm font-bold uppercase tracking-wide text-accent-500" data-testid="forgot-password-eyebrow">
            Account recovery
          </p>
          <h1 className="mt-2 text-3xl font-bold text-slate-950" data-testid="forgot-password-title">
            Forgot password
          </h1>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit} noValidate data-testid="forgot-password-form">
          <div>
            <label className="block text-sm font-semibold text-slate-700" htmlFor="forgot-password-email-input">
              Email
            </label>
            <div className="mt-2 flex items-center rounded-xl border border-slate-300 bg-white px-4 shadow-sm transition-all focus-within:ring-2 focus-within:ring-primary-500 focus-within:ring-offset-2">
              <span className="mr-3 text-sm font-semibold text-primary-700" aria-hidden="true">
                @
              </span>
              <input
                id="forgot-password-email-input"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={handleEmailChange}
                className="min-w-0 flex-1 py-3 text-slate-950 focus:outline-none"
                data-testid="forgot-password-email-input"
              />
            </div>
            {validationMessage ? (
              <p className="mt-2 text-sm font-medium text-red-600" data-testid="forgot-password-email-validation-message">
                {validationMessage}
              </p>
            ) : null}
          </div>

          {statusMessage ? (
            <p
              className={[
                'rounded-2xl border px-4 py-3 text-sm font-semibold',
                statusType === 'success'
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                  : 'border-red-200 bg-red-50 text-red-700',
              ].join(' ')}
              data-testid={
                statusType === 'success' ? 'forgot-password-success-message' : 'forgot-password-error-message'
              }
            >
              {statusMessage}
            </p>
          ) : null}

          <Button
            type="submit"
            className="w-full"
            data-testid="forgot-password-submit-button"
          >
            Submit
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600" data-testid="forgot-password-login-prompt">
          Remembered it?{' '}
          <Link className="font-bold text-primary-700 hover:text-primary-600 focus-ring" to="/login" data-testid="forgot-password-login-link">
            Back to login
          </Link>
        </p>
      </Card>
      </AuthLayout>
    </section>
  );
}

export default ForgotPasswordPage;
