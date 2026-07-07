/* =============================================================================
   Web token generator
   -----------------------------------------------------------------------------
   Format: WCAB-YYYYMMDD-HHmmss-XXXXXX
     - YYYYMMDD-HHmmss → UTC date/time in compact, sortable form
     - XXXXXX           → 6 random base36 chars (~2 billion combinations)
   Total uniqueness: timestamp (1-second resolution) × ~2.18e9 random space.
   Collision in practice = effectively zero.
   ============================================================================= */

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // omit 0/O/1/I/L for readability

function pad(n: number, w: number): string {
  return n.toString().padStart(w, '0');
}

function randomSuffix(len = 6): string {
  let s = '';
  for (let i = 0; i < len; i++) {
    s += ALPHABET.charAt(Math.floor(Math.random() * ALPHABET.length));
  }
  return s;
}

/**
 * Generate a registration / payment web-token.
 *
 *   generateWebToken('REG')  → "REG-20260508-170134-K3F2A9"
 *   generateWebToken('PAY')  → "PAY-20260508-170201-X8M2J4"
 *
 * Defaults to "WCAB" prefix when called with no args.
 */
export function generateWebToken(prefix = 'WCAB'): string {
  const d = new Date();
  const ymd = `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1, 2)}${pad(d.getUTCDate(), 2)}`;
  const hms = `${pad(d.getUTCHours(), 2)}${pad(d.getUTCMinutes(), 2)}${pad(d.getUTCSeconds(), 2)}`;
  return `${prefix}-${ymd}-${hms}-${randomSuffix(6)}`;
}

/**
 * Validate that a string looks like a token we generated. Used by API routes
 * to reject obviously bogus inputs before doing storage lookups.
 */
export function isValidWebToken(s: unknown): s is string {
  return typeof s === 'string' && /^[A-Z]{2,8}-\d{8}-\d{6}-[A-Z0-9]{4,12}$/.test(s);
}
