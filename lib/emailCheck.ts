/* =============================================================================
   Email address verification (ZeroBounce)
   -----------------------------------------------------------------------------
   Used before the brochure letter goes out, so a mistyped or fake address does
   not burn a send and dent the sending domain's reputation.

   On what counts as a refusal
   ---------------------------
   Only a positive bad verdict blocks the letter. ZeroBounce also answers
   "unknown" when it cannot complete a check, which happens for perfectly real
   mailboxes: meetings.llc greylists, so the conferences' own addresses come
   back unknown/greylisted. Refusing those would block the very people the
   letter is for, so unknown and catch-all are treated as send.

   The same applies when the API itself fails or runs out of credit — the
   letter still goes. Letting an outage silently stop every email would be a
   worse failure than mailing the occasional bad address.
   ============================================================================= */

/** Verdicts that mean the address is genuinely not worth mailing. */
const REFUSE = new Set(['invalid', 'spamtrap', 'abuse', 'do_not_mail']);

export type EmailVerdict = {
  /** Whether the letter should be sent. */
  send: boolean;
  /** ZeroBounce status, or a short reason when the check did not run. */
  status: string;
  subStatus?: string;
};

export async function verifyEmail(email: string): Promise<EmailVerdict> {
  const key = process.env.ZEROBOUNCE_API_KEY;
  if (!key) return { send: true, status: 'not-configured' };
  if (!email) return { send: false, status: 'empty' };

  const url = `https://api.zerobounce.net/v2/validate?api_key=${encodeURIComponent(key)}`
    + `&email=${encodeURIComponent(email)}&ip_address=`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const r = await fetch(url, { signal: controller.signal });
    if (!r.ok) return { send: true, status: `http-${r.status}` };
    const data = (await r.json()) as { status?: string; sub_status?: string };
    const status = (data.status || '').toLowerCase();
    return { send: !REFUSE.has(status), status, subStatus: data.sub_status || undefined };
  } catch (e) {
    // timeout, network trouble, malformed reply — none of them are evidence
    // against the address, so the letter goes
    return { send: true, status: e instanceof Error && e.name === 'AbortError' ? 'timeout' : 'error' };
  } finally {
    clearTimeout(timer);
  }
}
