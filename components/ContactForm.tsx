'use client';

import { useRef, useState } from 'react';
import { conf } from '@/lib/config';
import { useHCaptchaRender } from '@/lib/useHCaptchaRender';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type FieldKey = 'name' | 'email' | 'query' | 'captcha';

export default function ContactForm() {
  // Re-render hCaptcha on mount (handles SPA navigation).
  useHCaptchaRender();

  const [submitting, setSubmitting] = useState(false);
  const [globalError, setGlobalError] = useState('');
  const [errors, setErrors] = useState<Partial<Record<FieldKey, string>>>({});
  const [success, setSuccess] = useState<{ ref: string } | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const refs = useRef<Partial<Record<FieldKey, HTMLElement | null>>>({});
  const setRef = (key: FieldKey) => (el: HTMLElement | null) => { refs.current[key] = el; };

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
    const name = String(fd.get('name') || '').trim();
    const email = String(fd.get('email') || '').trim();
    const phone = String(fd.get('phone') || '').trim();
    const country = String(fd.get('country') || '').trim();
    const interest = String(fd.get('interest') || '').trim();
    const query = String(fd.get('query') || '').trim();

    if (!name) return fail('name', 'Please enter your name.');
    if (!email) return fail('email', 'Please enter your email address.');
    if (!EMAIL_RE.test(email)) return fail('email', 'That email address looks invalid.');
    if (!query) return fail('query', 'Please tell us how we can help.');

    const captchaToken = getCaptchaToken();
    if (!captchaToken) return fail('captcha', 'Please complete the captcha to continue.');

    setSubmitting(true);
    try {
      const r = await fetch('/api/enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name, email, phone, country, interest, query,
          source: 'contact-page',
          captchaToken,
        }),
      });
      const data = await r.json();
      if (!r.ok || !data.success) throw new Error(data.error || 'Submission failed');
      setSuccess({ ref: data.ref });
      setErrors({});
      formRef.current?.reset();
    } catch (e) {
      setGlobalError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="form-success" style={{ padding: 32, textAlign: 'center' }}>
        <i className="fas fa-check-circle" style={{ fontSize: 48, color: '#1f9a5b', marginBottom: 12 }} />
        <h3>Message received.</h3>
        <p style={{ color: 'var(--muted)' }}>Reference: <strong>{success.ref}</strong></p>
        <p style={{ color: 'var(--muted)' }}>
          Our team will respond within 24 hours. A copy has been emailed to you.
        </p>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => setSuccess(null)}
          style={{ marginTop: 12 }}
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate>
      <fieldset disabled={submitting} className="form-fieldset">
      <div className="form-row">
        <div className="form-group">
          <label>Name <span className="req">*</span></label>
          <input
            ref={setRef('name') as React.Ref<HTMLInputElement>}
            name="name"
            type="text"
            onChange={() => clearFieldError('name')}
            aria-invalid={!!errors.name}
            className={errors.name ? 'is-invalid' : undefined}
          />
          <FieldError msg={errors.name} />
        </div>
        <div className="form-group">
          <label>Email <span className="req">*</span></label>
          <input
            ref={setRef('email') as React.Ref<HTMLInputElement>}
            name="email"
            type="email"
            onChange={() => clearFieldError('email')}
            aria-invalid={!!errors.email}
            className={errors.email ? 'is-invalid' : undefined}
          />
          <FieldError msg={errors.email} />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group"><label>Phone</label><input name="phone" type="tel" /></div>
        <div className="form-group"><label>Country</label><input name="country" type="text" /></div>
      </div>
      <div className="form-group">
        <label>I&apos;m interested in</label>
        <select name="interest" defaultValue="">
          <option value="">— Select —</option>
          <option>Registration / Attending</option>
          <option>Abstract Submission</option>
          <option>Sponsorship / Exhibition</option>
          <option>Media Partnership</option>
          <option>Group Booking</option>
          <option>Visa / Invitation Letter</option>
          <option>General enquiry</option>
        </select>
      </div>
      <div className="form-group">
        <label>Query <span className="req">*</span></label>
        <textarea
          ref={setRef('query') as React.Ref<HTMLTextAreaElement>}
          name="query"
          rows={5}
          placeholder="How can we help?"
          onChange={() => clearFieldError('query')}
          aria-invalid={!!errors.query}
          className={errors.query ? 'is-invalid' : undefined}
        />
        <FieldError msg={errors.query} />
      </div>
      <div className="form-captcha">
        <div className="h-captcha" data-sitekey={conf.hcaptcha_sitekey} data-theme="light" />
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
          : <>Send Message <i className="fas fa-arrow-right" /></>
        }
      </button>
      </fieldset>
    </form>
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
