import Link from 'next/link';
import { CONFERENCES } from '@/lib/conferences';
import { getConferenceConfig } from '@/lib/getConfig';
import HomeHeroSlides from '@/components/HomeHeroSlides';
import './home.css';

export const metadata = {
  title: 'SCON Events · 2027 Scientific Congresses',
  description: 'Ten scientific congresses across Barcelona, Prague and Singapore in 2027 — addiction medicine, biotechnology, cardiology, food science, gastroenterology, neurology, obesity, pharmaceutical sciences, physical medicine and surgery.',
};

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

type Card = {
  slug: string;
  short: string;
  name: string;
  /** The landing hero's title in parts, e.g. "Global Congress on" /
      "Cardiology & Cardiovascular Medicine" / "2027". */
  titleLead: string;
  titleMain: string;
  titleYear: string;
  discipline: string;
  dates: string;
  city: string;
  country: string;
  photo: string;
  mainSite: string;
  tracks: number;
  accent: string;
  ink: string;
  month: number;
  day: number;
};

/* "June 24-25, 2027" → month index and first day, for ordering and the calendar. */
function parseDates(dates: string) {
  const m = dates.match(/^([A-Za-z]+)\s+(\d+)/);
  const month = m ? MONTHS.findIndex(x => x.toLowerCase().startsWith(m[1].toLowerCase().slice(0, 3))) : -1;
  return { month, day: m ? Number(m[2]) : 0 };
}

async function loadCards(): Promise<Card[]> {
  const cards = await Promise.all(CONFERENCES.map(async (meta) => {
    const conf = await getConferenceConfig(meta.slug);
    if (!conf) return null;
    const { month, day } = parseDates(conf.dates);
    return {
      slug: meta.slug,
      short: conf.short,
      name: conf.name,
      titleLead: conf.hero_title_lead,
      titleMain: conf.hero_title_main,
      titleYear: conf.hero_title_year,
      discipline: conf.discipline,
      dates: conf.dates,
      city: conf.city || conf.country,
      country: conf.country,
      photo: conf.hero_banner || conf.hero_image,
      mainSite: meta.mainSiteUrl,
      tracks: conf.tracks.length,
      accent: meta.theme.accentBtn ?? meta.theme.accent,
      ink: meta.theme.inkDeep ?? meta.theme.ink,
      month,
      day,
    } satisfies Card;
  }));
  return cards
    .filter((c): c is Card => c !== null)
    .sort((a, b) => a.month - b.month || a.day - b.day || a.short.localeCompare(b.short));
}

/* Where the people stand in each congress photo. Most sit right of centre —
   the banners leave room on the left for the landing page's headline — so a
   centred crop to a card or tile would cut them off at the edge. */
const PHOTO_FOCUS: Record<string, string> = {
  addiction: '74% 30%',
  biotechnology: '62% 50%',
  cardiology: '84% 30%',
  food: '72% 50%',
  gastroenterology: '82% 50%',
  neurology: '76% 35%',
  obesity: '50% 45%',
  pharmaceutical: '80% 55%',
  physicalmedicine: '74% 60%',
  surgery: '86% 35%',
};

/* The hero's photos: SCON's own past congresses, in public/assets/legacy.
   Only shots whose people stand centre or right — the heading covers the
   left third, so anyone there would be hidden behind it. */
const SCON_PHOTOS = [
  { src: '/assets/legacy/poster-hero.jpg', focus: '50% 40%', label: 'Poster session' },
  { src: '/assets/legacy/panel2.jpg', focus: '50% 45%', label: 'Expert panel discussion' },
  { src: '/assets/legacy/speaker.jpg', focus: '50% 35%', label: 'Plenary talk' },
  { src: '/assets/legacy/discussion2.jpg', focus: '50% 40%', label: 'Delegate Q&A' },
  { src: '/assets/legacy/networking2.jpg', focus: '50% 40%', label: 'Networking between sessions' },
  { src: '/assets/legacy/audience.jpg', focus: '50% 50%', label: 'A full session room' },
  { src: '/assets/legacy/awards.jpg', focus: '50% 50%', label: 'Presentation awards' },
];

/* SCON's past editions, as the main sites' /conferences-gallery lists them,
   and nineteen of their photos (copied into public/assets/past). */
const PAST_EDITIONS = [
  { id: 'ncph26', short: 'NCPH 2026', name: 'Nursing Care & Public Health Conference 2026', place: 'Charlotte, North Carolina, USA', when: 'March 26–27, 2026', photos: 128 },
  { id: 'ncph25', short: 'NCPH 2025', name: 'Nursing Care & Public Health Conference 2025', place: 'Orlando, Florida, USA', when: 'February 10–11, 2025', photos: 137 },
  { id: 'crvs25', short: 'CRVS 2025', name: 'Cancer Research & Vaccine Summit 2025', place: 'Waltham, Massachusetts, USA', when: 'March 27–28, 2025', photos: 212 },
];
/* size: "big" spans two columns and two rows, "wide" two columns. Two big,
   three wide and fourteen singles fill seven rows of a four-column grid. */
const PAST_PHOTOS: { file: string; edition: string; label: string; size?: 'big' | 'wide' }[] = [
  { file: 'n26-028', edition: 'ncph26', label: 'Delegates of the 2026 edition', size: 'big' },
  { file: 'n26-056', edition: 'ncph26', label: 'Keynote address' },
  { file: 'n26-010', edition: 'ncph26', label: 'Award presentation' },
  { file: 'ncc-019', edition: 'ncph25', label: 'Speaker session' },
  { file: 'ncc-116', edition: 'ncph25', label: 'Certificate of recognition' },
  { file: 'ncc-052', edition: 'ncph25', label: 'Group photograph', size: 'wide' },
  { file: 'cv-055', edition: 'crvs25', label: 'Delegates of the summit', size: 'big' },
  { file: 'cv-048', edition: 'crvs25', label: 'Panel discussion' },
  { file: 'cv-078', edition: 'crvs25', label: 'Award presentation' },
  { file: 'n26-074', edition: 'ncph26', label: 'Between sessions' },
  { file: 'ncc-087', edition: 'ncph25', label: 'Roundtable discussion' },
  { file: 'cv-204', edition: 'crvs25', label: 'Plenary talk', size: 'wide' },
  { file: 'ncc-074', edition: 'ncph25', label: 'Group photograph', size: 'wide' },
  { file: 'n26-084', edition: 'ncph26', label: 'Award presentation' },
  { file: 'n26-120', edition: 'ncph26', label: 'Certificate presentation' },
  { file: 'ncc-105', edition: 'ncph25', label: 'Award recipient' },
  { file: 'cv-123', edition: 'crvs25', label: 'Speaker session' },
  { file: 'cv-150', edition: 'crvs25', label: 'Delegate Q&A' },
  { file: 'cv-021', edition: 'crvs25', label: 'Discussion between sessions' },
];

/* "June 24-25, 2027" → "24-25" */
const dayRange = (c: Card) => c.dates.match(/\d+\s*[-–]\s*\d+/)?.[0].replace(/\s/g, '') ?? String(c.day);

/* Inline per card: each congress paints the shared layout in its own colours. */
const tone = (c: Card) => ({ '--c-accent': c.accent, '--c-ink': c.ink } as React.CSSProperties);

export default async function HomePage() {
  const cards = await loadCards();
  const cities = Array.from(new Set(cards.map(c => c.city)));
  const months = Array.from(new Set(cards.map(c => c.month))).sort((a, b) => a - b);

  return (
    <main className="sh">
      {/* ── Top bar ─────────────────────────────────────────── */}
      <header className="sh-top">
        <div className="sh-wrap sh-top-row">
          <a href="#top" className="sh-mark" aria-label="SCON Scientific Conferences home">
            {/* the white-lettered version: the bar behind it is dark */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logos/scon/scon-logo-white.svg" alt="SCON Scientific Conferences" width={90} height={58} />
          </a>
          <nav className="sh-top-nav" aria-label="Sections">
            <a href="#congresses">Congresses</a>
            <a href="#calendar">2027 Calendar</a>
          </nav>
          <a href="https://sconconferences.com/" className="sh-btn sh-btn-main" target="_blank" rel="noopener noreferrer">
            <i className="fas fa-globe" aria-hidden /> sconconferences.com
          </a>
          <a href="#congresses" className="sh-btn sh-btn-light">
            Find your congress <i className="fas fa-arrow-down" aria-hidden />
          </a>
        </div>
      </header>

      {/* ── Hero: every congress's photo in turn, the heading over it ── */}
      <HomeHeroSlides
        slides={SCON_PHOTOS}
        footer={
          <dl className="sh-stats">
            <div><dt>{cards.length}</dt><dd>Congresses</dd></div>
            <div><dt>{cities.length}</dt><dd>Host cities</dd></div>
            <div><dt>{cards.reduce((n, c) => n + c.tracks, 0)}</dt><dd>Scientific tracks</dd></div>
            <div><dt>Hybrid</dt><dd>In person or online</dd></div>
          </dl>
        }
      >
        <div className="sh-hero-text">
          <p className="sh-eyebrow"><span className="sh-dot" /> The 2027 congress season</p>
          <h1>
            {cards.length} scientific congresses.<br />
            {cities.length} host cities. <em>One network.</em>
          </h1>
          <p className="sh-lead">
            From addiction medicine to surgery, SCON brings clinicians, researchers and industry
            together for focused two-day congresses in {cities.slice(0, -1).join(', ')} and {cities[cities.length - 1]} —
            in person or online.
          </p>
          <div className="sh-hero-cta">
            <a href="#congresses" className="sh-btn sh-btn-primary">
              Explore the congresses <i className="fas fa-arrow-right" aria-hidden />
            </a>
            <a href="#calendar" className="sh-btn sh-btn-ghost">
              <i className="fas fa-calendar-days" aria-hidden /> See the 2027 calendar
            </a>
          </div>
        </div>
      </HomeHeroSlides>

      {/* ── Discipline ribbon ───────────────────────────────── */}
      <div className="sh-ribbon" aria-hidden>
        <div className="sh-ribbon-track">
          {[...cards, ...cards].map((c, i) => (
            <span key={i} style={tone(c)}><i />{c.discipline}</span>
          ))}
        </div>
      </div>

      {/* ── Congress cards ──────────────────────────────────── */}
      <section className="sh-sec" id="congresses">
        <div className="sh-wrap">
          <div className="sh-sec-head">
            <div>
              <p className="sh-kicker">01 · Congresses</p>
              <h2>Choose your congress</h2>
            </div>
            <p>Each congress runs its own scientific programme, call for abstracts and registration. Open one to see its sessions, speakers and passes.</p>
          </div>

          <div className="sh-cards">
            {cards.map(c => (
              <article key={c.slug} className="sh-card" style={tone(c)}>
                <Link href={`/${c.slug}`} className="sh-card-photo" aria-label={`${c.short} — ${c.name}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={c.photo} alt="" loading="lazy" style={{ objectPosition: PHOTO_FOCUS[c.slug] }} />
                  <span className="sh-card-date">
                    <b>{MONTHS[c.month]?.slice(0, 3)}</b>
                    {dayRange(c)}
                  </span>
                  <span className="sh-card-title">
                    <small>{c.titleLead}</small>
                    {c.titleMain} <em>{c.titleYear}</em>
                  </span>
                </Link>
                <div className="sh-card-body">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <div className="sh-card-id">
                    <img className="sh-card-logo" src={`/logos/${c.slug}.svg`} alt="" width={40} height={40} />
                    <div>
                      <b>{c.short}</b>
                      <small>
                        <i className="fas fa-location-dot" aria-hidden />
                        {c.city === c.country ? c.city : `${c.city}, ${c.country}`} · {c.tracks} tracks
                      </small>
                    </div>
                  </div>
                  <div className="sh-card-cta">
                    <Link href={`/${c.slug}`} className="sh-btn sh-btn-card">
                      View congress <i className="fas fa-arrow-right" aria-hidden />
                    </Link>
                    <a href={c.mainSite} className="sh-card-site" target="_blank" rel="noopener noreferrer">
                      Main site <i className="fas fa-arrow-up-right-from-square" aria-hidden />
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Past congresses ──────────────────────────────────── */}
      <section className="sh-sec sh-past" id="past">
        <div className="sh-wrap">
          <div className="sh-sec-head">
            <div>
              <p className="sh-kicker">02 · Past congresses</p>
              <h2>Moments from SCON congresses</h2>
            </div>
            <p>Keynotes, award ceremonies, panels and the people behind every edition — {PAST_EDITIONS.reduce((n, e) => n + e.photos, 0)} photos across our recent congresses.</p>
          </div>

          <div className="sh-past-eds">
            {PAST_EDITIONS.map((e, i) => (
              <div key={e.id} className="sh-past-ed">
                <span className="sh-past-ed-no">{String(i + 1).padStart(2, '0')}</span>
                <div>
                  <b>{e.name}</b>
                  <small><i className="fas fa-location-dot" aria-hidden />{e.place}</small>
                  <small><i className="fas fa-calendar" aria-hidden />{e.when} · {e.photos} photos</small>
                </div>
              </div>
            ))}
          </div>

          <div className="sh-past-grid">
            {PAST_PHOTOS.map(p => {
              const ed = PAST_EDITIONS.find(e => e.id === p.edition)!;
              return (
                <figure key={p.file} className={`sh-past-photo${p.size ? ` is-${p.size}` : ''}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`/assets/past/${p.file}.webp`} alt={`${p.label}, ${ed.name}`} loading="lazy" />
                  <figcaption>
                    <b>{p.label}</b>
                    <small>{ed.short} · {ed.place.split(',')[0]}</small>
                  </figcaption>
                </figure>
              );
            })}
          </div>

          <div className="sh-past-cta">
            <a href="https://sconconferences.com/gallery" className="sh-btn sh-btn-dark" target="_blank" rel="noopener noreferrer">
              Browse the full gallery <i className="fas fa-arrow-up-right-from-square" aria-hidden />
            </a>
          </div>
        </div>
      </section>

      {/* ── Calendar: the season on one board ──────────────────── */}
      <section className="sh-sec sh-season" id="calendar">
        <div className="sh-wrap">
          <div className="sh-sec-head">
            <div>
              <p className="sh-kicker">03 · Calendar</p>
              <h2>The 2027 season at a glance</h2>
            </div>
            <div className="sh-season-sum">
              <span><b>{cards.length}</b> congresses</span>
              <span><b>{months.length}</b> months</span>
              <span><b>{cities.length}</b> cities</span>
              <p>{MONTHS[months[0]]} to {MONTHS[months[months.length - 1]]} 2027 — pick your dates and plan the trip.</p>
            </div>
          </div>

          <div className="sh-tl">
            {months.map(m => {
              const inMonth = cards.filter(c => c.month === m);
              return (
                <div key={m} className="sh-tl-month">
                  {/* a desk-calendar page for the month */}
                  <div className="sh-tl-cal">
                    <span className="sh-tl-cal-top" aria-hidden><i /><i /></span>
                    <b>{MONTHS[m].slice(0, 3)}</b>
                    <span className="sh-tl-cal-year">2027</span>
                    <small>{inMonth.length} {inMonth.length === 1 ? 'congress' : 'congresses'}</small>
                  </div>
                  <ul className={inMonth.length > 2 ? 'is-crowded' : undefined}>
                    {inMonth.map(c => (
                      <li key={c.slug} style={tone(c)}>
                        <Link href={`/${c.slug}`} className="sh-tl-card">
                          {c === cards[0] && <span className="sh-tl-flag">Season opens</span>}
                          {c === cards[cards.length - 1] && <span className="sh-tl-flag">Season finale</span>}
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={c.photo} alt="" loading="lazy" style={{ objectPosition: PHOTO_FOCUS[c.slug] }} />
                          <span className="sh-tl-info">
                            <span className="sh-tl-days">{dayRange(c).replace('-', '–')}<small>{MONTHS[c.month].slice(0, 3)}</small></span>
                            <b>{c.short}</b>
                            <span className="sh-tl-disc">{c.discipline}</span>
                            <em><i className="fas fa-location-dot" aria-hidden />{c.city}</em>
                          </span>
                          <i className="fas fa-arrow-right sh-tl-go" aria-hidden />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Closing band ────────────────────────────────────── */}
      <section className="sh-end">
        <div className="sh-wrap sh-end-inner">
          <div>
            <h2>Share your research in 2027.</h2>
            <p>Present your work at any of the {cards.length} congresses — oral or poster, in person or online.</p>
          </div>
          <a href="#congresses" className="sh-btn sh-btn-primary">
            Pick a congress <i className="fas fa-arrow-right" aria-hidden />
          </a>
        </div>
      </section>

      <footer className="sh-foot">
        <div className="sh-wrap sh-foot-row">
          <span>© 2027 SCON Scientific Conferences</span>
          <nav aria-label="Congresses">
            {cards.map(c => <Link key={c.slug} href={`/${c.slug}`}>{c.short.replace(/\s*\d{4}$/, '')}</Link>)}
          </nav>
        </div>
      </footer>
    </main>
  );
}
