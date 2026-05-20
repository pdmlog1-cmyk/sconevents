/* =============================================================================
   Payment persistence — shared between /api/save-payment-user and
   /api/checkout/stripe/verify.
   -----------------------------------------------------------------------------
   Two parallel writes after a successful capture:
     1. R2 mirror at  addiction/payment/<web_token>.json   (with 409 anti-replay)
     2. SCON CMS via or_payment=1 contract (5 base64 fields, urlencoded)

   Both are best-effort: a CMS failure should never break the user-facing
   success page (which reads from R2).
   ============================================================================= */

import { r2PutJson, paymentKey, r2Configured } from '@/lib/r2';
import { utf8ToBase64 } from '@/lib/encode';

export type PaymentInput = {
  web_token: string;
  provider: 'paypal' | 'stripe' | string;
  transaction_id?: string;
  payment_status?: string;       // 'COMPLETED' | 'PENDING' | etc.
  payment_method?: string;       // 'paypal' | 'stripe' | 'Paypal' | 'Stripe'
  total_price?: number;
  currency?: string;
  discount_amt?: number;
  coupon?: {
    applied_with?: string;
    reg_per?: number;
    acc_per?: number;
    cust_amt?: number;
    code?: string;
  } | null;
  capture_raw?: unknown;
};

export type PaymentPersistResult = {
  r2: { ok: boolean; conflict?: boolean; error?: string };
  cms: { ok: boolean; status?: number; details?: string };
};

const CMS_TIMEOUT_MS = 25_000;

/**
 * Forward a captured payment to SCON CMS using the Postman or_payment=1
 * contract: 5 fields, all base64-encoded, urlencoded body.
 */
async function forwardPaymentToCms(input: PaymentInput): Promise<{
  ok: boolean;
  status?: number;
  details?: string;
}> {
  const cmsUrl = process.env.CMS_URL;
  if (!cmsUrl) return { ok: false, details: 'CMS_URL not configured' };

  const enc = (v: string) => utf8ToBase64(v);
  const status = (input.payment_status || '').toUpperCase() === 'COMPLETED' ? '1' : '0';
  const method = input.payment_method
    || (input.provider === 'stripe' ? 'Stripe' : 'Paypal');

  const additionalInfo = {
    transaction_id: input.transaction_id || '',
    total_price: input.total_price ?? 0,
    currency: input.currency || 'USD',
    discount_amt: input.discount_amt ?? 0,
    provider: input.provider,
    coupon: input.coupon
      ? {
          applied_with: input.coupon.applied_with || '',
          code: input.coupon.code || '',
          reg_per: input.coupon.reg_per ?? 0,
          acc_per: input.coupon.acc_per ?? 0,
          cust_amt: input.coupon.cust_amt ?? 0,
        }
      : null,
  };

  const params = new URLSearchParams();
  params.append('or_payment', '1');                         // PLAIN
  params.append('paymentstatus', enc(status));              // base64("1") or base64("0")
  params.append('payment_method', enc(method));             // base64("Paypal" | "Stripe")
  params.append('web_token', enc(input.web_token));         // base64(token)
  params.append('additional_info', enc(JSON.stringify(additionalInfo)));

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), CMS_TIMEOUT_MS);
  try {
    const r = await fetch(cmsUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: '*/*',
      },
      body: params.toString(),
      signal: controller.signal,
    });
    const text = await r.text();
    if (!r.ok) {
      // eslint-disable-next-line no-console
      console.error(`[payment:cms] error provider=${input.provider} token=${input.web_token}:`, r.status, text.slice(0, 500));
      return { ok: false, status: r.status, details: text.slice(0, 500) };
    }
    // eslint-disable-next-line no-console
    console.log(`[payment:cms] ok provider=${input.provider} token=${input.web_token}:`, r.status, text.slice(0, 200));
    return { ok: true, status: r.status, details: text.slice(0, 500) };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    // eslint-disable-next-line no-console
    console.error(`[payment:cms] exception provider=${input.provider} token=${input.web_token}:`, msg);
    return { ok: false, details: msg };
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Persist a captured payment: R2 mirror + CMS forward, in parallel.
 *
 * R2 uses ifNoneMatch so a duplicate token (replay attempt) returns conflict
 * without overwriting. The caller decides how to surface that.
 */
export async function persistPayment(input: PaymentInput): Promise<PaymentPersistResult> {
  // eslint-disable-next-line no-console
  console.log(`[payment:persist] provider=${input.provider} token=${input.web_token} status=${input.payment_status} txn=${input.transaction_id || '-'}`);

  const record = {
    type: 'payment',
    web_token: input.web_token,
    site_url: process.env.SITE_URL || '',
    cid: process.env.CID || '',
    received_at: new Date().toISOString(),
    provider: input.provider,
    transaction_id: input.transaction_id || '',
    payment_status: input.payment_status || '',
    payment_method: input.payment_method || '',
    total_price: typeof input.total_price === 'number' ? input.total_price : 0,
    currency: input.currency || 'USD',
    discount_amt: typeof input.discount_amt === 'number' ? input.discount_amt : 0,
    coupon: input.coupon ?? null,
    capture_raw: input.capture_raw ?? null,
  };

  const r2Promise = r2Configured()
    ? r2PutJson(paymentKey(input.web_token), record, { ifNoneMatch: true })
    : Promise.resolve({ ok: false as const, error: 'R2 not configured' });

  const [r2Result, cmsResult] = await Promise.all([
    r2Promise,
    forwardPaymentToCms(input),
  ]);

  return {
    r2: {
      ok: r2Result.ok,
      conflict: 'conflict' in r2Result ? r2Result.conflict : false,
      error: !r2Result.ok && 'error' in r2Result ? r2Result.error : undefined,
    },
    cms: cmsResult,
  };
}
