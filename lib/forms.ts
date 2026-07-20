/* =============================================================================
   Form submission helpers
   -----------------------------------------------------------------------------
   Centralizes the operations every form API route needs:
     - hCaptcha server-side verification
     - Email delivery via Resend (optional, falls back to logging)
     - Webhook forwarding (optional)
     - SCON CMS forwarding (optional, when CMS_URL + CID are set)
     - Common JSON response shapes

   Env vars (all optional except hCaptcha when verification is required):
     HCAPTCHA_SECRET_KEY      — server-side verify against hcaptcha.com
     RESEND_API_KEY           — enables email delivery
     FORM_FROM_EMAIL          — From address for outbound emails
     FORM_TO_EMAIL            — destination for form notifications
     FORM_WEBHOOK_URL         — optional webhook (e.g. Zapier/Make/Slack)
     FORM_WEBHOOK_SECRET      — optional shared secret added to webhook header
     CMS_URL                  — SCON CMS base URL (e.g. https://api.sconcms.com)
     CID                      — SCON conference id (e.g. 10003)
   ============================================================================= */

import { conf } from '@/lib/config';

export type FormResult = {
  success: boolean;
  error?: string;
  details?: unknown;
};

/* -------------------------------------------------------------------------- */
/*  hCaptcha verification                                                     */
/* -------------------------------------------------------------------------- */

const HCAPTCHA_TEST_SITEKEY = '10000000-ffff-ffff-ffff-000000000001';
const HCAPTCHA_TEST_RESPONSE = '10000000-aaaa-bbbb-cccc-000000000001';

/**
 * Verify an hCaptcha token server-side. Returns true on success.
 *
 * - If `HCAPTCHA_SECRET_KEY` is unset, we treat the token as valid in
 *   development (so contributors can run forms locally without a key).
 * - The hCaptcha test sitekey/response always passes for local testing.
 */
export async function verifyCaptcha(token: string | undefined | null): Promise<boolean> {
  if (!token) return false;

  // Test sitekey/response — always valid (per hcaptcha.com docs)
  if (token === HCAPTCHA_TEST_RESPONSE) return true;

  const secret = process.env.HCAPTCHA_SECRET_KEY;
  if (!secret) {
    // No secret configured — accept any non-empty token in dev
    if (process.env.NODE_ENV !== 'production') return true;
    return false;
  }

  try {
    const body = new URLSearchParams({ secret, response: token });
    const r = await fetch('https://hcaptcha.com/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });
    if (!r.ok) return false;
    const data = (await r.json()) as { success?: boolean };
    return Boolean(data.success);
  } catch {
    return false;
  }
}

/* -------------------------------------------------------------------------- */
/*  Email + webhook delivery                                                  */
/* -------------------------------------------------------------------------- */

type DeliverInput = {
  /** Short label for the form, e.g. "Abstract", "Registration" */
  formType: string;
  /** Subject line for the notification email */
  subject: string;
  /** Submitter's email — used as Reply-To */
  replyTo?: string;
  /** Plain key/value record of submitted fields */
  payload: Record<string, unknown>;
  /** When true, skip the generic CMS forward — the route does its own POST. */
  skipCms?: boolean;
};

/**
 * Deliver the submission via every configured channel. Each channel is
 * best-effort and logged on failure — they never throw, so a partial
 * outage doesn't break form submission for the user.
 */
export async function deliverSubmission(input: DeliverInput): Promise<void> {
  // Always log — Vercel runtime logs are searchable and free
  // eslint-disable-next-line no-console
  console.log(`[form:${input.formType}]`, JSON.stringify(input.payload));

  await Promise.allSettled([
    sendEmail(input),
    forwardWebhook(input),
    input.skipCms ? Promise.resolve() : forwardCms(input),
  ]);
}

async function sendEmail({ formType, subject, replyTo, payload }: DeliverInput) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.FORM_FROM_EMAIL;
  const to = process.env.FORM_TO_EMAIL || conf.email;
  if (!apiKey || !from || !to) return;

  const html = renderHtmlEmail(formType, payload);

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to,
        subject: `[${conf.short}] ${subject}`,
        html,
        ...(replyTo ? { reply_to: replyTo } : {}),
      }),
    });
    if (!r.ok) {
      // eslint-disable-next-line no-console
      console.error(`[form:${formType}] resend failed:`, r.status, await r.text());
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(`[form:${formType}] resend error:`, e);
  }
}

/**
 * UTF-8 string → base64 (Node.js).
 */
function utf8ToBase64(s: string): string {
  const bytes = new TextEncoder().encode(s);
  let binary = '';
  bytes.forEach(b => { binary += String.fromCharCode(b); });
  return btoa(binary);
}

/**
 * Encode every scalar value in the payload as base64 — same convention the
 * SCON CMS uses (matches nutrition-meetings.com legacy contract).
 *
 * Field-value exceptions kept plain:
 *   - upload_abstract_file (already a URL)
 *   - downloadUrl, fileUrl   (URLs)
 */
const KEEP_PLAIN = new Set(['upload_abstract_file', 'downloadUrl', 'fileUrl']);

function encodeFields(input: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(input)) {
    if (KEEP_PLAIN.has(k)) { out[k] = v ?? ''; continue; }
    if (v === null || v === undefined) { out[k] = ''; continue; }
    if (typeof v === 'string') { out[k] = utf8ToBase64(v); continue; }
    if (typeof v === 'number' || typeof v === 'boolean') {
      out[k] = utf8ToBase64(String(v));
      continue;
    }
    out[k] = utf8ToBase64(JSON.stringify(v));
  }
  return out;
}

/**
 * Forward to the SCON CMS (api.sconcms.com). Requires CMS_URL and CID.
 * Field values inside `payload` are base64-encoded (matching nutrition's
 * legacy contract); wrapper meta fields (cid, site, formType, etc.) are
 * left plaintext so the CMS can route the request.
 */
async function forwardCms({ formType, subject, payload }: DeliverInput) {
  const baseUrl = process.env.CMS_URL?.replace(/\/+$/, '');
  const cid = process.env.CID;
  if (!baseUrl || !cid) return;

  // Map our internal form type to a CMS endpoint slug.
  const slug = formType
    .toLowerCase()
    .split(' ')[0]                  // "Enquiry (sponsor)" -> "enquiry"
    .replace(/[^a-z0-9]/g, '');

  const url = `${baseUrl}/${slug}`;

  try {
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cid,
        site: conf.short,
        formType,
        subject,
        receivedAt: new Date().toISOString(),
        payload: encodeFields(payload),
      }),
      // CMS may be slow under load — give it room without hanging the route.
      signal: AbortSignal.timeout(20_000),
    });
    if (!r.ok) {
      // eslint-disable-next-line no-console
      console.error(`[form:${formType}] cms forward failed:`, r.status, await r.text().catch(() => ''));
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(`[form:${formType}] cms forward error:`, e);
  }
}

async function forwardWebhook({ formType, payload }: DeliverInput) {
  const url = process.env.FORM_WEBHOOK_URL;
  if (!url) return;
  const secret = process.env.FORM_WEBHOOK_SECRET;

  try {
    const r = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(secret ? { 'X-Form-Secret': secret } : {}),
      },
      body: JSON.stringify({
        site: conf.short,
        form: formType,
        receivedAt: new Date().toISOString(),
        payload,
      }),
    });
    if (!r.ok) {
      // eslint-disable-next-line no-console
      console.error(`[form:${formType}] webhook failed:`, r.status);
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(`[form:${formType}] webhook error:`, e);
  }
}

function renderHtmlEmail(formType: string, payload: Record<string, unknown>): string {
  const rows = Object.entries(payload)
    .map(([k, v]) => {
      const value = typeof v === 'string' ? v : JSON.stringify(v);
      return `<tr><td style="padding:6px 12px;border-bottom:1px solid #eee;font-family:monospace;color:#666;font-size:12px;text-transform:uppercase;letter-spacing:0.04em">${escapeHtml(k)}</td><td style="padding:6px 12px;border-bottom:1px solid #eee">${escapeHtml(value)}</td></tr>`;
    })
    .join('');
  return `<div style="font-family:system-ui,sans-serif;max-width:640px;margin:0 auto"><h2 style="border-bottom:2px solid #0a63d6;padding-bottom:8px">${conf.short} — ${escapeHtml(formType)}</h2><table style="width:100%;border-collapse:collapse">${rows}</table><p style="color:#888;font-size:12px;margin-top:24px">Received ${new Date().toISOString()}</p></div>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/* -------------------------------------------------------------------------- */
/*  Validators                                                                */
/* -------------------------------------------------------------------------- */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[+\d][\d\s\-()]{6,}$/;

export const isValidEmail = (s: unknown): s is string =>
  typeof s === 'string' && EMAIL_RE.test(s);

export const isValidPhone = (s: unknown): s is string =>
  typeof s === 'string' && PHONE_RE.test(s);

export function requireFields<T extends Record<string, unknown>>(
  body: T,
  required: (keyof T)[],
): string | null {
  for (const k of required) {
    const v = body[k];
    if (v === undefined || v === null || (typeof v === 'string' && v.trim() === '')) {
      return `Field "${String(k)}" is required.`;
    }
  }
  return null;
}

/* -------------------------------------------------------------------------- */
/*  Misc                                                                      */
/* -------------------------------------------------------------------------- */

export function generateToken(prefix = 'WCAB'): string {
  const rand = Math.random().toString(36).slice(2, 10);
  const ts = Date.now().toString(36);
  return `${prefix}-${ts}-${rand}`.toUpperCase();
}

export function jsonError(message: string, status = 400, details?: unknown): Response {
  return Response.json({ success: false, error: message, details }, { status });
}

export function jsonSuccess(extra: Record<string, unknown> = {}): Response {
  return Response.json({ success: true, ...extra });
}
