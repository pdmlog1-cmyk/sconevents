'use client';

/* Review + Payment page for the registration flow.

   Shows attendee info + package details, then renders an inline PayPal
   Smart Buttons widget (no redirect to PayPal hosted page). The capture
   handler writes a payment record to R2 (via /api/save-payment-user)
   and routes to /payment-success.

   Stripe is kept as a secondary fallback button for credit-card payers
   who don't have a PayPal account. */

import { useEffect, useRef, useState } from 'react';
import {
  PayPalScriptProvider,
  PayPalButtons,
  type ReactPayPalScriptOptions,
} from '@paypal/react-paypal-js';
import RegistrationStepper from '@/components/RegistrationStepper';
import { conf } from '@/lib/config';

export type ReviewOrder = {
  web_token: string;
  total_amount: number;
  reg_subtotal: number;
  accommodation_total: number;
  accompanying_total: number;
  currency: string;
  attendance: string;
  attendance_label: string;
  category: string;
  category_label: string;
  unit_price: number;
  title: string;
  name: string;
  email: string;
  alt_email: string;
  phone: string;
  whatsapp: string;
  organization: string;
  country: string;
  accommodation: string;
  accommodation_price_per_night: number;
  checkin_date: string;
  checkout_date: string;
  nights: number;
  no_participants: number;
  no_accompanying: number;
};

type PayState =
  | { phase: 'idle' }
  | { phase: 'loading'; provider: 'stripe' | 'paypal' }
  | { phase: 'success' }
  | { phase: 'error'; message: string };

type CouponResult = {
  reg_per: number;       // % discount on registration subtotal
  acc_per: number;       // % discount on accommodation
  cust_amt: number;      // if > 0, OVERRIDES total
  applied_with: string;  // human-readable label
  code: string;          // the code the user typed
};

type CouponState =
  | { phase: 'idle' }
  | { phase: 'checking' }
  | { phase: 'applied'; result: CouponResult }
  | { phase: 'invalid'; message: string }
  | { phase: 'error'; message: string };

export default function PaymentReview({
  order,
  cancelled,
  showCoupon = false,
}: {
  order: ReviewOrder;
  cancelled?: boolean;
  /** When true, render the "Have a coupon?" section. Gated upstream by
   *  ?discount in the URL so coupons are only offered via special links. */
  showCoupon?: boolean;
}) {
  const [state, setState] = useState<PayState>({ phase: 'idle' });
  const [paypalClientId, setPaypalClientId] = useState<string | null>(null);
  const [paypalUnavailable, setPaypalUnavailable] = useState(false);

  // Coupon state — independent from payment state so a coupon error doesn't
  // block the user from paying full price.
  const [couponInput, setCouponInput] = useState('');
  const [coupon, setCoupon] = useState<CouponState>({ phase: 'idle' });

  /* ── Pricing math (with discount) ──────────────────────────────────── */

  // When a coupon is applied, derive the new line items + total.
  // Logic mirrors nutrition: cust_amt overrides everything; otherwise
  // reg_per% and acc_per% reduce their respective subtotals.
  const pricing = (() => {
    const base = {
      reg_subtotal: order.reg_subtotal,
      accommodation_total: order.accommodation_total,
      accompanying_total: order.accompanying_total,
      reg_discount: 0,
      acc_discount: 0,
      total: order.total_amount,
    };
    if (coupon.phase !== 'applied') return base;
    const r = coupon.result;
    if (r.cust_amt > 0) {
      // Custom amount overrides — set total directly, show full discount delta.
      return {
        ...base,
        total: r.cust_amt,
      };
    }
    const reg_discount = +(order.reg_subtotal * (r.reg_per / 100)).toFixed(2);
    const acc_discount = +(order.accommodation_total * (r.acc_per / 100)).toFixed(2);
    const total = +(order.total_amount - reg_discount - acc_discount).toFixed(2);
    return { ...base, reg_discount, acc_discount, total };
  })();

  // Use a ref so PayPal callbacks always see the latest order + pricing —
  // they're captured at SDK-mount time and React closures would otherwise stale.
  const orderRef = useRef(order);
  orderRef.current = order;
  const pricingRef = useRef(pricing);
  pricingRef.current = pricing;
  const couponRef = useRef(coupon);
  couponRef.current = coupon;

  // Fetch the PayPal client id at runtime so it can be rotated without
  // a redeploy. Cached in state — only fires once.
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const r = await fetch('/api/paypal-client-id', { cache: 'no-store' });
        if (!r.ok) {
          if (active) setPaypalUnavailable(true);
          return;
        }
        const data = await r.json();
        if (active && data?.clientId) setPaypalClientId(data.clientId);
        else if (active) setPaypalUnavailable(true);
      } catch {
        if (active) setPaypalUnavailable(true);
      }
    })();
    return () => { active = false; };
  }, []);

  /* ── Coupon apply / clear ───────────────────────────────────────────── */

  async function applyCoupon() {
    const code = couponInput.trim();
    if (!code) {
      setCoupon({ phase: 'invalid', message: 'Please enter a coupon code.' });
      return;
    }
    setCoupon({ phase: 'checking' });
    try {
      const r = await fetch('/api/coupon-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          coupon_code: code,
          email: order.email,
          web_token: order.web_token,
        }),
      });
      const data = await r.json();
      if (r.status === 503) {
        setCoupon({ phase: 'error', message: 'Coupon system is not available right now.' });
        return;
      }
      if (!r.ok || data.success === false) {
        setCoupon({
          phase: 'invalid',
          message: data?.message || 'This coupon code is not valid.',
        });
        return;
      }
      const result: CouponResult = {
        reg_per: Number(data.reg_per) || 0,
        acc_per: Number(data.acc_per) || 0,
        cust_amt: Number(data.cust_amt) || 0,
        applied_with: String(data.applied_with || code),
        code,
      };
      // Reject responses that signal "no discount" silently.
      if (result.reg_per <= 0 && result.acc_per <= 0 && result.cust_amt <= 0) {
        setCoupon({
          phase: 'invalid',
          message: data?.message || 'No discount available for this code.',
        });
        return;
      }
      setCoupon({ phase: 'applied', result });
    } catch (e) {
      setCoupon({
        phase: 'error',
        message: e instanceof Error ? e.message : 'Could not check coupon.',
      });
    }
  }

  function clearCoupon() {
    setCouponInput('');
    setCoupon({ phase: 'idle' });
  }

  /* ── PayPal Smart Buttons handlers ───────────────────────────────────── */

  async function paypalCreateOrder(): Promise<string> {
    const o = orderRef.current;
    const p = pricingRef.current;
    const r = await fetch('/api/paypal/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        web_token: o.web_token,
        total_amount: p.total,
        currency: o.currency,
        description: `WCAM 2027 — ${o.category_label}`,
      }),
    });
    const data = await r.json();
    if (!r.ok || !data.id) throw new Error(data.error || 'PayPal order creation failed');
    return data.id as string;
  }

  async function paypalOnApprove(approval: { orderID: string }): Promise<void> {
    const o = orderRef.current;
    const p = pricingRef.current;
    const c = couponRef.current;
    setState({ phase: 'loading', provider: 'paypal' });
    // eslint-disable-next-line no-console
    console.log(
      `[client:paypal:onApprove] web_token=${o.web_token} orderID=${approval.orderID}`,
    );

    // 1. Capture the order on the server. The route returns rich status
    //    fields even on HTTP errors so we can show a real reason.
    let cap: {
      success?: boolean;
      outcome?: 'completed' | 'pending' | 'declined' | 'failed';
      charged?: boolean;
      pending_reason?: string;
      failure_reason?: string;
      failure_message?: string;
      transaction_id?: string;
      capture_status?: string;
      amount?: number;
      currency?: string;
      raw?: unknown;
      error?: string;
    } | null = null;
    try {
      const capRes = await fetch('/api/paypal/capture-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderID: approval.orderID, web_token: o.web_token }),
      });
      cap = await capRes.json();
    } catch (e) {
      // Network failure — we don't know if PayPal completed the capture or not.
      // Treat as charged=true to be defensive (so user is informed funds may be held).
      const msg = e instanceof Error ? e.message : 'Network error during capture';
      const params = new URLSearchParams({
        provider: 'paypal',
        ref: o.web_token,
        status: 'pending',
        reason: 'NETWORK_ERROR_DURING_CAPTURE',
        message: msg,
        charged: '1',
      });
      window.location.href = `/payment-success?${params.toString()}`;
      return;
    }

    const outcome = cap?.outcome || 'failed';
    const charged = Boolean(cap?.charged);

    // 2. Build common payment-record body for save-payment-user.
    const discount_amt = +(o.total_amount - p.total).toFixed(2);
    const couponInfo = c.phase === 'applied' ? {
      applied_with: c.result.applied_with,
      reg_per: c.result.reg_per,
      acc_per: c.result.acc_per,
      cust_amt: c.result.cust_amt,
      code: c.result.code,
    } : null;

    // 3. Persist record only when money actually moved (completed or pending).
    if (outcome === 'completed' || outcome === 'pending') {
      try {
        await fetch('/api/save-payment-user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            web_token: o.web_token,
            provider: 'paypal',
            transaction_id: cap?.transaction_id || '',
            payment_status: cap?.capture_status || (outcome === 'completed' ? 'COMPLETED' : 'PENDING'),
            payment_method: 'paypal',
            total_price: cap?.amount || p.total,
            currency: cap?.currency || o.currency,
            discount_amt,
            coupon: couponInfo,
            capture_raw: cap?.raw,
          }),
        });
      } catch {
        /* swallow — confirm-page retry will catch any propagation lag */
      }
    }

    // 4. Route to /payment-success with a status-specific query payload.
    const params = new URLSearchParams({
      provider: 'paypal',
      ref: o.web_token,
      status: outcome === 'completed' ? 'success' : outcome,
    });
    if (cap?.transaction_id) params.set('transaction_id', cap.transaction_id);
    if (outcome === 'pending' && cap?.pending_reason) {
      params.set('reason', cap.pending_reason);
      params.set('charged', charged ? '1' : '0');
    }
    if ((outcome === 'failed' || outcome === 'declined')) {
      params.set('reason', cap?.failure_reason || 'unknown');
      params.set('message', cap?.failure_message || 'Payment could not be completed');
      params.set('charged', charged ? '1' : '0');
    }
    setState(outcome === 'completed' ? { phase: 'success' } : { phase: 'idle' });
    window.location.href = `/payment-success?${params.toString()}`;
  }

  function paypalOnError(err: unknown) {
    const msg = err instanceof Error ? err.message : 'PayPal payment failed';
    // eslint-disable-next-line no-console
    console.error('[paypal] onError', err);
    setState({ phase: 'error', message: msg });
  }

  function paypalOnCancel() {
    // User dismissed the PayPal popup — leave the page in a calm idle state.
    setState({ phase: 'idle' });
  }

  /* ── Stripe fallback ────────────────────────────────────────────────── */

  async function payWithStripe() {
    setState({ phase: 'loading', provider: 'stripe' });
    try {
      // Send the discounted total (pricing.total) to Stripe so the customer
      // is charged exactly what's shown on screen.
      const r = await fetch('/api/checkout/stripe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...order, total_amount: pricing.total }),
      });
      const data = await r.json();
      if (!r.ok || !data.url) throw new Error(data.error || 'Stripe checkout failed');
      window.location.href = data.url;
    } catch (e) {
      setState({
        phase: 'error',
        message: e instanceof Error ? e.message : 'Payment could not be started',
      });
    }
  }

  /* ── Render ─────────────────────────────────────────────────────────── */

  const stripeLoading = state.phase === 'loading' && state.provider === 'stripe';
  const paypalLoading = state.phase === 'loading' && state.provider === 'paypal';
  const anyLoading = state.phase === 'loading';

  // PayPalScriptProvider options. Reset the SDK if currency or amount
  // changes (won't happen in our flow but keeps it correct).
  const paypalOptions: ReactPayPalScriptOptions | null = paypalClientId
    ? {
        clientId: paypalClientId,
        currency: order.currency || 'USD',
        intent: 'capture',
        components: 'buttons',
      }
    : null;

  const savings = coupon.phase === 'applied' && pricing.total < order.total_amount
    ? order.total_amount - pricing.total
    : 0;

  return (
    <section className="chk-section">
      <div className="container">

        {/* ═════════ Editorial banner with stepper ═════════ */}
        <header className="rx-banner">
          <p className="rx-banner-eyebrow">
            <i className="fas fa-check-circle" /> Almost there · Step 2
          </p>
          <h1 className="rx-banner-title">Review &amp; pay.</h1>
          <p className="rx-banner-intro">
            Confirm your details, then choose how to pay. Your registration is held until payment completes.
          </p>
          {order.web_token && (
            <p className="rx-banner-ref">
              Reference <code>{order.web_token}</code>
            </p>
          )}
          <RegistrationStepper current="review" />
        </header>

        {cancelled && (
          <div className="co-banner" role="status">
            <i className="fas fa-circle-info" />
            Your previous payment attempt was cancelled. You can pay below to complete registration.
          </div>
        )}

        {/* ═════════════ Single-column checkout ═════════════ */}
        <div className="co-flow">

          {/* 1. RESERVATION SUMMARY — single card, A | B inside, total at bottom */}
          <section className="co-card co-summary">
            <div className="co-card-head">
              <h2 className="co-card-title">Reservation summary</h2>
              <p className="co-card-meta">{conf.short} · {conf.dates} · {conf.country}</p>
            </div>

            <div className="co-summary-grid">
              <div className="co-summary-col">
                <p className="co-col-label">Attendee</p>
                <dl className="co-dl">
                  <Cell label="Name" value={`${order.title} ${order.name}`.trim()} />
                  <Cell label="Email" value={order.email} />
                  {order.alt_email && <Cell label="Alt email" value={order.alt_email} />}
                  <Cell label="Phone" value={order.phone} />
                  {order.whatsapp && <Cell label="WhatsApp" value={order.whatsapp} />}
                  <Cell label="Institution" value={order.organization} />
                  <Cell label="Country" value={order.country} />
                </dl>
              </div>

              <div className="co-summary-col">
                <p className="co-col-label">Package</p>
                <dl className="co-dl">
                  <Cell label="Mode" value={order.attendance_label} />
                  <Cell label="Type" value={order.category_label} />
                  <Cell
                    label={`Registration × ${order.no_participants}`}
                    value={`$${order.reg_subtotal.toLocaleString()}`}
                  />
                  {order.accommodation !== 'none' && order.nights > 0 && (
                    <>
                      <Cell
                        label="Accommodation"
                        value={`${order.accommodation === 'single' ? 'Single' : 'Double'} · ${order.nights} ${order.nights === 1 ? 'night' : 'nights'}`}
                      />
                      <Cell
                        label="Stay"
                        value={`${order.checkin_date} → ${order.checkout_date}`}
                      />
                      <Cell
                        label="Accommodation total"
                        value={`$${order.accommodation_total.toLocaleString()}`}
                      />
                    </>
                  )}
                  {order.no_accompanying > 0 && (
                    <Cell
                      label={`Accompanying × ${order.no_accompanying}`}
                      value={`$${order.accompanying_total.toLocaleString()}`}
                    />
                  )}
                </dl>
              </div>
            </div>

            {/* Total bar */}
            <div className="co-total">
              <div className="co-total-left">
                <span className="co-total-label">Total to pay</span>
                {savings > 0 && (
                  <span className="co-total-was">
                    <s>${order.total_amount.toLocaleString()}</s>
                    <span className="co-total-saved">— Save ${savings.toLocaleString()}</span>
                  </span>
                )}
                {coupon.phase === 'applied' && (
                  <span className="co-total-coupon">
                    <i className="fas fa-tag" /> {coupon.result.applied_with}
                  </span>
                )}
              </div>
              <strong className="co-total-amount">
                ${pricing.total.toLocaleString()}
                <small>{order.currency}</small>
              </strong>
            </div>
          </section>

          {/* 2. COUPON (gated by ?discount) */}
          {showCoupon && (
            <section className="co-card co-coupon">
              <div className="co-card-head">
                <h3 className="co-card-title-sm"><i className="fas fa-tag" /> Coupon code</h3>
              </div>
              <div className="co-card-body">
                {coupon.phase === 'applied' ? (
                  <div className="co-coupon-applied">
                    <div className="co-coupon-badge">
                      <i className="fas fa-circle-check" />
                      <div>
                        <strong>{coupon.result.applied_with}</strong>
                        <span>
                          {coupon.result.cust_amt > 0
                            ? `Custom price: $${coupon.result.cust_amt} ${order.currency}`
                            : `${coupon.result.reg_per > 0 ? coupon.result.reg_per + '% off registration' : ''}${coupon.result.reg_per > 0 && coupon.result.acc_per > 0 ? ' · ' : ''}${coupon.result.acc_per > 0 ? coupon.result.acc_per + '% off accommodation' : ''}`}
                        </span>
                      </div>
                    </div>
                    <button type="button" className="co-coupon-clear" onClick={clearCoupon}>
                      <i className="fas fa-xmark" /> Remove
                    </button>
                  </div>
                ) : (
                  <div className="co-coupon-row">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => {
                        setCouponInput(e.target.value.toUpperCase());
                        if (coupon.phase !== 'idle') setCoupon({ phase: 'idle' });
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          applyCoupon();
                        }
                      }}
                      placeholder="Enter code"
                      autoComplete="off"
                      disabled={coupon.phase === 'checking'}
                      className={coupon.phase === 'invalid' || coupon.phase === 'error' ? 'is-invalid' : undefined}
                    />
                    <button
                      type="button"
                      className="co-coupon-apply"
                      onClick={applyCoupon}
                      disabled={coupon.phase === 'checking' || !couponInput.trim()}
                    >
                      {coupon.phase === 'checking'
                        ? <><i className="fas fa-spinner fa-spin" /> Checking…</>
                        : 'Apply'}
                    </button>
                  </div>
                )}
                {(coupon.phase === 'invalid' || coupon.phase === 'error') && (
                  <small className="field-error" role="alert" style={{ marginTop: 12, display: 'block' }}>
                    <i className="fas fa-exclamation-circle" /> {coupon.message}
                  </small>
                )}
              </div>
            </section>
          )}

          {/* 3. PAYMENT METHODS — two distinctly branded cards */}
          <h2 className="co-section-heading">Choose how to pay</h2>

          {/* PayPal — branded yellow surface */}
          <section className="co-card co-pay-paypal">
            <div className="co-method-head">
              <div className="co-method-brand">
                <i className="fab fa-paypal co-method-brand-icon co-paypal-icon" />
                <div>
                  <p className="co-method-title">PayPal</p>
                  <p className="co-method-desc">Pay with your PayPal balance, bank account, or any PayPal-supported card</p>
                </div>
              </div>
            </div>
            <div className="co-method-body">
              {paypalOptions ? (
                <div className="co-paypal-widget" aria-busy={paypalLoading}>
                  <PayPalScriptProvider options={paypalOptions}>
                    <PayPalButtons
                      style={{
                        layout: 'vertical',
                        color: 'gold',
                        shape: 'rect',
                        label: 'paypal',
                        height: 48,
                      }}
                      disabled={anyLoading}
                      createOrder={paypalCreateOrder}
                      onApprove={async (data) => {
                        await paypalOnApprove({ orderID: data.orderID });
                      }}
                      onError={paypalOnError}
                      onCancel={paypalOnCancel}
                    />
                  </PayPalScriptProvider>
                  {paypalLoading && (
                    <p className="co-method-status">
                      <i className="fas fa-spinner fa-spin" /> Capturing your payment, please wait…
                    </p>
                  )}
                </div>
              ) : paypalUnavailable ? (
                <div className="co-method-fallback">
                  <i className="fab fa-paypal" />
                  PayPal isn&apos;t available right now. Use card payment below.
                </div>
              ) : (
                <div className="co-method-loading">
                  <i className="fas fa-spinner fa-spin" /> Loading PayPal…
                </div>
              )}
            </div>
          </section>

          {/* Card — clean white surface, supported brands prominent */}
          <section className="co-card co-pay-card">
            <div className="co-method-head">
              <div className="co-method-brand">
                <i className="far fa-credit-card co-method-brand-icon co-card-icon" />
                <div>
                  <p className="co-method-title">Card payment</p>
                  <p className="co-method-desc">Visa, Mastercard, American Express, Discover &amp; JCB</p>
                </div>
              </div>
              <div className="co-card-brands" aria-hidden>
                <i className="fab fa-cc-visa" title="Visa" />
                <i className="fab fa-cc-mastercard" title="Mastercard" />
                <i className="fab fa-cc-amex" title="American Express" />
                <i className="fab fa-cc-discover" title="Discover" />
              </div>
            </div>
            <div className="co-method-body">
              <button
                type="button"
                className="co-pay-btn"
                onClick={payWithStripe}
                disabled={anyLoading}
                aria-busy={stripeLoading}
              >
                {stripeLoading ? (
                  <><i className="fas fa-spinner fa-spin" /> Connecting to Stripe…</>
                ) : (
                  <>
                    <span>Pay ${pricing.total.toLocaleString()} {order.currency}</span>
                    <i className="fas fa-arrow-right co-pay-btn-arrow" />
                  </>
                )}
              </button>
              <p className="co-method-poweredby">
                Powered by <strong>Stripe</strong> · PCI-DSS Level 1
              </p>
            </div>
          </section>

          {/* Error surface — appears below the methods */}
          {state.phase === 'error' && (
            <div role="alert" className="co-error">
              <i className="fas fa-exclamation-circle" /> {state.message}
            </div>
          )}

          {/* Trust + terms footer */}
          <div className="co-trust">
            <p className="co-trust-line">
              <i className="fas fa-shield-halved" />
              <span>256-bit SSL encrypted · processed directly by PayPal or Stripe · we never see your card</span>
            </p>
            <p className="co-fineprint">
              By paying you agree to the <a href="/privacy-policy">Privacy Policy</a>,{' '}
              <a href="/terms-of-use">Terms &amp; Conditions</a> and our cancellation policy.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* Compact dl row used in the new chk-* layout */
function Cell({ label, value }: { label: string; value: string }) {
  return (
    <div className="chk-cell">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

/* (Old `Row` helper removed — replaced by `Cell` for the chk-* layout) */
