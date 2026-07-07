'use client';

import { useMemo, useRef, useState } from 'react';
import { conf, registrationData } from '@/lib/config';
import { generateWebToken } from '@/lib/token';
import { useHCaptchaRender } from '@/lib/useHCaptchaRender';
import RegistrationStepper from '@/components/RegistrationStepper';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[+\d][\d\s\-()]{6,}$/;

const COUNTRIES = [
  'Afghanistan','Albania','Algeria','Argentina','Armenia','Australia','Austria','Azerbaijan',
  'Bahrain','Bangladesh','Belarus','Belgium','Bolivia','Bosnia and Herzegovina','Brazil','Bulgaria',
  'Cambodia','Cameroon','Canada','Chile','China','Colombia','Costa Rica','Croatia','Cyprus','Czech Republic',
  'Denmark','Dominican Republic','Ecuador','Egypt','Estonia','Ethiopia','Finland','France',
  'Georgia','Germany','Ghana','Greece','Guatemala','Honduras','Hong Kong','Hungary',
  'Iceland','India','Indonesia','Iran','Iraq','Ireland','Israel','Italy',
  'Japan','Jordan','Kazakhstan','Kenya','Kuwait','Kyrgyzstan','Latvia','Lebanon','Libya','Lithuania','Luxembourg',
  'Malaysia','Malta','Mexico','Moldova','Mongolia','Morocco','Myanmar','Nepal','Netherlands','New Zealand','Nigeria','Norway',
  'Oman','Pakistan','Panama','Peru','Philippines','Poland','Portugal','Qatar','Romania','Russia','Rwanda',
  'Saudi Arabia','Senegal','Serbia','Singapore','Slovakia','Slovenia','South Africa','South Korea','Spain','Sri Lanka','Sudan','Sweden','Switzerland','Syria',
  'Taiwan','Tanzania','Thailand','Tunisia','Turkey','Uganda','Ukraine','United Arab Emirates','United Kingdom','United States','Uruguay','Uzbekistan','Venezuela','Vietnam','Yemen','Zambia','Zimbabwe',
];

type AttendanceId = string;
type CategoryId = string;

const cfg = registrationData.form;
const ACCOMMODATION = cfg.accommodation;

export default function RegisterForm() {
  const [activeTab, setActiveTab] = useState<AttendanceId>(cfg.tabs[0].id);

  // Personal
  const [title, setTitle] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [altEmail, setAltEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [organization, setOrganization] = useState('');
  const [country, setCountry] = useState('');

  // Selection — default to the active tab's first category (Presenter).
  const [category, setCategory] = useState<CategoryId>(cfg.tabs[0].categories[0].id);
  const [accommodation, setAccommodation] = useState<'' | 'single' | 'double'>('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [participants, setParticipants] = useState(1);
  const [accompanying, setAccompanying] = useState(0);

  // Submit
  type FieldKey =
    | 'title' | 'name' | 'email' | 'altEmail' | 'phone' | 'whatsapp'
    | 'organization' | 'country'
    | 'category' | 'checkIn' | 'checkOut' | 'captcha';

  const [submitting, setSubmitting] = useState(false);
  const [globalError, setGlobalError] = useState('');
  const [errors, setErrors] = useState<Partial<Record<FieldKey, string>>>({});
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

  const switchTab = (tabId: AttendanceId) => {
    setActiveTab(tabId);
    // Pre-select the new tab's first category (Presenter) so the user
    // always has something selected — matches the default-on-load behavior.
    const nextTab = cfg.tabs.find(t => t.id === tabId) ?? cfg.tabs[0];
    setCategory(nextTab.categories[0]?.id ?? '');
    clearFieldError('category');
    if (tabId !== 'inperson') {
      setAccommodation('');
      setCheckIn('');
      setCheckOut('');
      setAccompanying(0);
    }
  };

  /* ---- pricing math ---- */
  const activeTabCfg = useMemo(
    () => cfg.tabs.find(t => t.id === activeTab) ?? cfg.tabs[0],
    [activeTab],
  );
  const selectedCategory = useMemo(
    () => activeTabCfg.categories.find(c => c.id === category),
    [activeTabCfg, category],
  );

  const regUnitPrice = selectedCategory?.total ?? 0;
  const regSubtotal = regUnitPrice * participants;

  const nights = useMemo(() => {
    if (!accommodation || !checkIn || !checkOut) return 0;
    const inDate = new Date(checkIn);
    const outDate = new Date(checkOut);
    if (isNaN(inDate.getTime()) || isNaN(outDate.getTime())) return 0;
    const ms = outDate.getTime() - inDate.getTime();
    const days = Math.round(ms / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  }, [accommodation, checkIn, checkOut]);

  const accommodationPricePerNight = accommodation
    ? (ACCOMMODATION as Record<string, number>)[accommodation] ?? 0
    : 0;
  const accommodationTotal = accommodationPricePerNight * nights;
  const accompanyingTotal = accompanying * (ACCOMMODATION.accompanying_per_person ?? 0);
  const totalPrice = regSubtotal + accommodationTotal + accompanyingTotal;

  /* ---- captcha + submit ---- */
  // Re-render hCaptcha on every mount (handles client-side navigation).
  useHCaptchaRender();

  const getCaptchaToken = () =>
    formRef.current?.querySelector<HTMLInputElement>('[name="h-captcha-response"]')?.value || '';

  function reset() {
    setTitle(''); setName(''); setEmail(''); setAltEmail('');
    setPhone(''); setWhatsapp(''); setOrganization(''); setCountry('');
    // Reset to the default Presenter category for the active tab.
    setCategory(activeTabCfg.categories[0]?.id ?? '');
    setAccommodation(''); setCheckIn(''); setCheckOut('');
    setParticipants(1); setAccompanying(0);
    setErrors({}); setGlobalError('');
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setGlobalError('');

    // Trim once — every check below uses the trimmed values, and the
    // payload sent to the API is the same trimmed data.
    const tName = name.trim();
    const tEmail = email.trim();
    const tAltEmail = altEmail.trim();
    const tPhone = phone.trim();
    const tWhatsapp = whatsapp.trim();
    const tOrganization = organization.trim();

    if (!title) return fail('title', 'Please select a title.');
    if (!tName) return fail('name', 'Please enter your name.');
    if (!tEmail) return fail('email', 'Please enter your email address.');
    if (!EMAIL_RE.test(tEmail)) return fail('email', 'That email address looks invalid.');
    if (tAltEmail && !EMAIL_RE.test(tAltEmail)) return fail('altEmail', 'Alternative email is invalid.');
    if (!tPhone) return fail('phone', 'Please enter your phone number.');
    if (!PHONE_RE.test(tPhone)) return fail('phone', 'Phone number looks invalid.');
    if (tWhatsapp && !PHONE_RE.test(tWhatsapp)) return fail('whatsapp', 'WhatsApp number looks invalid.');
    if (!tOrganization) return fail('organization', 'Please enter your institution.');
    if (!country) return fail('country', 'Please select your country.');
    if (!category) return fail('category', 'Please select a registration type.');
    if (accommodation && !checkIn) return fail('checkIn', 'Please choose a check-in date.');
    if (accommodation && !checkOut) return fail('checkOut', 'Please choose a check-out date.');
    if (accommodation && nights <= 0) return fail('checkOut', 'Check-out must be after check-in.');
    const captchaToken = getCaptchaToken();
    if (!captchaToken) return fail('captcha', 'Please complete the captcha to continue.');

    setSubmitting(true);

    // Generate the unique date/time-based token client-side. Format:
    // WCAB-YYYYMMDD-HHmmss-XXXXXX. SAME token threads through every stage:
    //   - /api/register → CMS or=1
    //   - /api/save-register-user → R2 registration record
    //   - /payment-gateway URL
    //   - /api/paypal/create-order custom_id
    //   - /api/paypal/capture-order
    //   - /api/save-payment-user → CMS or_payment=1 + R2 payment record
    //   - /payment-success URL ref
    const webToken = generateWebToken('WCAB');
    // eslint-disable-next-line no-console
    console.log(`[client:register] generated web_token=${webToken}`);

    // Build the canonical registration payload once — used both for the
    // CMS submission and the R2 mirror so the two stay in sync.
    const regPayload = {
      web_token: webToken,
      title,
      name: tName,
      email: tEmail,
      alt_email: tAltEmail,
      phone: tPhone,
      whatsapp: tWhatsapp,
      organization: tOrganization,
      country,
      attendance: activeTab,
      attendance_label: activeTabCfg.label,
      category,
      category_label: selectedCategory?.label ?? '',
      unit_price: regUnitPrice,
      reg_subtotal: regSubtotal,
      accommodation: accommodation || 'none',
      accommodation_price_per_night: accommodationPricePerNight,
      accommodation_total: accommodationTotal,
      checkin_date: checkIn,
      checkout_date: checkOut,
      nights,
      no_participants: participants,
      no_accompanying: accompanying,
      accompanying_total: accompanyingTotal,
      total_price: totalPrice,
      currency: 'USD',
      phase: 'early',
      notes: '',
    };

    try {
      // 1. Submit to CMS via our existing /api/register route. This also
      //    forwards to api.sconcms.com with the or=1 contract.
      const r = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...regPayload,
          // /api/register expects these legacy field names:
          accommodation: accommodation || 'none',
          hotel_price: accommodationTotal,
          captchaToken,
        }),
      });
      const data = await r.json();
      if (!r.ok || !data.success) throw new Error(data.error || 'Submission failed');

      // 2. Save mirror to R2 (best-effort — payments still work without it,
      //    but the review page falls back to URL params if R2 misses).
      try {
        await fetch('/api/save-register-user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(regPayload),
        });
      } catch {
        /* swallow — R2 outage shouldn't block payment */
      }

      // 3. Redirect to the review page with just the token. The page loads
      //    the full record from R2, so URL is short and tamper-proof.
      window.location.href = `/payment-gateway?web_token=${encodeURIComponent(webToken)}`;
    } catch (e) {
      setGlobalError(e instanceof Error ? e.message : 'Something went wrong');
      setSubmitting(false);
    }
  }

  /* ────────────────────────────────────────────────────────────── */

  return (
    <section className="rx-section">
      <div className="container">

        {/* ═════════════ Stepper banner ═════════════ */}
        <header className="rx-banner">
          <RegistrationStepper current="register" />
        </header>

        <form
          ref={formRef}
          onSubmit={onSubmit}
          noValidate
          autoComplete="off"
        >
          {/* While submitting, the entire form goes disabled — prevents
              double-clicks, edits mid-submit, and tab/keystroke escape. */}
          <fieldset disabled={submitting} className="form-fieldset rx-grid">

          {/* ═══════════════════════ LEFT: form ═══════════════════════ */}
          <div className="rx-main">

            {/* ── Section 1: Personal ── */}
            <section className="rx-section-block">
              <div className="rx-section-head">
                <p className="rx-section-label">01 — Personal Information</p>
                <p className="rx-section-help">We&apos;ll send all confirmations to this contact.</p>
              </div>

              <div className="rx-fields">
                <div className="rx-row" style={{ gridTemplateColumns: '160px 1fr' }}>
                  <Field label={<>Title <span className="req">*</span></>} error={errors.title}>
                    <select
                      ref={setRef('title') as React.Ref<HTMLSelectElement>}
                      value={title}
                      onChange={(e) => { setTitle(e.target.value); clearFieldError('title'); }}
                      aria-invalid={!!errors.title}
                      autoComplete="off"
                      className={errors.title ? 'is-invalid' : undefined}
                    >
                      <option value="">Select</option>
                      {cfg.title_options.map(t => <option key={t}>{t}</option>)}
                    </select>
                  </Field>
                  <Field label={<>Full Name <span className="req">*</span></>} error={errors.name}>
                    <input
                      ref={setRef('name') as React.Ref<HTMLInputElement>}
                      value={name}
                      onChange={(e) => { setName(e.target.value); clearFieldError('name'); }}
                      type="text"
                      aria-invalid={!!errors.name}
                      autoComplete="off"
                      className={errors.name ? 'is-invalid' : undefined}
                    />
                  </Field>
                </div>

                <div className="rx-row">
                  <Field label={<>Email <span className="req">*</span></>} error={errors.email}>
                    <input
                      ref={setRef('email') as React.Ref<HTMLInputElement>}
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); clearFieldError('email'); }}
                      type="email"
                      aria-invalid={!!errors.email}
                      autoComplete="off"
                      className={errors.email ? 'is-invalid' : undefined}
                    />
                  </Field>
                  <Field label="Alternative Email" error={errors.altEmail}>
                    <input
                      ref={setRef('altEmail') as React.Ref<HTMLInputElement>}
                      value={altEmail}
                      onChange={(e) => { setAltEmail(e.target.value); clearFieldError('altEmail'); }}
                      type="email"
                      aria-invalid={!!errors.altEmail}
                      autoComplete="off"
                      className={errors.altEmail ? 'is-invalid' : undefined}
                    />
                  </Field>
                </div>

                <div className="rx-row">
                  <Field label={<>Phone <span className="req">*</span></>} error={errors.phone}>
                    <input
                      ref={setRef('phone') as React.Ref<HTMLInputElement>}
                      value={phone}
                      onChange={(e) => { setPhone(e.target.value); clearFieldError('phone'); }}
                      type="tel"
                      aria-invalid={!!errors.phone}
                      autoComplete="off"
                      className={errors.phone ? 'is-invalid' : undefined}
                    />
                  </Field>
                  <Field label="WhatsApp Number" error={errors.whatsapp}>
                    <input
                      ref={setRef('whatsapp') as React.Ref<HTMLInputElement>}
                      value={whatsapp}
                      onChange={(e) => { setWhatsapp(e.target.value); clearFieldError('whatsapp'); }}
                      type="tel"
                      aria-invalid={!!errors.whatsapp}
                      autoComplete="off"
                      className={errors.whatsapp ? 'is-invalid' : undefined}
                    />
                  </Field>
                </div>

                <div className="rx-row">
                  <Field label={<>Institution <span className="req">*</span></>} error={errors.organization}>
                    <input
                      ref={setRef('organization') as React.Ref<HTMLInputElement>}
                      value={organization}
                      onChange={(e) => { setOrganization(e.target.value); clearFieldError('organization'); }}
                      type="text"
                      aria-invalid={!!errors.organization}
                      autoComplete="off"
                      className={errors.organization ? 'is-invalid' : undefined}
                    />
                  </Field>
                  <Field label={<>Country <span className="req">*</span></>} error={errors.country}>
                    <select
                      ref={setRef('country') as React.Ref<HTMLSelectElement>}
                      value={country}
                      onChange={(e) => { setCountry(e.target.value); clearFieldError('country'); }}
                      aria-invalid={!!errors.country}
                      autoComplete="off"
                      className={errors.country ? 'is-invalid' : undefined}
                    >
                      <option value="">Select Country</option>
                      {COUNTRIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </Field>
                </div>
              </div>
            </section>

            {/* ── Section 2: Attendance + Pricing ── */}
            <section className="rx-section-block">
              <div className="rx-section-head">
                <p className="rx-section-label">02 — Type of Participation</p>
                <p className="rx-section-help">Pick how you&apos;ll attend, then choose your registration type.</p>
              </div>

              {/* Segment-style attendance switch */}
              <div className="rx-segment" role="tablist" aria-label="Attendance mode">
                {cfg.tabs.map(t => (
                  <button
                    key={t.id}
                    type="button"
                    role="tab"
                    aria-selected={activeTab === t.id}
                    className={`rx-segment-btn${activeTab === t.id ? ' is-active' : ''}`}
                    onClick={() => switchTab(t.id)}
                  >
                    <i className={`fas ${t.id === 'inperson' ? 'fa-handshake' : 'fa-video'}`} />
                    <span>{t.label}</span>
                  </button>
                ))}
              </div>

              {/* Card-style pricing rows */}
              <div
                ref={setRef('category') as React.Ref<HTMLDivElement>}
                className={`rx-pricing${errors.category ? ' is-invalid' : ''}`}
                tabIndex={-1}
              >
                {activeTabCfg.categories.map(cat => {
                  const isSelected = category === cat.id;
                  return (
                    <label key={cat.id} className={`rx-price-card${isSelected ? ' is-selected' : ''}`}>
                      <input
                        type="radio"
                        name="registrationType"
                        value={cat.id}
                        checked={isSelected}
                        onChange={() => { setCategory(cat.id); clearFieldError('category'); }}
                      />
                      <span className="rx-price-radio" aria-hidden>
                        <span className="rx-price-dot" />
                      </span>
                      <span className="rx-price-info">
                        <strong>{cat.label}</strong>
                        <span className="rx-price-meta">
                          Save {cat.discount_pct}% from standard <s>${cat.standard_price}</s>
                        </span>
                      </span>
                      <span className="rx-price-amount">
                        <span className="rx-price-num">${cat.total}</span>
                        <span className="rx-price-cur">USD</span>
                      </span>
                    </label>
                  );
                })}
              </div>
              {errors.category && (
                <small className="field-error" role="alert" style={{ marginTop: 8 }}>
                  <i className="fas fa-exclamation-circle" /> {errors.category}
                </small>
              )}
            </section>

            {/* ── Section 3: Accommodation (in-person only) ── */}
            {activeTab === 'inperson' && (
              <section className="rx-section-block">
                <div className="rx-section-head">
                  <p className="rx-section-label">03 — Accommodation <span className="rx-section-optional">· optional</span></p>
                  <p className="rx-section-help">Negotiated room rates at the official conference hotel.</p>
                </div>

                <div className="rx-occupancy">
                  {ACCOMMODATION.single > 0 && (
                    <label className={`rx-occ${accommodation === 'single' ? ' is-on' : ''}`}>
                      <input
                        type="checkbox"
                        checked={accommodation === 'single'}
                        onChange={() => setAccommodation(accommodation === 'single' ? '' : 'single')}
                      />
                      <span className="rx-occ-icon"><i className="fas fa-user" /></span>
                      <div className="rx-occ-text">
                        <strong>Single Occupancy</strong>
                        <span>1 guest · king bed · breakfast included</span>
                      </div>
                      <span className="rx-occ-price">${ACCOMMODATION.single}<span>/night</span></span>
                    </label>
                  )}
                  {ACCOMMODATION.double > 0 && (
                    <label className={`rx-occ${accommodation === 'double' ? ' is-on' : ''}`}>
                      <input
                        type="checkbox"
                        checked={accommodation === 'double'}
                        onChange={() => setAccommodation(accommodation === 'double' ? '' : 'double')}
                      />
                      <span className="rx-occ-icon"><i className="fas fa-user-group" /></span>
                      <div className="rx-occ-text">
                        <strong>Double Occupancy</strong>
                        <span>2 guests · twin/queen · breakfast included</span>
                      </div>
                      <span className="rx-occ-price">${ACCOMMODATION.double}<span>/night</span></span>
                    </label>
                  )}
                </div>

                {accommodation && (
                  <div className="rx-row" style={{ marginTop: 16, gridTemplateColumns: '1fr 1fr 140px' }}>
                    <Field label="Check-in" error={errors.checkIn}>
                      <select
                        ref={setRef('checkIn') as React.Ref<HTMLSelectElement>}
                        value={checkIn}
                        onChange={(e) => { setCheckIn(e.target.value); clearFieldError('checkIn'); }}
                        aria-invalid={!!errors.checkIn}
                        autoComplete="off"
                        className={errors.checkIn ? 'is-invalid' : undefined}
                      >
                        <option value="">Select Date</option>
                        {cfg.checkin_dates.map(d => <option key={d}>{d}</option>)}
                      </select>
                    </Field>
                    <Field label="Check-out" error={errors.checkOut}>
                      <select
                        ref={setRef('checkOut') as React.Ref<HTMLSelectElement>}
                        value={checkOut}
                        onChange={(e) => { setCheckOut(e.target.value); clearFieldError('checkOut'); }}
                        aria-invalid={!!errors.checkOut}
                        autoComplete="off"
                        className={errors.checkOut ? 'is-invalid' : undefined}
                      >
                        <option value="">Select Date</option>
                        {cfg.checkout_dates.map(d => <option key={d}>{d}</option>)}
                      </select>
                    </Field>
                    <Field label="Nights">
                      <div className="rx-nights">{nights}</div>
                    </Field>
                  </div>
                )}
              </section>
            )}

            {/* ── Section 4: Participants ── */}
            <section className="rx-section-block">
              <div className="rx-section-head">
                <p className="rx-section-label">{activeTab === 'inperson' ? '04' : '03'} — Participants</p>
                <p className="rx-section-help">{activeTab === 'inperson' ? 'Add additional delegates and accompanying guests.' : 'Add additional virtual delegates.'}</p>
              </div>

              <div className="rx-row">
                <Field
                  label={
                    <>
                      No. of Participants
                      {selectedCategory ? <small className="rx-muted">${selectedCategory.total} each</small> : null}
                    </>
                  }
                >
                  <select value={participants} onChange={(e) => setParticipants(Number(e.target.value))}>
                    {[1,2,3,4,5].map(n => <option key={n} value={n}>{String(n).padStart(2,'0')}</option>)}
                  </select>
                </Field>
                <Field
                  label={
                    <>
                      Accompanying Persons
                      {ACCOMMODATION.accompanying_per_person ? <small className="rx-muted">${ACCOMMODATION.accompanying_per_person} each</small> : null}
                    </>
                  }
                >
                  <select
                    value={accompanying}
                    onChange={(e) => setAccompanying(Number(e.target.value))}
                    disabled={activeTab !== 'inperson'}
                  >
                    {[0,1,2,3,4].map(n => <option key={n} value={n}>{String(n).padStart(2,'0')}</option>)}
                  </select>
                </Field>
              </div>
            </section>

            {/* ── Order Summary (inline, between Participants and Verify) ── */}
            <section className="rx-summary2">
              <header className="rx-summary2-head">
                <p className="rx-summary2-eyebrow">Order summary</p>
                <h3 className="rx-summary2-title">Review your registration</h3>
                <p className="rx-summary2-meta">{conf.short} · {conf.dates} · {conf.country}</p>
              </header>

              <dl className="rx-summary2-list">
                <Line2 label="Mode">
                  <span className="rx-summary2-pill">
                    <i className={`fas ${activeTab === 'inperson' ? 'fa-handshake' : 'fa-video'}`} />
                    {activeTabCfg.label}
                  </span>
                </Line2>
                <Line2 label="Type">
                  {selectedCategory
                    ? selectedCategory.label
                    : <em className="rx-summary2-empty">Not selected yet</em>}
                </Line2>
                <Line2
                  label={`Registration × ${participants}`}
                  value={regSubtotal > 0 ? `$${regSubtotal.toLocaleString()}` : '—'}
                  emphasis={regSubtotal > 0}
                />
                {activeTab === 'inperson' && accommodation && nights > 0 && (
                  <>
                    <Line2
                      label={`${accommodation === 'single' ? 'Single' : 'Double'} occupancy × ${nights} ${nights === 1 ? 'night' : 'nights'}`}
                      value={`$${accommodationTotal.toLocaleString()}`}
                      emphasis
                    />
                    <Line2 label="Check-in" value={checkIn} muted />
                    <Line2 label="Check-out" value={checkOut} muted />
                  </>
                )}
                {accompanying > 0 && (
                  <Line2
                    label={`Accompanying × ${accompanying}`}
                    value={`$${accompanyingTotal.toLocaleString()}`}
                    emphasis
                  />
                )}
              </dl>

              <div className="rx-summary2-total-row">
                <span className="rx-summary2-total-label">Total</span>
                <span className="rx-summary2-total-value">
                  ${totalPrice.toLocaleString()}
                  <small>USD</small>
                </span>
              </div>

              <ul className="rx-summary2-perks">
                <li><i className="fas fa-shield-halved" /> Secure encrypted payment</li>
                <li><i className="fas fa-envelope-circle-check" /> Instant email confirmation</li>
                <li><i className="fas fa-passport" /> Visa invitation letter on request</li>
              </ul>
            </section>

            {/* ── Section 5: Captcha + actions ── */}
            <section className="rx-section-block">
              <div className="rx-section-head">
                <p className="rx-section-label"><i className="fas fa-shield-halved" /> Verify &amp; submit</p>
                <p className="rx-section-help">Quick anti-bot check, then we hand off to secure payment.</p>
              </div>

              <div
                className="rx-captcha"
                ref={setRef('captcha') as React.Ref<HTMLDivElement>}
                tabIndex={-1}
              >
                <div className="h-captcha" data-sitekey={conf.hcaptcha_sitekey} data-theme="light" />
                {errors.captcha && (
                  <small className="field-error" role="alert" style={{ marginTop: 8 }}>
                    <i className="fas fa-exclamation-circle" /> {errors.captcha}
                  </small>
                )}
              </div>

              {globalError && (
                <div role="alert" className="rx-error">
                  <i className="fas fa-exclamation-circle" /> {globalError}
                </div>
              )}

              <p className="rx-terms">
                By proceeding you agree to the <a href="/privacy-policy">Privacy Policy</a>,{' '}
                <a href="/terms-of-use">Terms &amp; Conditions</a> and the cancellation policy below.
              </p>

              <div className="rx-actions">
                <button type="button" className="rx-btn rx-btn-ghost" onClick={reset} disabled={submitting}>
                  Reset
                </button>
                <button type="submit" className="rx-btn rx-btn-primary" disabled={submitting}>
                  {submitting
                    ? <><i className="fas fa-spinner fa-spin" /> Processing…</>
                    : <><i className="fas fa-lock" /> Proceed to Pay <span className="rx-btn-pill">${totalPrice}</span></>
                  }
                </button>
              </div>
            </section>
          </div>
          </fieldset>
        </form>
      </div>
    </section>
  );
}

/* ────────────────────────── small helpers ────────────────────────── */

function Field({
  label, children, error,
}: { label: React.ReactNode; children: React.ReactNode; error?: string }) {
  return (
    <label className="rx-field">
      <span className="rx-field-label">{label}</span>
      {children}
      {error && (
        <small className="field-error" role="alert">
          <i className="fas fa-exclamation-circle" /> {error}
        </small>
      )}
    </label>
  );
}

/* Line item in the inline order summary. Use either:
   - <Line2 label="…" value="…" />  — for plain text values
   - <Line2 label="…">…</Line2>     — for rich children (pills, etc.) */
function Line2({
  label, value, children, emphasis, muted,
}: {
  label: React.ReactNode;
  value?: React.ReactNode;
  children?: React.ReactNode;
  emphasis?: boolean;
  muted?: boolean;
}) {
  return (
    <div className={`rx-summary2-row${emphasis ? ' is-emphasis' : ''}${muted ? ' is-muted' : ''}`}>
      <dt>{label}</dt>
      <dd>{children ?? value}</dd>
    </div>
  );
}
