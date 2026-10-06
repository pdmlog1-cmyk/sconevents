'use client';

/* Redesigned landing page, built to the layout the user supplied for
   /neurology: dark hero with the conference art, a facts strip, Why attend,
   Meet global experts, Sessions & topics, Choose your pass, Event journey,
   Download & prepare, FAQs and a closing CTA band.

   It is picked per conference by `landing_style: "v2"` in conference.json, so
   every other landing page keeps LandingClient untouched. The footer and the
   brochure modal are the shared components, unchanged.

   All copy and numbers come from the conference's own data — the mock-up's
   placeholder speakers, euro prices and dates are not used. Styles live in
   app/globals.css under .gx-*. */

import { useEffect, useRef, useState } from 'react';
import LandingLeadModal from '@/components/LandingLeadModal';
import LandingFooter from '@/components/LandingFooter';
import EarlyBirdBanner from '@/components/EarlyBirdBanner';
import type { ConferenceConfig, SpeakerRecord } from '@/lib/config';
import type { ConferenceTheme } from '@/lib/conferences';
import { getLogoSvg } from '@/lib/logoSvgs';

interface Props {
  conf: ConferenceConfig;
  mainSiteUrl: string;
  theme: ConferenceTheme;
  slug: string;
  logoName: string;
}

const LEGACY = '/assets/legacy';

/* Session tiles carry an icon each; tracks.json has no icons, so they are
   assigned by position, the way the mock-up shows them. */
const SESSION_ICONS = [
  'fa-brain', 'fa-head-side-virus', 'fa-shield-virus',
  'fa-person-walking', 'fa-wave-square', 'fa-dna',
  'fa-bolt', 'fa-microscope', 'fa-robot',
];

/* The two small collage frames cycle through these while the large photo
   stays put, so the section keeps moving without the layout shifting. */
const ROTATING_SHOTS = [
  `${LEGACY}/discussion.webp`,
  `${LEGACY}/panel.webp`,
  `${LEGACY}/question.webp`,
  `${LEGACY}/tabletalk.webp`,
];
const SHOT_INTERVAL_MS = 4500;

/* The main site's menu, item for item: two of the six open a short list
   rather than a page. */
const NAV: { label: string; href?: string; items?: { label: string; href: string }[] }[] = [
  { label: 'Sessions', href: '/sessions' },
  { label: 'Program', href: '/scientific-program' },
  { label: 'Gallery', href: '/conferences-gallery' },
  { label: 'People', items: [
    { label: 'Speakers', href: '/speakers' },
    { label: 'Committee', href: '/committee' },
  ] },
  { label: 'Info', items: [
    { label: 'Sponsor / Exhibitor', href: '/sponsor-exhibitor' },
    { label: 'Guidelines', href: '/guidelines' },
    { label: 'FAQs', href: '/faqs' },
  ] },
  { label: 'Venue', href: '/venue' },
];

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const initialsOf = (name: string) => {
  const core = name.replace(/^(Prof\.|Dr\.|Mr\.|Ms\.|Mrs\.)\s*/i, '').split(',')[0].trim();
  const isLetter = (c: string) => !!c && c.toLowerCase() !== c.toUpperCase();
  const words = core.split(/\s+/).filter(w => isLetter(w[0]));
  if (!words.length) return '';
  return (words[0][0] + (words.length > 1 ? words[words.length - 1][0] : '')).toUpperCase();
};

const firstClause = (s: string) => (s || '').split(';')[0].trim();

/** Whole days from now to each timestamp. Computed after mount: rendering it
    on the server would bake in the build time and mismatch on hydration. */
function useDaysLeft(stamps: number[]) {
  const [days, setDays] = useState<(number | null)[]>(() => stamps.map(() => null));
  useEffect(() => {
    const tick = () => setDays(stamps.map(ts => Math.ceil((ts - Date.now()) / 86400000)));
    tick();
    const id = setInterval(tick, 60000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stamps.join(',')]);
  return days;
}

/** True once the page has scrolled past the top, for the condensed header. */
function useStuck() {
  const [stuck, setStuck] = useState(false);
  useEffect(() => {
    const onScroll = () => setStuck(window.scrollY > 6);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return stuck;
}

/** Adds `is-in` once the element scrolls into view, for the CSS reveal. */
function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined' ||
        window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(es => {
      if (es.some(e => e.isIntersecting)) { setShown(true); io.disconnect(); }
    }, { rootMargin: '0px 0px -10% 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return { ref, cls: shown ? ' is-in' : '' };
}

/** One collage frame that cross-fades through ROTATING_SHOTS. `offset` keeps
    the two frames on different photos. */
function RotatingShot({ className, offset }: { className: string; offset: number }) {
  const [step, setStep] = useState(0);
  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    const id = setInterval(() => setStep(s => s + 1), SHOT_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);
  const active = (step + offset) % ROTATING_SHOTS.length;
  /* Only the frames that have actually been shown are in the DOM, so the first
     paint fetches one picture per frame rather than the whole set; the rest
     arrive as the rotation reaches them. */
  const [seen, setSeen] = useState<number[]>([offset % ROTATING_SHOTS.length]);
  useEffect(() => {
    setSeen(prev => (prev.includes(active) ? prev : [...prev, active]));
  }, [active]);
  return (
    <figure className={`gx-shot gx-shot-cycle ${className}`}>
      {ROTATING_SHOTS.map((src, i) => (seen.includes(i) ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img key={src} src={src} alt="" loading="lazy" className={i === active ? 'is-on' : undefined} />
      ) : null))}
    </figure>
  );
}

function Reveal({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const { ref, cls } = useReveal<HTMLDivElement>();
  return <div ref={ref} className={`gx-reveal${cls} ${className}`}>{children}</div>;
}

export default function NeuroLanding({ conf, mainSiteUrl, theme, slug, logoName }: Props) {
  const MAIN = mainSiteUrl;
  /* Four speakers, the ones with a portrait first, so the row opens on faces
     and any monogram falls at the end. */
  const speakers: SpeakerRecord[] = [...(conf.speaker_records ?? [])]
    .sort((a, b) => Number(!!b.photo) - Number(!!a.photo))
    .slice(0, 4);
  const tracks = conf.tracks.slice(0, 9);

  const brandDates = conf.brand_dates ?? (() => {
    const dm = conf.dates.match(/^(\w+)\s+([\d\-–]+),\s*\d+/);
    return dm ? `${dm[1].slice(0, 3)} ${dm[2]}` : conf.dates.replace(/,\s*\d{4}\s*$/, '');
  })();
  const brandPlace = conf.brand_place ?? conf.country;

  /* Event journey: the two dates a visitor can still act on, in date order.
     Acceptance and the conference itself are not deadlines for them, and
     the Important Dates box above still lists all four. */
  const JOURNEY_STOPS = ['Abstract Deadline', 'Early Bird Ends'];
  const journey = conf.key_dates
    .filter(([, , title]) => JOURNEY_STOPS.includes(title))
    .map(([day, monthYear, title, desc]) => {
      const [mon, yr] = monthYear.split(' ');
      return { day, mon, yr, monthYear, title, desc, ts: new Date(+yr, MONTHS.indexOf(mon.slice(0, 3)), +day).getTime() };
    })
    .sort((a, b) => a.ts - b.ts);
  const nextIdx = journey.findIndex(j => j.ts >= Date.now());
  const daysLeft = useDaysLeft(journey.map(j => j.ts));
  const roster = conf.speaker_records ?? [];
  const countries = roster.map(sp => sp.country).filter((c, i, all) => !!c && all.indexOf(c) === i);

  const openBrochure = (e: React.MouseEvent) => {
    e.preventDefault();
    window.dispatchEvent(new Event('lpb-open-brochure'));
  };

  const themeStyles = `
    :root {
      --ink: ${theme.ink};
      --paper: ${theme.paper};
      --accent: ${theme.accent};
      --muted: ${theme.muted};
      --ink-soft: ${theme.inkSoft};
      --accent-soft: ${theme.accentSoft};
      --paper-2: ${theme.paper2};
      --line: ${theme.line};
      --line-2: ${theme.line2};
      --ink-deep: ${theme.inkDeep ?? theme.ink};
      --accent-btn: ${theme.accentBtn ?? theme.accent};
      --paper-3: ${theme.paper3 ?? theme.paper2};
    }
    /* The global html/body overflow-x: clip turns off position: sticky for
       everything inside it, so this layout relaxes it. Each .gx section clips
       its own decoration, so nothing escapes sideways. */
    html, body { overflow-x: visible; }
  `;

  /* Pass prices come from the conference’s registration.json, the same way
     LandingClient reads them; the literals are the pre-data values. */
  const tier = (id: string, total: number) =>
    conf.price_tiers?.find(t => t.id === id)?.total ?? total;

  const heroDate = `${brandDates}  |  ${conf.city || conf.country}`.toUpperCase();
  const stuck = useStuck();
  const [menuOpen, setMenuOpen] = useState(false);
  /* The panel covers the page, so the page behind it must not scroll, and
     Escape has to close it like any other overlay. */
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMenuOpen(false); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [menuOpen]);

  return (
    <main className="lpb gx">
      <style dangerouslySetInnerHTML={{ __html: themeStyles }} />

      {conf.main_site_top_strip && <EarlyBirdBanner conf={conf} />}

      {/* ── Header ─────────────────────────────────────────────── */}
      <header className={`gx-head${stuck ? ' is-stuck' : ''}`}>
        <div className="gx-head-inner">
          {/* The main site's lockup, markup and classes unchanged, so the two
              headers carry the same emblem, name and date line. */}
          <a href={MAIN} className="brand brand-v3 gx-brand" aria-label={`${conf.short} home`}>
            {getLogoSvg(slug)
              ? <div className="brand-icon" dangerouslySetInnerHTML={{ __html: getLogoSvg(slug)! }} />
              : <div className="brand-icon"><img src={`/logos/${logoName}.svg`} alt="" width={80} height={80} /></div>}
            <div className="brand-divider" />
            <div className="brand-lockup">
              <div className="brand-line-1">{conf.discipline}-<span className="brand-year">20{conf.year_suffix}</span></div>
              <div className="brand-line-3">
                {brandDates}{brandPlace ? <><span className="brand-sep">|</span><span className="brand-country">{brandPlace}</span></> : null}
              </div>
            </div>
          </a>

          {/* A group opens on hover and on focus-within, so it works from the
              keyboard without a button that would have to claim a state. */}
          <nav className="gx-nav" aria-label="Primary">
            <ul>
              {NAV.map(item => (
                <li key={item.label} className={item.items ? 'gx-nav-group' : undefined}>
                  {item.items ? (
                    <>
                      <span className="gx-nav-trigger">
                        {item.label}<i className="fas fa-chevron-down" aria-hidden />
                      </span>
                      <ul className="gx-nav-sub">
                        {item.items.map(sub => (
                          <li key={sub.label}><a href={`${MAIN}${sub.href}`}>{sub.label}</a></li>
                        ))}
                      </ul>
                    </>
                  ) : (
                    <a href={`${MAIN}${item.href}`}>{item.label}</a>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          <button
            type="button"
            className={`gx-burger${menuOpen ? ' is-open' : ''}`}
            aria-expanded={menuOpen}
            aria-controls="gx-menu"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMenuOpen(o => !o)}
          >
            <span aria-hidden />
          </button>

          <a href={`${MAIN}/register`} className="gx-btn gx-btn-primary gx-head-cta">
            Register now <i className="fas fa-arrow-right" />
          </a>
        </div>
      </header>

      {/* Below the nav's breakpoint the same menu opens as a panel. */}
      <div id="gx-menu" className={`gx-menu${menuOpen ? ' is-open' : ''}`} hidden={!menuOpen}>
        <nav aria-label="Primary mobile">
          {NAV.map(item => (
            <div key={item.label} className="gx-menu-block">
              {item.items ? (
                <>
                  <p className="gx-menu-head">{item.label}</p>
                  {item.items.map(sub => (
                    <a key={sub.label} href={`${MAIN}${sub.href}`} onClick={() => setMenuOpen(false)}>{sub.label}</a>
                  ))}
                </>
              ) : (
                <a href={`${MAIN}${item.href}`} onClick={() => setMenuOpen(false)}>{item.label}</a>
              )}
            </div>
          ))}
        </nav>
        <div className="gx-menu-foot">
          <a href={`${MAIN}/call-for-abstract-submission`} className="gx-btn gx-btn-primary">Submit Abstract</a>
          <a href={`${MAIN}/register`} className="gx-btn gx-btn-outline">Register now</a>
        </div>
      </div>

      {/* ── Hero ───────────────────────────────────────────────── */}
      <section className={`gx-hero${conf.hero_banner ? ' gx-hero--banner' : ''}`}>
        <div className="gx-hero-media" aria-hidden>
          {/* A conference can supply its own hero artwork; it is cropped to the
              right so the artwork's own wording sits outside the frame and the
              text below stays the only copy on screen. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={conf.hero_banner || `${LEGACY}/speaker.jpg`} alt="" />
          <span className="gx-hero-veil" />
          {!conf.hero_banner && <span className="gx-hero-net" />}
        </div>

        <div className="gx-hero-inner">
          <p className="gx-hero-eyebrow"><span className="gx-hero-dot" aria-hidden />{heroDate}</p>
          <h1 className="gx-hero-title">
            {conf.hero_title_lead}<br />
            {conf.hero_title_main} <span className="gx-hero-year">{conf.hero_title_year}</span>
          </h1>
          <p className="gx-hero-tagline">{conf.about_heading}</p>
          <p className="gx-hero-sub">{conf.hero_subtitle}</p>
          <div className="gx-hero-cta">
            <a href={`${MAIN}/call-for-abstract-submission`} className="gx-btn gx-btn-primary">
              Submit Abstract <i className="fas fa-arrow-right" />
            </a>
            <a href={`${MAIN}/sessions`} className="gx-btn gx-btn-ghost">
              <i className="fas fa-play" /> Explore the programme
            </a>
          </div>

          <a href="#gx-facts" className="gx-hero-scroll">
            <span className="gx-hero-scroll-rail" aria-hidden />
            Scroll to explore
          </a>
        </div>

        <div className="gx-hero-side" aria-hidden>
          <span className="gx-hero-side-words">
            {(conf.theme_pillars ?? []).map(w => <em key={w}>{w}</em>)}
            <em>Better tomorrows</em>
          </span>
          <span className="gx-hero-side-note">A healthier, brighter tomorrow.</span>
          <span className="gx-hero-side-place">{conf.city || conf.country}<br />{conf.hero_title_year}</span>
        </div>
      </section>

      {/* ── Facts strip ────────────────────────────────────────── */}
      <section className="gx-facts" id="gx-facts">
        <Reveal className="gx-facts-inner">
          <div className="gx-fact" style={{ transitionDelay: '0ms' }}>
            <i className="fas fa-user-group" aria-hidden />
            <div>
              <strong>Global experts</strong>
              <span>from around the world</span>
            </div>
          </div>
          <div className="gx-fact" style={{ transitionDelay: '110ms' }}>
            <i className="fas fa-calendar-days" aria-hidden />
            <div>
              <strong>{(conf.stats?.[0]?.[0] || '2').replace(/^0/, '')} focused days</strong>
              <span>of science and collaboration</span>
            </div>
          </div>
          <div className="gx-fact" style={{ transitionDelay: '220ms' }}>
            <i className="fas fa-location-dot" aria-hidden />
            <div>
              <strong>{[conf.city, conf.country].filter(Boolean).join(', ')}</strong>
              <span>A historic city. A brighter future.</span>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── Meet global experts ────────────────────────────────── */}
      {speakers.length > 0 && (
        <section className="gx-sec gx-experts">
          <div className="gx-sec-head">
            <div>
              <h2 className="gx-h2">Meet global experts</h2>
              <p className="gx-sec-lead">
              {roster.length} speakers from {countries.length} countries, presenting across the two days.
            </p>
            </div>
            <a href={`${MAIN}/speakers`} className="gx-link">
              View all speakers <i className="fas fa-arrow-right" />
            </a>
          </div>
          <Reveal className={`gx-expert-grid gx-expert-grid--${speakers.length}`}>
            {speakers.map((sp, i) => (
              <article key={sp.name} className="gx-expert" style={{ transitionDelay: `${i * 90}ms` }}>
                <div className="gx-expert-photo">
                  {sp.photo
                    // eslint-disable-next-line @next/next/no-img-element
                    ? <img src={sp.photo} alt="" loading="lazy" />
                    : <span className="gx-expert-initials" aria-hidden>{initialsOf(sp.name)}</span>}
                  <span className="gx-expert-scrim" aria-hidden />
                </div>
                <div className="gx-expert-body">
                  <h3>{sp.name}</h3>
                  {firstClause(sp.affiliation) && <p>{firstClause(sp.affiliation)}</p>}
                  <div className="gx-expert-foot">
                    {sp.country && (
                      <span className="gx-expert-place">
                        <i className="fas fa-location-dot" aria-hidden /> {sp.country}
                      </span>
                    )}
                    <a href={`${MAIN}/speakers`} className="gx-round" aria-label={`See ${sp.name}`}>
                      <i className="fas fa-arrow-right" aria-hidden />
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </Reveal>

          {/* Every speaker the conference has, rolling past: the strip above
              shows four, this says how many more there are and where from. */}
          {roster.length > 4 && (
            <div className="gx-roll" aria-hidden>
              <div className="gx-roll-track">
                {[0, 1].map(pass => (
                  <ul key={pass}>
                    {roster.map(sp => (
                      <li key={`${pass}-${sp.name}`}>
                        <span>{sp.name}</span>
                        {sp.country && <em>{sp.country}</em>}
                      </li>
                    ))}
                  </ul>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* ── Sessions & topics ──────────────────────────────────── */}
      <section className="gx-sec gx-sessions">
        <div className="gx-sec-head">
          <div>
            <h2 className="gx-h2">Sessions &amp; topics</h2>
            <p className="gx-sec-lead">
              Nine of {conf.tracks.length} tracks running across the two days.
            </p>
          </div>
          <a href={`${MAIN}/sessions`} className="gx-link">
            View full programme <i className="fas fa-arrow-right" />
          </a>
        </div>
        <Reveal className="gx-topic-grid">
          {tracks.map(([title, tagline], i) => (
            <a key={title} href={`${MAIN}/sessions`} className="gx-topic" style={{ transitionDelay: `${i * 70}ms` }}>
              <span className="gx-topic-no" aria-hidden>{String(i + 1).padStart(2, '0')}</span>
              <span className="gx-topic-icon" aria-hidden>
                <i className={`fas ${SESSION_ICONS[i % SESSION_ICONS.length]}`} />
              </span>
              <span className="gx-topic-title">{title}</span>
              {tagline && <span className="gx-topic-sub">{tagline}</span>}
              <span className="gx-topic-go" aria-hidden><i className="fas fa-arrow-right" /></span>
            </a>
          ))}
        </Reveal>
      </section>

      {/* ── Why attend ─────────────────────────────────────────── */}
      <section className="gx-sec gx-why">
        <Reveal className="gx-why-grid">
          <span className="gx-why-rail" aria-hidden>{conf.short}</span>

          <div className="gx-why-text">
            <h2 className="gx-h2">Why <em>attend</em></h2>
            <p>{conf.about_lead}</p>
            <a href={`${MAIN}/sessions`} className="gx-link">
              Explore the programme <i className="fas fa-arrow-right" />
            </a>
          </div>

          {/* Fixed arch-topped lead photo, two cycling frames overlapping it */}
          <div className="gx-why-collage">
            <figure className="gx-shot gx-shot-lead">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`${LEGACY}/networking.webp`} alt="" loading="lazy" />
            </figure>
            <RotatingShot className="gx-shot-a" offset={0} />
            <RotatingShot className="gx-shot-b" offset={2} />
            <p className="gx-why-credo">Ideas.<br />Connections.<br />Impact.</p>
          </div>
        </Reveal>
      </section>

      {/* ── Choose your pass ───────────────────────────────────── */}
      <section className="gx-sec gx-pass">
        <div className="gx-pass-grid">
          <div className="gx-pass-intro">
            <h2 className="gx-h2">Choose your pass</h2>
            <p>
              Flexible options for every professional. Join in person or online and tailor
              your experience to your goals.
            </p>
            <p className="gx-pass-note">Early-bird through <strong>{conf.early_bird_deadline}</strong>.</p>
          </div>

          <div className="gx-pass-cards">
            <article className="gx-pass-card">
              <h3>Presenter (In-Person)</h3>
              <p className="gx-price"><span>$</span>{tier('presenter', 749)}</p>
              <ul>
                <li>Full conference access</li>
                <li>Present your research</li>
                <li>Networking events</li>
                <li>Certificate of attendance</li>
              </ul>
              <a href={`${MAIN}/register?category=presenter`} className="gx-btn gx-btn-outline">Select this option</a>
            </article>

            <article className="gx-pass-card gx-pass-card-pop">
              <span className="gx-pass-ribbon">Most popular</span>
              <h3>Listener (In-Person)</h3>
              <p className="gx-price"><span>$</span>{tier('listener', 499)}</p>
              <ul>
                <li>All scientific sessions</li>
                <li>Exhibition &amp; poster halls</li>
                <li>Networking events</li>
                <li>Conference materials</li>
                <li>Certificate of attendance</li>
              </ul>
              <a href={`${MAIN}/register?category=listener`} className="gx-btn gx-btn-primary">
                Register now <i className="fas fa-arrow-right" />
              </a>
            </article>

            <article className="gx-pass-card">
              <h3>Student / Trainee</h3>
              <p className="gx-price"><span>$</span>{tier('student', 349)}</p>
              <ul>
                <li>Full conference access</li>
                <li>Student networking</li>
                <li>Reduced fee</li>
                <li>Certificate of attendance</li>
              </ul>
              <a href={`${MAIN}/register?category=student`} className="gx-btn gx-btn-outline">Select this option</a>
            </article>
          </div>
        </div>
      </section>

      {/* ── Event journey ──────────────────────────────────────── */}
      <section className="gx-sec gx-journey">
        <div className="gx-sec-head">
          <div>
            <h2 className="gx-h2">Event journey</h2>
            <p className="gx-sec-lead">Two dates to put in the diary before {conf.city || conf.country}.</p>
          </div>
        </div>
        <Reveal className="gx-line">
          {journey.map((j, i) => {
            const left = daysLeft[i];
            const cta = j.title === 'Abstract Deadline'
              ? { label: 'Submit abstract', href: `${MAIN}/call-for-abstract-submission` }
              : { label: 'Register now', href: `${MAIN}/register` };
            return (
              <article
                key={j.title}
                className={`gx-stop${i === nextIdx ? ' is-next' : ''}${j.ts < Date.now() ? ' is-past' : ''}`}
                style={{ transitionDelay: `${i * 90}ms` }}
              >
                <span className="gx-stop-step" aria-hidden>Step {i + 1}</span>
                {i === nextIdx && <span className="gx-stop-tag">Next up</span>}
                {/* the ring closes over the last 90 days before the date */}
                <span
                  className="gx-stop-ring"
                  style={{ '--gx-progress': `${left === null ? 0 : Math.max(0, Math.min(100, (1 - left / 90) * 100))}%` } as React.CSSProperties}
                  aria-hidden
                >
                  <span className="gx-stop-dot">
                    <i className={`fas ${['fa-file-lines', 'fa-calendar-check'][i % 2]}`} />
                  </span>
                </span>
                <span className="gx-stop-count" suppressHydrationWarning>
                  {left === null ? (
                    <em>&nbsp;</em>
                  ) : left > 0 ? (
                    <><em>{left}</em> {left === 1 ? 'day' : 'days'} left</>
                  ) : (
                    <em className="is-closed">Closed</em>
                  )}
                </span>
                <strong>{j.mon} {j.day}, {j.yr}</strong>
                <span className="gx-stop-title">{j.title}</span>
                {j.desc && <span className="gx-stop-desc">{j.desc}</span>}
                <a href={cta.href} className={`gx-btn gx-stop-cta ${i === nextIdx ? 'gx-btn-primary' : 'gx-btn-outline'}`}>{cta.label}</a>
              </article>
            );
          })}
        </Reveal>
      </section>

      {/* ── Download & prepare ─────────────────────────────────── */}
      <section className="gx-sec gx-dl">
        <div className="gx-dl-row">
          <h2 className="gx-h2 gx-dl-title">Download &amp; prepare</h2>
          <a href="#" onClick={openBrochure} className="gx-dl-item">
            <i className="fas fa-file-pdf" aria-hidden />
            <span><strong>Conference brochure</strong><small>PDF</small></span>
            <i className="fas fa-arrow-down gx-dl-arrow" aria-hidden />
          </a>
          <a href={`${MAIN}/assets/abstract-template.docx`} className="gx-dl-item" download>
            <i className="fas fa-file-word" aria-hidden />
            <span><strong>Abstract template</strong><small>DOCX</small></span>
            <i className="fas fa-arrow-down gx-dl-arrow" aria-hidden />
          </a>
          <a href={`${MAIN}/assets/presentation-template.pptx`} className="gx-dl-item" download>
            <i className="fas fa-file-powerpoint" aria-hidden />
            <span><strong>Sample presentation</strong><small>PPTX</small></span>
            <i className="fas fa-arrow-down gx-dl-arrow" aria-hidden />
          </a>
          <a href={`${MAIN}/venue`} className="gx-dl-item">
            <i className="fas fa-map-location-dot" aria-hidden />
            <span><strong>Venue &amp; travel guide</strong><small>Online</small></span>
            <i className="fas fa-arrow-up-right-from-square gx-dl-arrow" aria-hidden />
          </a>
        </div>
      </section>

      {/* ── FAQs ───────────────────────────────────────────────── */}
      <section className="gx-sec gx-faq">
        <div className="gx-sec-head">
          <h2 className="gx-h2">Frequently asked questions</h2>
          <a href={`${MAIN}/faqs`} className="gx-link">
            View all FAQs <i className="fas fa-arrow-right" />
          </a>
        </div>
        <div className="gx-faq-grid">
          {[
            ['What should I bring to the conference?',
              'Bring a photo ID for check-in, your registration confirmation, and printed or digital copies of your poster or slides if you are presenting.'],
            ['What is the process for completing my registration?',
              `Open the Register page on the main site, choose your participation mode and category, and submit the secure online form. Early-bird applies until ${conf.early_bird_deadline}.`],
            ['Is the hotel included in my registration fee?',
              'No — the hotel is a separate optional add-on. You can book at the negotiated rate inside the registration form once the venue is announced.'],
            ['Will the sessions be available online?',
              'Yes. Every session is streamed live for virtual participants, and registered attendees can catch up on recordings afterwards.'],
            ['How many abstracts can I submit?',
              'Each author may submit up to two abstracts, in oral, poster, or a combination of both formats.'],
            ['Does the conference offer travel grants?',
              'No travel, food or accommodation funding is offered. The 50% early-bird and 10% group rate are the available cost-savers.'],
          ].map(([q, a]) => (
            <details key={q} className="gx-faq-row">
              <summary><span>{q}</span><i className="fas fa-plus" aria-hidden /></summary>
              <p>{a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* ── Closing CTA ────────────────────────────────────────── */}
      <section className={`gx-end${conf.cta_banner ? ' gx-end--banner' : ''}`}>
        <div className="gx-end-media" aria-hidden>
          {/* Host-city artwork when the conference supplies one, otherwise a
              photo from a previous edition. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={conf.cta_banner || `${LEGACY}/audience3.jpg`} alt="" loading="lazy" />
          <span className="gx-end-veil" />
        </div>
        <div className="gx-end-inner">
          <div>
            <h2>Your next breakthrough<br />starts here.</h2>
            <p>Join leading minds in {conf.city || conf.country} and be part of what&apos;s next in {conf.discipline.toLowerCase()} and neuroscience.</p>
            <div className="gx-hero-cta">
              <a href={`${MAIN}/register`} className="gx-btn gx-btn-primary">
                Register now <i className="fas fa-arrow-right" />
              </a>
              <a href={`${MAIN}/sessions`} className="gx-btn gx-btn-ghost">
                <i className="fas fa-play" /> Explore the programme
              </a>
            </div>
          </div>
          <div className="gx-end-meta">
            <span>{heroDate}</span>
            <strong>{conf.name} {conf.hero_title_year}</strong>
          </div>
        </div>
      </section>

      <LandingFooter
        conf={conf}
        mainSiteUrl={MAIN}
        slug={slug}
        logoName={logoName}
        brandDates={brandDates}
        brandPlace={brandPlace}
      />

      <LandingLeadModal conf={conf} mainSiteUrl={MAIN} slug={slug} />
    </main>
  );
}
