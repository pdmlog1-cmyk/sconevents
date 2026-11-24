/* =============================================================================
   Abstract, early-bird and conference dates, read live from each main site
   -----------------------------------------------------------------------------
   The main sites' home pages are the source of truth for these two deadlines
   and change without a deploy here, so the landing pages read them at request
   time. The main sites have no dates API, so they are read from the Important
   Dates block: "31 Oct 2026 Abstract Deadline", "31 Oct 2026 Early Bird ...",
   and the conference dates from the "Dates June 22–23, 2027" line (the main
   sites' own "Conference Opens" box is not used: it has lagged behind on some
   of them).

   A reading is kept in the Workers cache for 10 minutes, so a change on a main
   site shows here within about that long and visitors do not each pay for the
   fetch. The last good reading is kept for 30 days: if a main site is down or
   its wording changes, the page keeps the last dates it saw, and failing that
   the ones in data/<slug>/. A failed read is retried after a minute.

   The Cache API does not exist under `next dev`, where every request reads the
   main site afresh.
   ============================================================================= */

import type { ConferenceConfig, KeyDate } from '@/lib/config';

export type LiveDates = {
  /** e.g. "31 Oct 2026" */
  abstract?: string;
  earlyBird?: string;
  /** conference dates, e.g. { month: "June", start: 22, end: 23, year: 2027 } */
  event?: EventDates;
};

export type EventDates = { month: string; start: number; end: number; year: number };

const FRESH_SECONDS = 600;
const RETRY_SECONDS = 60;
const LAST_GOOD_SECONDS = 30 * 24 * 60 * 60;
const FETCH_TIMEOUT_MS = 2500;

const MONTHS: Record<string, string> = {
  Jan: 'January', Feb: 'February', Mar: 'March', Apr: 'April', May: 'May', Jun: 'June',
  Jul: 'July', Aug: 'August', Sep: 'September', Oct: 'October', Nov: 'November', Dec: 'December',
};

/** Only a real date in a plausible year gets through to the page. */
function validDate(day: string, mon: string, year: string): string | undefined {
  const d = Number(day);
  const y = Number(year);
  if (!MONTHS[mon] || d < 1 || d > 31 || y < 2026 || y > 2030) return undefined;
  return `${d} ${mon} ${y}`;
}

export function parseMainSiteDates(html: string): LiveDates {
  const text = html
    .replace(/<script[\s\S]*?<\/script>/g, ' ')
    .replace(/<style[\s\S]*?<\/style>/g, ' ')
    .replace(/<!-- -->/g, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ');
  const read = (label: string) => {
    const m = text.match(new RegExp(`(\\d{1,2}) ([A-Z][a-z]{2}) (20\\d\\d) ${label}`));
    return m ? validDate(m[1], m[2], m[3]) : undefined;
  };
  return { abstract: read('Abstract Deadline'), earlyBird: read('Early Bird'), event: readEvent(text) };
}

const LONG_MONTHS = Object.values(MONTHS);

/** "Dates June 22–23, 2027" → { month: "June", start: 22, end: 23, year: 2027 } */
function readEvent(text: string): EventDates | undefined {
  const m = text.match(new RegExp(`Dates (${LONG_MONTHS.join('|')}) (\\d{1,2})\\s*[\u2013\u2014-]\\s*(\\d{1,2}), (20\\d\\d)`));
  if (!m) return undefined;
  const start = Number(m[2]);
  const end = Number(m[3]);
  const year = Number(m[4]);
  if (start < 1 || end > 31 || end < start || end - start > 6 || year < 2026 || year > 2030) return undefined;
  return { month: m[1], start, end, year };
}

/* The Workers cache only takes URLs; these never go over the network. */
const cacheKey = (slug: string, kind: 'fresh' | 'good') =>
  new Request(`https://live-dates.internal/${slug}/${kind}`);

const workersCache = () =>
  (globalThis as unknown as { caches?: { default?: Cache } }).caches?.default;

async function remember(cache: Cache, key: Request, dates: LiveDates, seconds: number) {
  await cache.put(key, new Response(JSON.stringify(dates), {
    headers: { 'Content-Type': 'application/json', 'Cache-Control': `public, max-age=${seconds}` },
  }));
}

async function readMainSite(mainSiteUrl: string): Promise<LiveDates> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const r = await fetch(`${mainSiteUrl}/`, {
      signal: controller.signal,
      cache: 'no-store',
      headers: { 'User-Agent': 'SCON-landing-date-sync/1.0' },
    });
    if (!r.ok) return {};
    return parseMainSiteDates(await r.text());
  } catch {
    return {};
  } finally {
    clearTimeout(timer);
  }
}

export async function getLiveDates(slug: string, mainSiteUrl: string): Promise<LiveDates> {
  const cache = workersCache();
  if (!cache) return readMainSite(mainSiteUrl);

  try {
    const fresh = await cache.match(cacheKey(slug, 'fresh'));
    if (fresh) return (await fresh.json()) as LiveDates;

    const read = await readMainSite(mainSiteUrl);
    const good = await cache.match(cacheKey(slug, 'good'));
    const last = good ? ((await good.json()) as LiveDates) : {};
    const dates: LiveDates = {
      abstract: read.abstract ?? last.abstract,
      earlyBird: read.earlyBird ?? last.earlyBird,
      event: read.event ?? last.event,
    };
    const complete = !!read.abstract && !!read.earlyBird && !!read.event;
    await remember(cache, cacheKey(slug, 'fresh'), dates, complete ? FRESH_SECONDS : RETRY_SECONDS);
    if (read.abstract || read.earlyBird || read.event) await remember(cache, cacheKey(slug, 'good'), dates, LAST_GOOD_SECONDS);
    return dates;
  } catch {
    // a cache fault must not take the page down; the data files still have dates
    return {};
  }
}

/** "31 Oct 2026" → "October 31, 2026", the form the data files use. */
const longDate = (d: string) => {
  const [day, mon, year] = d.split(' ');
  return `${MONTHS[mon]} ${day}, ${year}`;
};

function withKeyDate(keyDates: KeyDate[], title: string, date?: string): KeyDate[] {
  if (!date) return keyDates;
  const [day, mon, year] = date.split(' ');
  return keyDates.map(k => (k[2] === title ? [day.padStart(2, '0'), `${mon} ${year}`, k[2], k[3]] as KeyDate : k));
}

function withEventDates(conf: ConferenceConfig, ev?: EventDates): ConferenceConfig {
  if (!ev) return conf;
  const mon = ev.month.slice(0, 3);
  const mm = String(LONG_MONTHS.indexOf(ev.month) + 1).padStart(2, '0');
  const dd = String(ev.start).padStart(2, '0');
  const time = (conf.start_date_iso.split('T')[1]) || '09:00:00';
  return {
    ...conf,
    dates: `${ev.month} ${ev.start}-${ev.end}, ${ev.year}`,
    dateline: `${ev.month.toUpperCase()} ${ev.start}\u2013${ev.end}, ${ev.year}`,
    dates_short: `${mon} ${ev.year}`,
    start_date_iso: `${ev.year}-${mm}-${dd}T${time}`,
    brand_dates: conf.brand_dates ? `${ev.month} ${ev.start}\u2013${ev.end}` : conf.brand_dates,
    key_dates: conf.key_dates.map(k => (k[2] === 'Conference Opens' ? [dd, `${mon} ${ev.year}`, k[2], k[3]] as KeyDate : k)),
  };
}

export function applyLiveDates(conf: ConferenceConfig, live: LiveDates): ConferenceConfig {
  return withEventDates({
    ...conf,
    abstract_deadline: live.abstract ? longDate(live.abstract) : conf.abstract_deadline,
    early_bird_deadline: live.earlyBird ? longDate(live.earlyBird) : conf.early_bird_deadline,
    key_dates: withKeyDate(
      withKeyDate(conf.key_dates, 'Abstract Deadline', live.abstract),
      'Early Bird Ends',
      live.earlyBird,
    ),
  }, live.event);
}
