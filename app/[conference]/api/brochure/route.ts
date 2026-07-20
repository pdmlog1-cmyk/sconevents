/* POST /api/brochure — brochure / scientific-program download lead capture.
   modalType maps to CMS website_form:
     - brochure            → website_form=brochure_download
     - scientific_program  → website_form=scientific_program_download
*/
import {
  verifyCaptcha,
  isValidEmail,
  requireFields,
  deliverSubmission,
  jsonError,
  jsonSuccess,
  generateToken,
} from '@/lib/forms';
import { utf8ToBase64 } from '@/lib/encode';
import { getConferenceMeta } from '@/lib/conferences';

// Cloudflare Workers runs at the edge by default — no explicit runtime needed.

const CMS_TIMEOUT_MS = 25_000;

type Body = {
  first_name?: string;
  email?: string;
  phone?: string;
  country?: string;
  interested_in?: string;
  message?: string;
  modalType?: 'brochure' | 'scientific_program' | string;
  captchaToken?: string;
};

const BROCHURE_BASE = '/brochures';

const WEBSITE_FORM: Record<string, string> = {
  brochure: 'brochure_download',
  scientific_program: 'scientific_program_download',
};

/**
 * Forward to SCON CMS using the brochure_download / scientific_program_download
 * contract from the Postman collection. urlencoded body, base64 values.
 */
async function forwardBrochureToCms(body: Body, kind: string): Promise<{ ok: boolean; status?: number; details?: string }> {
  const cmsUrl = process.env.CMS_URL;
  const cid = process.env.CID || '';
  if (!cmsUrl) return { ok: false, details: 'CMS_URL not configured' };

  const enc = (v: string | undefined | null) => utf8ToBase64(String(v ?? ''));

  // Split full name into first/last (CMS samples use snake_case here).
  const fullName = (body.first_name || '').trim();
  const parts = fullName.split(/\s+/);
  const first = parts.shift() || fullName;
  const last = parts.join(' ');

  // interested_in → additional_info JSON
  const additionalInfo: Record<string, unknown> = {};
  if (body.interested_in) additionalInfo.interested_in = body.interested_in;

  const params = new URLSearchParams();
  params.append('website_form', enc(WEBSITE_FORM[kind] ?? 'brochure_download'));
  params.append('cid', enc(cid));
  params.append('first_name', enc(first));
  params.append('last_name', enc(last));
  params.append('email', enc(body.email || ''));
  params.append('message', enc(body.message || ''));
  params.append('country', enc(body.country || ''));
  params.append('phone', enc(body.phone || ''));
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
      console.error('[brochure] CMS error:', r.status, text.slice(0, 500));
      return { ok: false, status: r.status, details: text.slice(0, 500) };
    }
    // eslint-disable-next-line no-console
    console.log('[brochure] CMS ok:', r.status, text.slice(0, 200));
    return { ok: true, status: r.status, details: text.slice(0, 500) };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    // eslint-disable-next-line no-console
    console.error('[brochure] CMS forward exception:', msg);
    return { ok: false, details: msg };
  } finally {
    clearTimeout(timer);
  }
}

export async function POST(req: Request, { params }: { params: { conference: string } }) {
  let body: Body;
  try {
    body = await req.json();
  } catch {
    return jsonError('Invalid JSON body', 400);
  }

  const required: (keyof Body)[] = ['first_name', 'email', 'phone', 'country', 'captchaToken'];
  const missing = requireFields(body, required);
  if (missing) return jsonError(missing, 400);

  if (!isValidEmail(body.email)) return jsonError('Invalid email address', 400);

  const captchaOk = await verifyCaptcha(body.captchaToken);
  if (!captchaOk) return jsonError('Captcha verification failed', 400);

  const kind = body.modalType === 'scientific_program' ? 'scientific_program' : 'brochure';
  const confMeta = getConferenceMeta(params.conference);
  const brochureSlug = confMeta ? confMeta.short.toLowerCase().replace(/\s+/g, '-') : params.conference;
  const downloadUrl = `${BROCHURE_BASE}/${brochureSlug}.pdf`;
  const ref = generateToken('DL');

  const [cmsResult] = await Promise.all([
    forwardBrochureToCms(body, kind),
    deliverSubmission({
      formType: `Download (${kind})`,
      subject: `${kind === 'brochure' ? 'Brochure' : 'Program'} download: ${body.first_name} (${ref})`,
      replyTo: body.email,
      skipCms: true,
      payload: {
        ref,
        kind,
        first_name: body.first_name,
        email: body.email,
        phone: body.phone,
        country: body.country,
        interested_in: body.interested_in || '',
        message: body.message || '',
      },
    }),
  ]);

  return jsonSuccess({
    ref,
    downloadUrl,
    cms: cmsResult.ok ? 'ok' : 'failed',
    cmsStatus: cmsResult.status,
    cmsDetails: cmsResult.details,
  });
}
