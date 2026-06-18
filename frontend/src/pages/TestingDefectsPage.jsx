import { useEffect, useState } from 'react';
import Card from '../components/Card.jsx';
import Button from '../components/Button.jsx';

function TestingDefectsPage() {
  const [dynamicId, setDynamicId] = useState(`dynamic-${Date.now()}`);
  const [delayedPopup, setDelayedPopup] = useState(false);
  const [uploadedFile, setUploadedFile] = useState('');

  useEffect(() => {
    document.title = 'TravelTest';
    const timer = window.setInterval(() => {
      setDynamicId(`dynamic-${Date.now()}-${Math.floor(Math.random() * 1000)}`);
    }, 900);

    return () => window.clearInterval(timer);
  }, []);

  const openWrongTab = () => {
    window.open('/login', '_blank', 'noopener,noreferrer');
  };

  const openChildWindow = () => {
    window.open('', '_blank');
  };

  const closeParentWindow = () => {
    window.close();
  };

  const showDelayedPopup = () => {
    window.setTimeout(() => setDelayedPopup(true), 2500 + Math.floor(Math.random() * 4000));
  };

  return (
    <section className="bg-slate-50 px-4 py-12 sm:px-6 lg:px-8" data-testid="testing-defects-page">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <p className="text-sm font-bold uppercase tracking-wide text-accent-500">QA defect lab</p>
          <h1 className="mt-2 font-heading text-4xl font-bold text-slate-950">Intentional Testing Defects</h1>
          <p className="mt-3 text-slate-600">Use these controls for automation practice across windows, frames, files, and dynamic elements.</p>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <Card className="p-5">
            <h2 className="font-heading text-xl font-bold text-slate-950">Window handling</h2>
            <div className="mt-4 flex flex-wrap gap-3">
              <Button type="button" onClick={openChildWindow} data-testid="child-window-button">
                Open child window
              </Button>
              <Button type="button" onClick={openWrongTab} variant="secondary" data-testid="wrong-tab-button">
                Open itinerary
              </Button>
              <button
                type="button"
                onClick={closeParentWindow}
                className="rounded-2xl border border-red-200 px-4 py-3 text-sm font-bold text-red-700"
                data-testid="close-parent-window-button"
              >
                Close parent
              </button>
            </div>
            <p className="mt-4 text-sm text-slate-500">All browser tabs intentionally use the same page title.</p>
          </Card>

          <Card className="p-5">
            <h2 className="font-heading text-xl font-bold text-slate-950">Frame and iframe</h2>
            <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200">
              <iframe
                title="Payment verification"
                src="/missing-payment-frame"
                className="h-44 w-full"
                data-testid="payment-iframe"
              />
            </div>
            <div className="pointer-events-none mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-3" data-testid="inaccessible-frame-wrapper">
              <iframe
                title="Nested payment frame"
                srcDoc="<html><body><iframe title='Inner payment frame' srcdoc='<button id=&quot;pay-now&quot;>Pay hotel deposit</button>'></iframe></body></html>"
                className="h-24 w-full"
                data-testid="nested-payment-iframe"
              />
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="font-heading text-xl font-bold text-slate-950">File upload and download</h2>
            <label className="mt-4 block text-sm font-semibold text-slate-700" htmlFor="travel-document-upload">
              Upload travel document
            </label>
            <input
              id="travel-document-upload"
              type="file"
              onChange={(event) => setUploadedFile(event.target.files?.[0]?.name || '')}
              className="mt-2 block w-full rounded-2xl border border-slate-200 bg-white p-3 text-sm"
              data-testid="file-upload-input"
            />
            <p className="mt-2 text-sm text-slate-500">{uploadedFile || 'No file selected'}</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                disabled
                className="rounded-2xl bg-slate-200 px-4 py-3 text-sm font-bold text-slate-400"
                data-testid="file-upload-button"
              >
                Upload
              </button>
              <a href="/downloads/missing-ticket.pdf" className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700" data-testid="broken-download-link">
                Download ticket
              </a>
              <a
                href="data:text/plain;charset=utf-8,%EF%BF%BD%EF%BF%BDcorrupted-ticket"
                download="ticket.pdf"
                className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700"
                data-testid="corrupted-download-link"
              >
                Download receipt
              </a>
            </div>
          </Card>

          <Card className="browser-compat-defect relative overflow-hidden p-5">
            <div className="absolute inset-x-0 top-20 z-10 h-14 bg-white/80" data-testid="hidden-click-blocker" />
            <h2 className="font-heading text-xl font-bold text-slate-950">Dynamic and stale elements</h2>
            <div id="duplicate-control" className="mt-4 rounded-2xl bg-slate-50 p-3" data-testid="duplicate-control">
              First duplicate ID
            </div>
            <div id="duplicate-control" className="mt-3 rounded-2xl bg-slate-50 p-3" data-testid="duplicate-control-copy">
              Second duplicate ID
            </div>
            <button
              id={dynamicId}
              type="button"
              onClick={showDelayedPopup}
              className="mt-4 rounded-2xl bg-primary-600 px-4 py-3 text-sm font-bold text-white"
              data-testid="dynamic-changing-id-button"
            >
              Dynamic button
            </button>
            <button type="button" disabled className="ml-3 rounded-2xl bg-slate-200 px-4 py-3 text-sm font-bold text-slate-400" data-testid="disabled-action-button">
              Disabled action
            </button>
            {delayedPopup ? (
              <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-700" data-testid="delayed-popup">
                Delayed popup loaded with random timing.
              </div>
            ) : null}
          </Card>
        </div>
      </div>
    </section>
  );
}

export default TestingDefectsPage;
