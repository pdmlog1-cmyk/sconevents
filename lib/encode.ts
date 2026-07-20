/* =============================================================================
   Form payload encoding (browser ↔ server-safe)
   -----------------------------------------------------------------------------
   Forms encode every string field (UTF-8 → base64) before POSTing. The API
   routes decode them back for validation. The browser's network tab then
   shows opaque base64 instead of the user's raw input.

   The captcha token, file URL, source tag and modalType stay plaintext so
   validation, CMS routing and download links keep working.
   ============================================================================= */

const KEEP_PLAIN = new Set([
  'captchaToken',
  'modalType',
  'source',
  'upload_abstract_file',
  'fileUrl',
  'downloadUrl',
]);

export function utf8ToBase64(s: string): string {
  const bytes = new TextEncoder().encode(s);
  let binary = '';
  bytes.forEach(b => { binary += String.fromCharCode(b); });
  return btoa(binary);
}

export function base64ToUtf8(s: string): string {
  const binary = atob(s);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

/** Client → server: encode every string value except plaintext keys. */
export function encodeBody(body: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(body)) {
    if (KEEP_PLAIN.has(k) || v === undefined || v === null || v === '') {
      out[k] = v ?? '';
      continue;
    }
    if (typeof v === 'string') out[k] = utf8ToBase64(v);
    else if (typeof v === 'number' || typeof v === 'boolean') out[k] = utf8ToBase64(String(v));
    else out[k] = v;
  }
  return out;
}

/** Server: decode incoming body except known plaintext keys. */
export function decodeBody<T extends Record<string, unknown>>(body: T): T {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(body)) {
    if (KEEP_PLAIN.has(k) || v === undefined || v === null || v === '') {
      out[k] = v;
      continue;
    }
    if (typeof v === 'string') {
      try { out[k] = base64ToUtf8(v); }
      catch { out[k] = v; } // not encoded — leave as-is
    } else {
      out[k] = v;
    }
  }
  return out as T;
}
