/* =============================================================================
   Minimal SMTP client for the Cloudflare Workers runtime
   -----------------------------------------------------------------------------
   Workers has no Node net module, so nodemailer and friends cannot run here.
   It does expose raw TCP through `cloudflare:sockets`, including STARTTLS,
   which is enough to speak SMTP directly.

   Deliberately small: one message, one recipient, AUTH LOGIN over STARTTLS on
   port 587. That is all the brochure letter needs. Port 25 is blocked on
   Workers; 587 is not.

   The import is dynamic because `cloudflare:sockets` does not exist in the
   Node runtime `next dev` uses — without that, local development crashes on
   module load rather than merely failing to send.
   ============================================================================= */

export type SmtpMessage = {
  host: string;
  port?: number;
  user: string;
  pass: string;
  from: string;
  fromName?: string;
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
};

type Sock = {
  readable: ReadableStream<Uint8Array>;
  writable: WritableStream<Uint8Array>;
  startTls: () => Sock;
  close: () => Promise<void>;
};

/** Reads whole SMTP replies, which may arrive split or several at a time. */
class Replies {
  private reader: ReadableStreamDefaultReader<Uint8Array>;
  private decoder = new TextDecoder();
  private buf = '';
  constructor(stream: ReadableStream<Uint8Array>) {
    this.reader = stream.getReader();
  }
  /** A reply ends at a line whose 4th character is a space, e.g. "250 OK". */
  async next(): Promise<{ code: number; text: string }> {
    for (;;) {
      const lines = this.buf.split('\r\n');
      for (let i = 0; i < lines.length - 1; i++) {
        if (lines[i].length >= 4 && lines[i][3] === ' ') {
          const text = lines.slice(0, i + 1).join('\n');
          this.buf = lines.slice(i + 1).join('\r\n');
          return { code: parseInt(text.slice(0, 3), 10), text };
        }
      }
      const { value, done } = await this.reader.read();
      if (done) throw new Error(`SMTP connection closed: ${this.buf.slice(0, 200)}`);
      this.buf += this.decoder.decode(value, { stream: true });
    }
  }
  release() { try { this.reader.releaseLock(); } catch { /* already gone */ } }
}

const b64 = (s: string) => {
  const bytes = new TextEncoder().encode(s);
  let bin = '';
  bytes.forEach(b => { bin += String.fromCharCode(b); });
  return btoa(bin);
};

/** Headers must not carry newlines, or a value could inject extra headers. */
const headerSafe = (s: string) => s.replace(/[\r\n]+/g, ' ').trim();

export async function sendMailSmtp(msg: SmtpMessage): Promise<{ ok: boolean; detail?: string }> {
  let connect: (addr: { hostname: string; port: number }, opts?: Record<string, unknown>) => Sock;
  try {
    const spec = 'cloudflare:sockets';
    ({ connect } = (await import(/* webpackIgnore: true */ spec)) as never);
  } catch {
    return { ok: false, detail: 'cloudflare:sockets unavailable (not the Workers runtime)' };
  }

  const port = msg.port ?? 587;
  let sock = connect({ hostname: msg.host, port }, { secureTransport: 'starttls', allowHalfOpen: false });
  let replies = new Replies(sock.readable);
  let writer = sock.writable.getWriter();
  const enc = new TextEncoder();
  const say = async (line: string) => { await writer.write(enc.encode(line + '\r\n')); };
  const expect = async (want: number, what: string) => {
    const r = await replies.next();
    if (r.code !== want) throw new Error(`${what}: ${r.text.slice(0, 200)}`);
    return r;
  };

  try {
    await expect(220, 'greeting');
    await say('EHLO sconevents.com');
    await expect(250, 'EHLO');

    await say('STARTTLS');
    await expect(220, 'STARTTLS');

    // hand the socket over to TLS; everything after this is encrypted
    replies.release();
    writer.releaseLock();
    sock = sock.startTls();
    replies = new Replies(sock.readable);
    writer = sock.writable.getWriter();

    await say('EHLO sconevents.com');
    await expect(250, 'EHLO (tls)');

    await say('AUTH LOGIN');
    await expect(334, 'AUTH LOGIN');
    await say(b64(msg.user));
    await expect(334, 'username');
    await say(b64(msg.pass));
    await expect(235, 'password');

    await say(`MAIL FROM:<${msg.from}>`);
    await expect(250, 'MAIL FROM');
    await say(`RCPT TO:<${msg.to}>`);
    const rcpt = await replies.next();
    if (rcpt.code !== 250 && rcpt.code !== 251) throw new Error(`RCPT TO: ${rcpt.text.slice(0, 200)}`);

    await say('DATA');
    await expect(354, 'DATA');

    const headers = [
      `From: ${msg.fromName ? `"${headerSafe(msg.fromName)}" ` : ''}<${msg.from}>`,
      `To: <${msg.to}>`,
      ...(msg.replyTo ? [`Reply-To: <${msg.replyTo}>`] : []),
      `Subject: ${headerSafe(msg.subject)}`,
      `Date: ${new Date().toUTCString()}`,
      'MIME-Version: 1.0',
      'Content-Type: text/html; charset=utf-8',
    ].join('\r\n');
    // a lone dot on its own line ends DATA, so any such line in the body is escaped
    const body = msg.html.replace(/\r?\n/g, '\r\n').replace(/^\./gm, '..');
    await say(`${headers}\r\n\r\n${body}\r\n.`);
    await expect(250, 'message body');

    await say('QUIT');
    return { ok: true };
  } catch (e) {
    return { ok: false, detail: e instanceof Error ? e.message : String(e) };
  } finally {
    try { replies.release(); } catch { /* ignore */ }
    try { writer.releaseLock(); } catch { /* ignore */ }
    try { await sock.close(); } catch { /* ignore */ }
  }
}
