'use client';

import { useEffect, useRef, useState } from 'react';
import { conf } from '@/lib/config';
import { encodeBody } from '@/lib/encode';
import { useHCaptchaRender } from '@/lib/useHCaptchaRender';

declare global {
  interface Window {
    hcaptcha?: {
      render: (el: string | HTMLElement, opts?: Record<string, unknown>) => string | number;
      reset: (id?: string | number) => void;
    };
  }
}

const TITLE_OPTIONS = ['Dr.', 'Prof.', 'Mr.', 'Ms.', 'Mrs.', 'Miss'];
const PRESENTATION_TYPES = [
  'Oral Presentation',
  'Poster Presentation',
  'Young Researcher / Student Session',
  'Workshop',
  'Either Oral or Poster',
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ALLOWED_EXT = ['pdf', 'doc', 'docx', 'rtf', 'txt'];
const MAX_BYTES = 5 * 1024 * 1024;

type FieldKey =
  | 'title' | 'name' | 'email' | 'altEmail' | 'phone'
  | 'city' | 'country' | 'organization'
  | 'interestedIn' | 'abstractTitle' | 'file' | 'captcha';

export default function AbstractForm() {
  // Re-render hCaptcha on mount (handles SPA navigation).
  useHCaptchaRender();

  const [title, setTitle] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [altEmail, setAltEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [organization, setOrganization] = useState('');
  const [interestedIn, setInterestedIn] = useState('');
  const [abstractTitle, setAbstractTitle] = useState('');
  const [message, setMessage] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const [errors, setErrors] = useState<Partial<Record<FieldKey, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [globalError, setGlobalError] = useState('');
  const [success, setSuccess] = useState<{ ref: string } | null>(null);

  const captchaContainer = useRef<HTMLDivElement>(null);
  const captchaWidgetId = useRef<string | number | null>(null);
  const refs = useRef<Partial<Record<FieldKey, HTMLElement | null>>>({});
  const setRef = (key: FieldKey) => (el: HTMLElement | null) => { refs.current[key] = el; };

  useEffect(() => {
    let tries = 0;
    const t = setInterval(() => {
      if (window.hcaptcha && captchaContainer.current && captchaWidgetId.current === null) {
        try {
          captchaWidgetId.current = window.hcaptcha.render(captchaContainer.current, {
            sitekey: conf.hcaptcha_sitekey,
            theme: 'light',
          });
        } catch {/* already rendered */}
        clearInterval(t);
      }
      if (++tries > 50) clearInterval(t);
    }, 200);
    return () => clearInterval(t);
  }, []);

  /** Show error on a single field, focus + scroll into view, return false. */
  function fail(key: FieldKey, msg: string): false {
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

  function validateFile(f: File | null): string {
    if (!f) return 'Please attach your abstract file.';
    const ext = f.name.toLowerCase().split('.').pop() || '';
    if (!ALLOWED_EXT.includes(ext)) return 'Only PDF, DOC, DOCX, RTF or TXT files are accepted.';
    if (f.size > MAX_BYTES) return `File exceeds ${MAX_BYTES / 1024 / 1024}MB limit.`;
    return '';
  }

  function getCaptchaToken(): string {
    const formEl = captchaContainer.current?.closest('form');
    return formEl?.querySelector<HTMLInputElement>('[name="h-captcha-response"]')?.value || '';
  }

  function resetCaptcha() {
    try { if (captchaWidgetId.current !== null) window.hcaptcha?.reset(captchaWidgetId.current); } catch {}
  }

  /** Walk required fields top-to-bottom; first failure stops the submit. */
  function validate(): boolean {
    if (!title) return fail('title', 'Please select a title.');
    if (!name.trim()) return fail('name', 'Please enter your full name.');
    if (!email.trim()) return fail('email', 'Please enter your email address.');
    if (!EMAIL_RE.test(email)) return fail('email', 'That email address looks invalid.');
    if (altEmail && !EMAIL_RE.test(altEmail)) return fail('altEmail', 'Alternate email is invalid.');
    if (!phone.trim()) return fail('phone', 'Please enter your phone number.');
    if (!city.trim()) return fail('city', 'Please enter your city.');
    if (!country.trim()) return fail('country', 'Please enter your country.');
    if (!organization.trim()) return fail('organization', 'Please enter your organization or affiliation.');
    if (!interestedIn) return fail('interestedIn', 'Please select your preferred presentation type.');
    if (!abstractTitle.trim()) return fail('abstractTitle', 'Please enter your abstract title.');
    const fErr = validateFile(file);
    if (fErr) return fail('file', fErr);
    return true;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setGlobalError('');
    if (!validate()) return;

    const captchaToken = getCaptchaToken();
    if (!captchaToken) {
      setErrors({ captcha: 'Please complete the captcha to continue.' });
      return;
    }

    setSubmitting(true);
    try {
      // 1. Upload file → R2
      let fileUrl = '';
      try {
        const fd = new FormData();
        fd.append('file', file as File);
        fd.append('project', 'cardiology');
        const up = await fetch('/api/upload', { method: 'POST', body: fd });
        const upJson = await up.json();
        if (up.ok && upJson.success) {
          fileUrl = upJson.fileUrl;
        } else if (up.status === 503) {
          fileUrl = '(upload not configured — reviewer will request via email)';
        } else {
          throw new Error(upJson.error || 'Upload failed');
        }
      } catch (e) {
        setGlobalError(`File upload failed: ${e instanceof Error ? e.message : 'unknown error'}`);
        setSubmitting(false);
        return;
      }

      // 2. Submit metadata (fields base64-encoded; captcha + file URL plain)
      const r = await fetch('/api/abstract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(encodeBody({
          title, name, email, alt_email: altEmail, phone, whatsapp,
          city, country, organization,
          interested_in: interestedIn,
          abstract_title: abstractTitle, message,
          upload_abstract_file: fileUrl,
          captchaToken,
        })),
      });
      const data = await r.json();
      if (!r.ok || !data.success) throw new Error(data.error || 'Submission failed');

      setSuccess({ ref: data.ref });
      setTitle(''); setName(''); setEmail(''); setAltEmail(''); setPhone(''); setWhatsapp('');
      setCity(''); setCountry(''); setOrganization(''); setInterestedIn('');
      setAbstractTitle(''); setMessage(''); setFile(null);
      setErrors({});
      resetCaptcha();
    } catch (e) {
      setGlobalError(e instanceof Error ? e.message : 'Something went wrong');
      resetCaptcha();
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="form-success" style={{ padding: 32, textAlign: 'center' }}>
        <i className="fas fa-check-circle" style={{ fontSize: 48, color: '#1f9a5b', marginBottom: 12 }} />
        <h3>Thank you — your abstract was received.</h3>
        <p>Reference: <strong>{success.ref}</strong></p>
        <p style={{ color: 'var(--muted)' }}>
          A confirmation has been emailed. Our scientific committee will review your submission and
          notify you by January 15, 2027.
        </p>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => setSuccess(null)}
          style={{ marginTop: 12 }}
        >
          Submit another abstract
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      <fieldset disabled={submitting} className="form-fieldset">

      <div className="form-row">
        <div className="form-group" style={{ flex: '0 0 140px' }}>
          <label>Title <span className="req">*</span></label>
          <select
            ref={setRef('title') as React.Ref<HTMLSelectElement>}
            value={title}
            onChange={(e) => { setTitle(e.target.value); clearFieldError('title'); }}
            aria-invalid={!!errors.title}
            className={errors.title ? 'is-invalid' : undefined}
          >
            <option value="">Select</option>
            {TITLE_OPTIONS.map((t) => <option key={t}>{t}</option>)}
          </select>
          <FieldError msg={errors.title} />
        </div>
        <div className="form-group">
          <label>Full Name <span className="req">*</span></label>
          <input
            ref={setRef('name') as React.Ref<HTMLInputElement>}
            value={name}
            onChange={(e) => { setName(e.target.value); clearFieldError('name'); }}
            type="text"
            aria-invalid={!!errors.name}
            className={errors.name ? 'is-invalid' : undefined}
          />
          <FieldError msg={errors.name} />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Email <span className="req">*</span></label>
          <input
            ref={setRef('email') as React.Ref<HTMLInputElement>}
            value={email}
            onChange={(e) => { setEmail(e.target.value); clearFieldError('email'); }}
            type="email"
            aria-invalid={!!errors.email}
            className={errors.email ? 'is-invalid' : undefined}
          />
          <FieldError msg={errors.email} />
        </div>
        <div className="form-group">
          <label>Alternate Email</label>
          <input
            ref={setRef('altEmail') as React.Ref<HTMLInputElement>}
            value={altEmail}
            onChange={(e) => { setAltEmail(e.target.value); clearFieldError('altEmail'); }}
            type="email"
            aria-invalid={!!errors.altEmail}
            className={errors.altEmail ? 'is-invalid' : undefined}
          />
          <FieldError msg={errors.altEmail} />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Phone <span className="req">*</span></label>
          <input
            ref={setRef('phone') as React.Ref<HTMLInputElement>}
            value={phone}
            onChange={(e) => { setPhone(e.target.value); clearFieldError('phone'); }}
            type="tel"
            aria-invalid={!!errors.phone}
            className={errors.phone ? 'is-invalid' : undefined}
          />
          <FieldError msg={errors.phone} />
        </div>
        <div className="form-group">
          <label>WhatsApp</label>
          <input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} type="tel" />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>City <span className="req">*</span></label>
          <input
            ref={setRef('city') as React.Ref<HTMLInputElement>}
            value={city}
            onChange={(e) => { setCity(e.target.value); clearFieldError('city'); }}
            type="text"
            aria-invalid={!!errors.city}
            className={errors.city ? 'is-invalid' : undefined}
          />
          <FieldError msg={errors.city} />
        </div>
        <div className="form-group">
          <label>Country <span className="req">*</span></label>
          <input
            ref={setRef('country') as React.Ref<HTMLInputElement>}
            value={country}
            onChange={(e) => { setCountry(e.target.value); clearFieldError('country'); }}
            type="text"
            aria-invalid={!!errors.country}
            className={errors.country ? 'is-invalid' : undefined}
          />
          <FieldError msg={errors.country} />
        </div>
      </div>

      <div className="form-group">
        <label>Organization / Affiliation <span className="req">*</span></label>
        <input
          ref={setRef('organization') as React.Ref<HTMLInputElement>}
          value={organization}
          onChange={(e) => { setOrganization(e.target.value); clearFieldError('organization'); }}
          type="text"
          aria-invalid={!!errors.organization}
          className={errors.organization ? 'is-invalid' : undefined}
        />
        <FieldError msg={errors.organization} />
      </div>

      <div className="form-group">
        <label>Interested In <span className="req">*</span></label>
        <select
          ref={setRef('interestedIn') as React.Ref<HTMLSelectElement>}
          value={interestedIn}
          onChange={(e) => { setInterestedIn(e.target.value); clearFieldError('interestedIn'); }}
          aria-invalid={!!errors.interestedIn}
          className={errors.interestedIn ? 'is-invalid' : undefined}
        >
          <option value="">— Select —</option>
          {PRESENTATION_TYPES.map((t) => <option key={t}>{t}</option>)}
        </select>
        <FieldError msg={errors.interestedIn} />
      </div>

      <div className="form-group">
        <label>Abstract Title <span className="req">*</span></label>
        <input
          ref={setRef('abstractTitle') as React.Ref<HTMLInputElement>}
          value={abstractTitle}
          onChange={(e) => { setAbstractTitle(e.target.value); clearFieldError('abstractTitle'); }}
          type="text"
          aria-invalid={!!errors.abstractTitle}
          className={errors.abstractTitle ? 'is-invalid' : undefined}
        />
        <FieldError msg={errors.abstractTitle} />
      </div>

      <div className="form-group">
        <label>Message / Cover note</label>
        <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={3} placeholder="Anything specific the scientific committee should know?" />
      </div>

      <div className="form-group">
        <label>
          Abstract File <span className="req">*</span>{' '}
          <small style={{ fontWeight: 400, color: 'var(--muted)' }}>(PDF, DOC, DOCX, RTF, TXT — max 5MB)</small>
        </label>
        <input
          ref={setRef('file') as React.Ref<HTMLInputElement>}
          type="file"
          accept=".pdf,.doc,.docx,.rtf,.txt"
          onChange={(e) => {
            const f = e.target.files?.[0] || null;
            setFile(f);
            const err = validateFile(f);
            if (err) setErrors(prev => ({ ...prev, file: err }));
            else clearFieldError('file');
          }}
          aria-invalid={!!errors.file}
          className={errors.file ? 'is-invalid' : undefined}
        />
        <FieldError msg={errors.file} />
      </div>

      <div className="form-captcha">
        <div ref={captchaContainer} />
        <FieldError msg={errors.captcha} />
      </div>

      {globalError && (
        <div role="alert" className="form-global-error">
          <i className="fas fa-exclamation-circle" /> {globalError}
        </div>
      )}

      <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
        {submitting
          ? <><i className="fas fa-spinner fa-spin" /> Submitting…</>
          : <>Submit Abstract <i className="fas fa-arrow-right" /></>
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
