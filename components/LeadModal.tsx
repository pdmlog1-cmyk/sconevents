'use client';

import { usePathname } from 'next/navigation';
/* Auto-popup that captures a lead and gives the visitor the brochure PDF.
   Mirrors BrochureModal's form + API contract (/api/brochure with
   modalType=brochure) but appears automatically on page load instead of
   being click-triggered. */
import { useEffect, useRef, useState } from 'react';
import { conf } from '@/lib/config';
import { useHCaptchaRender } from '@/lib/useHCaptchaRender';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const STORAGE_KEY = 'addiction_lead_shown';
const OPEN_AFTER_MS = 5000;

type FieldKey = 'first_name' | 'email' | 'phone' | 'country' | 'captcha';

export default function LeadModal() {
  const pathname = usePathname();
  // Campaign landing page renders its own LandingLeadModal — skip the global one.
  if (pathname?.startsWith('/landing')) return null;

  const [open, setOpen] = useState(false);

  // Render hCaptcha when modal opens (captcha div only exists then).
  useHCaptchaRender(open);

  const [submitting, setSubmitting] = useState(false);
  const [globalError, setGlobalError] = useState('');
  const [errors, setErrors] = useState<Partial<Record<FieldKey, string>>>({});
  const [success, setSuccess] = useState<{ ref: string; downloadUrl: string } | null>(null);

  const formRef = useRef<HTMLFormElement>(null);
  const refs = useRef<Partial<Record<FieldKey, HTMLElement | null>>>({});
  const setRef = (key: FieldKey) => (el: HTMLElement | null) => { refs.current[key] = el; };

  // Auto-open once per session (skip if already shown).
  useEffect(() => {
    try {
      if (sessionStorage.getItem(STORAGE_KEY)) return;
    } catch { /* sessionStorage may be blocked */ }
    const t = setTimeout(() => setOpen(true), OPEN_AFTER_MS);
    return () => clearTimeout(t);
  }, []);

  // ESC + body-scroll lock when open.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && open) close(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open]);

  function close() {
    setOpen(false);
    try { sessionStorage.setItem(STORAGE_KEY, '1'); } catch {}
  }

  function fail(key: FieldKey, msg: string) {
    setErrors({ [key]: msg });
    setGlobalError('');
    const el = refs.current[key];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => { try { (el as HTMLElement).focus({ preventScroll: true }); } catch {} }, 100);
    }
    return false;
  }

  function clearFieldError(key: FieldKey) {
    setErrors(prev => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  function getCaptchaToken(): string {
    return formRef.current?.querySelector<HTMLInputElement>('[name="h-captcha-response"]')?.value || '';
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setGlobalError('');

    const fd = new FormData(e.currentTarget);
    const first_name = String(fd.get('first_name') || '').trim();
    const email = String(fd.get('email') || '').trim();
    const phone = String(fd.get('phone') || '').trim();
    const country = String(fd.get('country') || '').trim();
    const interested_in = String(fd.get('interested_in') || '').trim();
    const message = String(fd.get('message') || '').trim();

    if (!first_name) return fail('first_name', 'Please enter your name.');
    if (!email) return fail('email', 'Please enter your email address.');
    if (!EMAIL_RE.test(email)) return fail('email', 'That email address looks invalid.');
    if (!phone) return fail('phone', 'Please enter your phone number.');
    if (!country) return fail('country', 'Please enter your country.');

    const captchaToken = getCaptchaToken();
    if (!captchaToken) return fail('captcha', 'Please complete the captcha to continue.');

    setSubmitting(true);
    try {
      const r = await fetch('/api/brochure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name, email, phone, country, interested_in, message,
          modalType: 'brochure',
          captchaToken,
        }),
      });
      const data = await r.json();
      if (!r.ok || !data.success) throw new Error(data.error || 'Submission failed');

      setSuccess({ ref: data.ref, downloadUrl: data.downloadUrl });

      // Trigger the actual download
      try {
        const a = document.createElement('a');
        a.href = data.downloadUrl;
        a.download = '';
        a.rel = 'noopener';
        document.body.appendChild(a);
        a.click();
        a.remove();
      } catch { /* user can still use the manual link */ }
    } catch (e) {
      setGlobalError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className={`lead-modal${open ? ' open' : ''}${success ? ' sent' : ''}`}
      role="dialog"
      aria-hidden={!open}
    >
      <div className="lead-modal-backdrop" onClick={close} />
      <div className="lead-modal-box">
        <button className="lead-modal-close" type="button" onClick={close} aria-label="Close">
          <i className="fas fa-times" />
        </button>
        <div className="lead-modal-head">
          <span className="lead-modal-eyebrow"><span className="pulse" /> {conf.short}</span>
          <h3>Download the conference brochure</h3>
          <p>Tell us a little about yourself and we&apos;ll send the brochure straight to your inbox — and unlock the download instantly.</p>
        </div>

        {success ? (
          <div style={{ padding: '4px 0 16px', textAlign: 'center' }}>
            <i className="fas fa-check-circle" style={{ fontSize: 40, color: '#1f9a5b', marginBottom: 10 }} />
            <h4>Your download is ready.</h4>
            <p style={{ color: 'var(--muted)', fontSize: 13 }}>
              Reference: <strong>{success.ref}</strong>
            </p>
            <p style={{ color: 'var(--muted)', fontSize: 13 }}>
              If the download didn&apos;t start automatically:
            </p>
            <a href={success.downloadUrl} className="btn btn-primary" download style={{ marginTop: 6 }}>
              <i className="fas fa-file-arrow-down" /> Download manually
            </a>
            <p className="lead-modal-note" style={{ marginTop: 16 }}>
              We&apos;ve also emailed a copy to your inbox.
            </p>
          </div>
        ) : (
          <form ref={formRef} className="lead-form" onSubmit={onSubmit} noValidate>
            <fieldset disabled={submitting} className="form-fieldset">
            <div className="form-row">
              <div className="form-group">
                <label>Name <span className="req">*</span></label>
                <input
                  ref={setRef('first_name') as React.Ref<HTMLInputElement>}
                  type="text" name="first_name"
                  onChange={() => clearFieldError('first_name')}
                  aria-invalid={!!errors.first_name}
                  className={errors.first_name ? 'is-invalid' : undefined}
                />
                <FieldError msg={errors.first_name} />
              </div>
              <div className="form-group">
                <label>Email <span className="req">*</span></label>
                <input
                  ref={setRef('email') as React.Ref<HTMLInputElement>}
                  type="email" name="email"
                  onChange={() => clearFieldError('email')}
                  aria-invalid={!!errors.email}
                  className={errors.email ? 'is-invalid' : undefined}
                />
                <FieldError msg={errors.email} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Phone <span className="req">*</span></label>
                <input
                  ref={setRef('phone') as React.Ref<HTMLInputElement>}
                  type="tel" name="phone"
                  onChange={() => clearFieldError('phone')}
                  aria-invalid={!!errors.phone}
                  className={errors.phone ? 'is-invalid' : undefined}
                />
                <FieldError msg={errors.phone} />
              </div>
              <div className="form-group">
                <label>Country <span className="req">*</span></label>
                <input
                  ref={setRef('country') as React.Ref<HTMLInputElement>}
                  type="text" name="country"
                  onChange={() => clearFieldError('country')}
                  aria-invalid={!!errors.country}
                  className={errors.country ? 'is-invalid' : undefined}
                />
                <FieldError msg={errors.country} />
              </div>
            </div>
            <div className="form-group">
              <label>Interested in</label>
              <select name="interested_in" defaultValue="">
                <option value="">— Select —</option>
                <option>Oral Presentation</option>
                <option>Poster Presentation</option>
                <option>Delegate / Listener</option>
                <option>Sponsorship / Exhibition</option>
                <option>Media Partnership</option>
                <option>Other</option>
              </select>
            </div>
            <div className="form-group">
              <label>Message</label>
              <textarea name="message" rows={3} placeholder="Anything we should know?" />
            </div>
            <div className="form-captcha">
              <div className="h-captcha" data-sitekey={conf.hcaptcha_sitekey} data-theme="light" data-size="compact" />
              <FieldError msg={errors.captcha} />
            </div>
            {globalError && (
              <div role="alert" className="form-global-error">
                <i className="fas fa-exclamation-circle" /> {globalError}
              </div>
            )}
            <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
              {submitting
                ? <><i className="fas fa-spinner fa-spin" /> Sending…</>
                : <>Send &amp; Download Brochure <i className="fas fa-arrow-right" /></>
              }
            </button>
            <p className="lead-modal-note">
              We respect your inbox — no spam. See <a href="/privacy-policy">Privacy Policy</a>.
            </p>
            </fieldset>
          </form>
        )}
      </div>
    </div>
  );
}

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return (
    <small className="field-error" role="alert">
      <i className="fas fa-exclamation-circle" /> {msg}
    </small>
  );
}
