import { useState } from 'react';
import Button from '../components/Button.jsx';
import Card from '../components/Card.jsx';
import images from '../data/images.js';

const initialForm = {
  name: '',
  email: '',
  subject: '',
  message: '',
};

function validateContact(form) {
  const errors = {};

  if (!form.name.trim()) errors.name = 'Full name is required.';
  if (!form.email.trim()) errors.email = 'Email is required.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = 'Enter a valid email address.';
  if (!form.subject.trim()) errors.subject = 'Subject is required.';
  if (!form.message.trim()) errors.message = 'Message is required.';

  return errors;
}

function ContactSupportPage() {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: '' }));
    setSuccessMessage('');
  };

  const submitForm = (event) => {
    event.preventDefault();
    const validationErrors = validateContact(form);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;

    setSuccessMessage('Thanks for contacting TravelTest support. Our team will respond shortly.');
    setForm(initialForm);
  };

  return (
    <section className="bg-slate-50 pb-16" data-testid="contact-page">
      <div className="relative overflow-hidden bg-slate-950">
        <img
          src={images.flightBanner}
          alt="Airport support desk"
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover"
          onError={(event) => {
            event.currentTarget.style.display = 'none';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 to-primary-700/45" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <p className="text-sm font-bold uppercase tracking-wide text-accent-400">Support</p>
          <h1 className="mt-2 font-heading text-4xl font-bold text-white">Contact TravelTest</h1>
          <p className="mt-4 max-w-2xl text-blue-100">Need help with a booking, payment, or itinerary? Send us a message.</p>
        </div>
      </div>

      <div className="relative z-10 mx-auto grid max-w-7xl items-start gap-6 px-4 pt-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:px-8">
        <Card className="p-5 shadow-xl sm:p-6">
          <form className="grid gap-5" onSubmit={submitForm} noValidate data-testid="contact-form">
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Full name</span>
              <input name="name" value={form.name} onChange={updateField} className="travel-field mt-2 block w-full" data-testid="contact-name-input" />
              {errors.name ? <p className="mt-2 text-sm font-semibold text-red-600">{errors.name}</p> : null}
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Email</span>
              <input name="email" value={form.email} onChange={updateField} className="travel-field mt-2 block w-full" data-testid="contact-email-input" />
              {errors.email ? <p className="mt-2 text-sm font-semibold text-red-600">{errors.email}</p> : null}
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Subject</span>
              <input name="subject" value={form.subject} onChange={updateField} className="travel-field mt-2 block w-full" data-testid="contact-subject-input" />
              {errors.subject ? <p className="mt-2 text-sm font-semibold text-red-600">{errors.subject}</p> : null}
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Message</span>
              <textarea name="message" value={form.message} onChange={updateField} rows="6" className="travel-field mt-2 block min-h-40 w-full resize-y" data-testid="contact-message-input" />
              {errors.message ? <p className="mt-2 text-sm font-semibold text-red-600">{errors.message}</p> : null}
            </label>
            {successMessage ? (
              <p className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700" data-testid="contact-success-message">
                {successMessage}
              </p>
            ) : null}
            <Button type="submit" data-testid="contact-submit-button">
              Submit request
            </Button>
          </form>
        </Card>

        <div className="grid gap-5 lg:sticky lg:top-24">
          {[
            ['Email support', 'support@traveltest.local'],
            ['Phone support', '+91 98765 43210'],
            ['Live chat', 'Coming soon'],
          ].map(([title, value]) => (
            <Card key={title} className="p-5">
              <h2 className="font-heading text-lg font-bold text-slate-950">{title}</h2>
              <p className="mt-2 text-sm text-slate-600">{value}</p>
            </Card>
          ))}
        </div>
      </div>

      <div className="mx-auto mt-12 max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="font-heading text-3xl font-bold text-slate-950">FAQ</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {[
            ['Can I cancel a booking?', 'Cancellation controls will be added when backend booking rules are connected.'],
            ['Which payment methods work?', 'Cards, UPI, and net banking are available in the current frontend flow.'],
            ['Where are bookings saved?', 'Bookings are saved locally in your browser for this frontend build.'],
          ].map(([question, answer]) => (
            <Card key={question} className="p-5">
              <h3 className="font-bold text-slate-950">{question}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{answer}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ContactSupportPage;
