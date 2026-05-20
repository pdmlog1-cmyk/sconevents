'use client';

import { useRef, useState } from 'react';
import { conf } from '@/lib/config';
import { useHCaptchaRender } from '@/lib/useHCaptchaRender';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type FieldKey = 'name' | 'company' | 'email' | 'captcha';

export default function SponsorEnquiryForm() {
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
    const company = String(fd.get('company') || '').trim();
    const email = String(fd.get('email') || '').trim();
    const phone = String(fd.get('phone') || '').trim();
    const pkg = String(fd.get('package') || '').trim();
    const objectives = String(fd.get('objectives') || '').trim();

    if (!name) return fail('name', 'Please enter your name.');
    if (!company) return fail('company', 'Please enter your company name.');
    if (!email) return fail('email', 'Please enter your email address.');
    if (!EMAIL_RE.test(email)) return fail('email', 'That email address looks invalid.');

    const captchaToken = getCaptchaToken();
    if (!captchaToken) return fail('captcha', 'Please complete the captcha to continue.');

    setSubmitting(true);
    try {
      const r = await fetch('/api/enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name, email, phone, organization: company,
          interest: pkg || 'Sponsorship enquiry',
          query: objectives,
          source: 'sponsor',
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
      <div className="form-success" style={{ padding: 24, textAlign: 'center' }}>
        <i className="fas fa-check-circle" style={{ fontSize: 40, color: '#1f9a5b', marginBottom: 10 }} />
        <h4>Thank you — your enquiry was received.</h4>
        <p style={{ color: 'var(--muted)' }}>Reference: <strong>{success.ref}</strong></p>
        <p style={{ color: 'var(--muted)' }}>Our partnerships team will be in touch within 24 hours.</p>
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
          <label>Company <span className="req">*</span></label>
          <input
            ref={setRef('company') as React.Ref<HTMLInputElement>}
            name="company"
            type="text"
            onChange={() => clearFieldError('company')}
            aria-invalid={!!errors.company}
            className={errors.company ? 'is-invalid' : undefined}
          />
          <FieldError msg={errors.company} />
        </div>
      </div>
      <div className="form-row">
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
        <div className="form-group">
          <label>Phone</label>
          <input name="phone" type="tel" />
        </div>
      </div>
      <div className="form-group">
        <label>Package of Interest</label>
        <select name="package" defaultValue="">
          <option value="">— Select —</option>
          <option>Silver Sponsor</option>
          <option>Gold Sponsor</option>
          <option>Platinum Sponsor</option>
          <option>Exhibition only</option>
          <option>Media partner</option>
          <option>Custom proposal</option>
        </select>
      </div>
      <div className="form-group">
        <label>Your objectives</label>
        <textarea name="objectives" rows={4} placeholder="E.g. launch a new product, recruit graduates, build academic partnerships…" />
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
          : <>Send enquiry <i className="fas fa-arrow-right" /></>
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
