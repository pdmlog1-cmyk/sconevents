'use client';

/* Variant B — Reference-style comprehensive layout.
   Wide hero (text left, contact card right). Multiple high-density sections:
   benefits grid, sessions chips, pricing tiers, sponsor+exhibitor, dates,
   downloads, FAQ, newsletter, full footer + sticky deadline ribbon. */
import { useState, useEffect } from 'react';
import LandingLeadModal from '@/components/LandingLeadModal';
import InfoStrip from '@/components/InfoStrip';
import type { ConferenceConfig } from '@/lib/config';
import type { ConferenceTheme } from '@/lib/conferences';
import { getLogoSvg } from '@/lib/logoSvgs';

interface LandingClientProps {
  conf: ConferenceConfig;
  mainSiteUrl: string;
  theme: ConferenceTheme;
  slug: string;
}

// Map conference slug prefix to logo filename
function getLogoName(slug: string): string {
  const prefix = slug.split('-')[0].toLowerCase();
  const validLogos = [
    'addiction', 'biotechnology', 'cardiology', 'food', 'gastroenterology',
    'neurology', 'obesity', 'pharmaceutical', 'physicalmedicine', 'surgery'
  ];
  return validLogos.includes(prefix) ? prefix : 'cardiology';
}
/* Previous-edition imagery pool — sourced directly from the live
   cardiology-conference.com main site (hero + carousel /assets/legacy).
   Each bento tile cycles through this pool every ~12 s with crossfade.
   Reused across every conference landing for visual consistency. */
const LEGACY = 'https://cardiology-conference.com/assets/legacy';
const BENTO_POOL = [
  'speaker.jpg', 'audience.jpg', 'panel.jpg', 'networking.jpg', 'awards.jpg',
  'audience3.jpg', 'applause.jpg', 'networking2.jpg', 'panel2.jpg', 'podium.jpg',
  'discussion.jpg', 'registration.jpg', 'smile.jpg', 'question.jpg', 'audience2.jpg',
].map(name => `${LEGACY}/${name}`);

const BENTO_TICK_MS = 12000;     // image swap interval
const BENTO_STAGGER_MS = 1500;   // delay between adjacent tile swaps
const BENTO_FIRST_MS = 8000;     // delay before the first swap of tile-0

/* Single bento tile: stacks every pool image, fades opacity between them.
   All images mount once (loading="lazy" only fetches as the tile enters
   viewport) so subsequent ticks are flash-free from the HTTP cache. */
function BentoTile({
  pool, startIdx, className, href,
}: {
  pool: string[];
  startIdx: number;
  className: string;
  href: string;
}) {
  const [idx, setIdx] = useState(startIdx % pool.length);

  useEffect(() => {
    const firstDelay = BENTO_FIRST_MS + startIdx * BENTO_STAGGER_MS;
    let intervalId: ReturnType<typeof setInterval> | undefined;
    const startId = setTimeout(() => {
      setIdx(i => (i + 1) % pool.length);
      intervalId = setInterval(
        () => setIdx(i => (i + 1) % pool.length),
        BENTO_TICK_MS,
      );
    }, firstDelay);
    return () => {
      clearTimeout(startId);
      if (intervalId) clearInterval(intervalId);
    };
  }, [pool.length, startIdx]);

  return (
    <a href={href} className={className} aria-label="View past editions">
      {pool.map((src, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={i}
          src={src}
          alt=""
          loading="lazy"
          aria-hidden={i !== idx}
          className={`lpb-bento-img${i === idx ? ' is-active' : ''}`}
        />
      ))}
    </a>
  );
}

export default function LandingClient({ conf, mainSiteUrl, theme, slug }: LandingClientProps) {
  const MAIN = mainSiteUrl;

  // Dynamic theme CSS variables
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
    }
  `;

  return (
    <main className="lpb">
      <style dangerouslySetInnerHTML={{ __html: themeStyles }} />
      <InfoStrip baseUrl={MAIN} conf={conf} />

      {/* Header — wraps content in .container so brand + nav left-edge align
          exactly with the InfoStrip "Days to Event" cell above.
          (#1) Nav lives in its own dark bar; same .container so it lines up.
          (#2) Logo matches main site — full BrandLogo emblem + lockup.
          (#3) Two "Register Now" CTAs collapsed: header CTA is "Submit Abstract"
               since the InfoStrip already shows Register Now. */}
      <header className="lpb-head">
        <div className="lpb-head-row container">
          <a href={MAIN} className="brand brand-v3" aria-label={`${conf.short} home`}>
            {getLogoSvg(slug)
              ? <div className="brand-icon" dangerouslySetInnerHTML={{ __html: getLogoSvg(slug)! }} />
              : <div className="brand-icon"><img src={`/logos/${getLogoName(slug)}.svg`} alt={`${conf.short} logo`} width={80} height={80} /></div>}
            <div className="brand-divider" />
            <div className="brand-lockup">
              <div className="brand-line-1">{conf.discipline}-<span className="brand-year">20{conf.year_suffix}</span></div>
              <div className="brand-line-3">
                {(() => {
                  const dm = conf.dates.match(/^(\w+)\s+([\d\-]+),\s*\d+/);
                  const ds = dm ? `${dm[1].slice(0, 3)} ${dm[2]}` : conf.dates.replace(/,\s*\d{4}\s*$/, '');
                  return <>{ds}{conf.country ? <><span className="brand-sep">|</span><span className="brand-country">{conf.country}</span></> : null}</>;
                })()}
              </div>
            </div>
          </a>

          {/* Inline nav — sits in the same row as logo + Submit Abstract */}
          <nav className="lpb-nav-inline" aria-label="Primary">
            <a href={`${MAIN}/sessions`}><i className="fas fa-microphone-lines" /> Sessions</a>
            <a href={`${MAIN}/speakers`}><i className="fas fa-user-tie" /> Speakers</a>
            <a href={`${MAIN}/sponsor-exhibitor`}><i className="fas fa-handshake-angle" /> Sponsor</a>
            <a href={`${MAIN}/guidelines`}><i className="fas fa-book-open" /> Guidelines</a>
            <a href={`${MAIN}/faqs`}><i className="fas fa-circle-question" /> FAQs</a>
          </nav>

          <a href={`${MAIN}/call-for-abstract-submission`} className="btn btn-primary lpb-head-cta">
            <i className="fas fa-file-signature" /> Submit Abstract
          </a>
        </div>
      </header>

      {/* Hero — refined two-column with anatomical line-art on the right.
          Left: title block + CTAs + thin contact line.
          Right: large hand-drawn heart + ECG illustration, no card. */}
      <section className="lpb-hero lpb-hero-art-wrap">
        <div className="lpb-hero-text">
          {/* All elements now share the same left edge — no quote indents,
              consistent vertical rhythm, hairline rules above and below the
              dateline + contact line for clear chapter-mark feel. */}
          <p className="lpb-dateline">
            <span className="lpb-dateline-tag">{conf.short}</span>
            <span className="lpb-dateline-sep" aria-hidden>·</span>
            <span>{conf.dates.replace(/, \d{4}$/, '').toUpperCase()}</span>
            <span className="lpb-dateline-sep" aria-hidden>·</span>
            <span>{conf.country.toUpperCase()}</span>
          </p>

                    {/* Conference name driven by conf.hero_title_* — works for every
              discipline, not just cardiology. */}
          <h1 className="lpb-h1">
            {conf.hero_title_lead}<br />
            <span className="lpb-h1-name">{conf.hero_title_main}<span className="lpb-h1-year">-{conf.hero_title_year}</span></span>
          </h1>

          <p className="lpb-theme-line">
            <em>&ldquo;{conf.theme_primary}.&rdquo;</em>
          </p>

          <p className="lpb-sub">{conf.hero_subtitle}</p>

          <div className="lpb-cta">
            <a href={`${MAIN}/register`} className="btn btn-primary"><i className="fas fa-ticket" /> Book Your Slot!</a>
            <button
              type="button"
              onClick={() => window.dispatchEvent(new Event('lpb-open-brochure'))}
              className="btn btn-outline-ink"
            >
              <i className="fas fa-file-arrow-down" /> Download Brochure
            </button>
          </div>

          {/* Contact chips — two pill cards, label + icon + value, hover lift */}
          <div className="lpb-contact-chips">
            <a href={`mailto:${conf.email}`} className="lpb-contact-chip" aria-label={`Email ${conf.email}`}>
              <span className="lpb-contact-chip-icon"><i className="fas fa-envelope" /></span>
              <span className="lpb-contact-chip-body">
                <span className="lpb-contact-chip-label">Email us</span>
                <span className="lpb-contact-chip-value">{conf.email}</span>
              </span>
              <span className="lpb-contact-chip-arrow" aria-hidden><i className="fas fa-arrow-right" /></span>
            </a>
            <a href={`tel:${conf.phone.replace(/\D/g, '')}`} className="lpb-contact-chip" aria-label={`Call ${conf.phone}`}>
              <span className="lpb-contact-chip-icon"><i className="fas fa-phone" /></span>
              <span className="lpb-contact-chip-body">
                <span className="lpb-contact-chip-label">Call us</span>
                <span className="lpb-contact-chip-value">{conf.phone}</span>
              </span>
              <span className="lpb-contact-chip-arrow" aria-hidden><i className="fas fa-arrow-right" /></span>
            </a>
          </div>
        </div>      </section>

      {/* From previous editions — asymmetric bento grid. Seven tiles,
          each cycling through a shared pool of cardiology-conference.com
          /assets/legacy photos every ~12 s with a 1.5 s stagger so they
          don't crossfade in unison. No heading or labels. */}
      <section className="lpb-band lpb-bento-band" aria-label="Photos from previous editions">
        <div className="lpb-bento">
          {[0, 1, 2, 3, 4, 5, 6].map(i => (
            <BentoTile
              key={i}
              pool={BENTO_POOL}
              startIdx={i * 2}   /* spread starts across the pool */
              className={`lpb-bento-tile lpb-bento-t${i + 1}`}
              href={`${MAIN}/conferences-gallery`}
            />
          ))}
        </div>
      </section>

      {/* §01 Sessions — first content section after the hero
          (Welcome / Conference Overview has been removed per request) */}
      <section className="lpb-band">
        <div className="lpb-section-head">
          <span className="lpb-num">01</span>
          <h2>Sessions &amp; topics.</h2>
        </div>
        <div className="lpb-topics">
          {conf.tracks.slice(0, 6).map(([title, tagline], i) => (
            <article key={title} className="lpb-topic">
              <div className="lpb-topic-num">
                <span>{String(i + 1).padStart(2, '0')}</span>
                <span className="lpb-topic-label">Track</span>
              </div>
              <h4>{title}</h4>
              <p>{tagline}</p>
              <a href={`${MAIN}/sessions`} className="lpb-topic-link">
                Explore <i className="fas fa-arrow-up-right-from-square" />
              </a>
            </article>
          ))}
        </div>
        <div className="lpb-center">
          <a href={`${MAIN}/sessions`} className="btn btn-ink">
            View all {conf.tracks.length} tracks <i className="fas fa-arrow-right" />
          </a>{' '}
          <a href={`${MAIN}/call-for-abstract-submission`} className="btn btn-ghost">
            Submit your abstract
          </a>
        </div>
      </section>

      {/* §02 Registration — redesigned: 3 detailed tier cards with icons,
          feature lists and a featured middle tier. Bottom note covers group +
          virtual rates without cluttering the cards themselves. */}
      <section className="lpb-band">
        <div className="lpb-section-head">
          <span className="lpb-num">02</span>
          <h2>Pick your seat.</h2>
          <p className="lpb-section-sub">
            Early-bird through <strong>{conf.early_bird_deadline}</strong>.
            All fees include two-day access, kit, lunches and the welcome reception.
          </p>
        </div>

        <div className="lpb-reg-grid">
          {/* Student */}
          <article className="lpb-reg-card">
            <div className="lpb-reg-icon"><i className="fas fa-graduation-cap" /></div>
            <div className="lpb-reg-head">
              <span className="lpb-reg-cat">Student / Young Researcher</span>
              <span className="lpb-reg-save">Save 50%</span>
            </div>
            <div className="lpb-reg-price">
              <span className="lpb-reg-cur">$</span>349
              <s>$699</s>
            </div>
            <p className="lpb-reg-desc">Valid full-time student ID required at check-in.</p>
            <ul className="lpb-reg-feats">
              <li>All keynote &amp; plenary sessions</li>
              <li>14 parallel tracks + posters</li>
              <li>Conference kit &amp; proceedings</li>
              <li>Lunches &amp; refreshments</li>
              <li>Welcome reception</li>
            </ul>
            <a href={`${MAIN}/register?category=student`} className="btn btn-outline-ink btn-block">
              Register as Student
            </a>
          </article>

          {/* Listener — featured */}
          <article className="lpb-reg-card lpb-reg-card-pop">
            <span className="lpb-reg-ribbon">Most Popular · Save 50%</span>
            <div className="lpb-reg-icon"><i className="fas fa-headset" /></div>
            <div className="lpb-reg-head">
              <span className="lpb-reg-cat">Listener (In-Person)</span>
              <span className="lpb-reg-save">Save 50%</span>
            </div>
            <div className="lpb-reg-price">
              <span className="lpb-reg-cur">$</span>499
              <s>$999</s>
            </div>
            <p className="lpb-reg-desc">Attend every session, every poster, every break.</p>
            <ul className="lpb-reg-feats">
              <li>All keynote &amp; plenary sessions</li>
              <li>14 parallel tracks + posters</li>
              <li>Conference kit &amp; proceedings</li>
              <li>Lunches &amp; refreshments</li>
              <li>Welcome reception · Day 1</li>
              <li>Certificate of participation</li>
            </ul>
            <a href={`${MAIN}/register?category=listener`} className="btn btn-primary btn-block">
              Register as Listener
            </a>
          </article>

          {/* Presenter */}
          <article className="lpb-reg-card">
            <div className="lpb-reg-icon"><i className="fas fa-microphone-lines" /></div>
            <div className="lpb-reg-head">
              <span className="lpb-reg-cat">Presenter (In-Person)</span>
              <span className="lpb-reg-save">Save 50%</span>
            </div>
            <div className="lpb-reg-price">
              <span className="lpb-reg-cur">$</span>749
              <s>$1,499</s>
            </div>
            <p className="lpb-reg-desc">Oral or poster — after abstract acceptance.</p>
            <ul className="lpb-reg-feats">
              <li>Everything in Listener, plus:</li>
              <li>25-min talk + 5-min Q&amp;A</li>
              <li>Endorsed presenter certificate</li>
              <li>Published abstract (ISBN)</li>
              <li>Best Paper / Poster award eligibility</li>
            </ul>
            <a href={`${MAIN}/register?category=presenter`} className="btn btn-outline-ink btn-block">
              Register as Presenter
            </a>
          </article>
        </div>

      </section>

      {/* §04 Important Dates — redesigned as a chronological roadmap.
          Dates are re-ordered chronologically (early-bird → abstract →
          acceptance → conference) and shown as nodes on a horizontal line
          with a "you are here" pulse for the next upcoming deadline. */}
      <section className="lpb-overview">
        <div className="lpb-section-head">
          <span className="lpb-num">03</span>
          <h2>Important dates.</h2>
        </div>
        <ol className="lpb-roadmap">
          {(() => {
            // Re-sort key_dates chronologically by parsing "Day Month YYYY".
            const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
            const parsed = conf.key_dates.map(([d, m, t, desc]) => {
              const monthName = (m.split(' ')[0] || '').slice(0, 3);
              const yr = parseInt(m.split(' ')[1] || '2027', 10);
              const dateObj = new Date(yr, months.indexOf(monthName), parseInt(d, 10));
              return { d, m, t, desc, date: dateObj };
            }).sort((a, b) => a.date.getTime() - b.date.getTime());
            const now = Date.now();
            const nextIdx = parsed.findIndex(p => p.date.getTime() >= now);
            return parsed.map(({ d, m, t, desc, date }, i) => {
              const isPast = date.getTime() < now;
              const isNext = i === nextIdx;
              const stateClass = isPast ? 'is-past' : isNext ? 'is-next' : 'is-future';
              return (
                <li key={t} className={`lpb-rm-step ${stateClass}`}>
                  <div className="lpb-rm-node" aria-hidden>
                    <span className="lpb-rm-node-inner">{String(i + 1).padStart(2, '0')}</span>
                  </div>
                  <div className="lpb-rm-card">
                    <div className="lpb-rm-when">
                      <strong>{d}</strong>
                      <span>{m}</span>
                    </div>
                    <h3>{t}</h3>
                    <p>{desc}</p>
                    {isNext && <span className="lpb-rm-tag">Next up</span>}
                  </div>
                </li>
              );
            });
          })()}
        </ol>
      </section>

      {/* §04 Download & Prepare — three essential resources for attendees */}
      <section className="lpb-band">
        <div className="lpb-section-head">
          <span className="lpb-num">04</span>
          <h2>Download &amp; prepare.</h2>
        </div>
        <div className="lpb-dl-grid">
          <a
            href="#"
            onClick={(e) => { e.preventDefault(); window.dispatchEvent(new Event('lpb-open-brochure')); }}
            className="lpb-dl-card"
          >
            <div className="lpb-dl-icon"><i className="fas fa-file-pdf" /></div>
            <div className="lpb-dl-body">
              <h3>Conference brochure</h3>
              <p>The full pack — tracks, pricing, dates, faculty and venue.</p>
              <span className="lpb-dl-meta">PDF · 2 pages</span>
            </div>
            <span className="lpb-dl-arrow"><i className="fas fa-arrow-down" /></span>
          </a>
          <a href={`${MAIN}/assets/abstract-template.docx`} className="lpb-dl-card" download>
            <div className="lpb-dl-icon"><i className="fas fa-file-word" /></div>
            <div className="lpb-dl-body">
              <h3>Abstract template</h3>
              <p>IMRaD-structured Word template · 250–400 words.</p>
              <span className="lpb-dl-meta">DOCX · 12 KB</span>
            </div>
            <span className="lpb-dl-arrow"><i className="fas fa-arrow-down" /></span>
          </a>
          <a href={`${MAIN}/assets/presentation-template.pptx`} className="lpb-dl-card" download>
            <div className="lpb-dl-icon"><i className="fas fa-file-powerpoint" /></div>
            <div className="lpb-dl-body">
              <h3>Sample presentation</h3>
              <p>Suggested slide layout, brand colours and timing cues for oral talks.</p>
              <span className="lpb-dl-meta">PPTX · 1.8 MB</span>
            </div>
            <span className="lpb-dl-arrow"><i className="fas fa-arrow-down" /></span>
          </a>
        </div>
      </section>

      {/* §06 FAQs — redesigned as a 2-column grid with category badges and
          numbered Q chips. Each row is its own card (rounded, hairline) so the
          section reads more like a knowledge-base than a plain accordion. */}
      <section className="lpb-overview">
        <div className="lpb-section-head">
          <span className="lpb-num">05</span>
          <h2>Quick answers.</h2>
        </div>
        <div className="lpb-faq2">
          {[
            ['Audience',     'fa-user-group',        'Who should attend this conference?',
              'Academicians, scientists, R&D and industry professionals, policy-makers, founders, and graduate / doctoral students working in cardiology and adjacent fields.'],
            ['Registration', 'fa-ticket',            'What is the process for completing my registration?',
              `Open the Register page on the main site, choose your participation mode and category, and submit the secure online form. Early-bird applies until ${conf.early_bird_deadline}.`],
            ['Hotel',        'fa-hotel',             'Is the hotel included in my registration fee?',
              'No — the hotel is a separate optional add-on. You can book at the negotiated rate inside the registration form once the venue is announced.'],
            ['Visa',         'fa-passport',          'Will the organisers issue a visa invitation letter?',
              'Yes — but only for registered, paid-up participants. Once your payment is confirmed, a personalised invitation letter is issued within 3-5 business days.'],
            ['Abstracts',    'fa-file-signature',    'How many abstracts can I submit?',
              'Each author may submit up to two abstracts, in oral, poster, or a combination of both formats.'],
            ['Grants',       'fa-piggy-bank',        'Does the conference offer travel grants?',
              'No travel, food or accommodation funding is offered. The 50% early-bird and 10% group rate are the available cost-savers.'],
          ].map(([cat, icon, q, a]) => (
            <details key={q} className="lpb-faq2-row">
              <summary>
                <span className="lpb-faq2-cat">
                  <i className={`fas ${icon}`} />
                  <span>{cat}</span>
                </span>
                <span className="lpb-faq2-q">{q}</span>
                <span className="lpb-faq2-toggle" aria-hidden>+</span>
              </summary>
              <p>{a}</p>
            </details>
          ))}
        </div>
        <div className="lpb-center" style={{ marginTop: 24 }}>
          <a href={`${MAIN}/faqs`} className="btn btn-outline-ink">
            See all 13 FAQs <i className="fas fa-arrow-right" />
          </a>
        </div>
      </section>

      {/* Final CTA */}
      <section className="lpb-end">
        <h2>Reserve your seat at {conf.short}.</h2>
        <p>Early-bird ends {conf.early_bird_deadline}.</p>
        <div className="lpb-cta">
          <a href={`${MAIN}/register`} className="btn btn-primary">Register now <i className="fas fa-arrow-right" /></a>
          <a href={`${MAIN}/call-for-abstract-submission`} className="btn btn-outline-light">Submit Abstract</a>
        </div>
      </section>

      <footer className="lpb-foot">
        <div className="container lpb-foot-inner">
          {/* Brand column — same full BrandLogo emblem as the header, sized
              for the footer and adapted for the dark background. */}
          <div className="lpb-foot-brand">
            <a href={MAIN} className="brand brand-v3 brand-footer" aria-label={`${conf.short} home`}>
              {getLogoSvg(slug)
                ? <div className="brand-icon" dangerouslySetInnerHTML={{ __html: getLogoSvg(slug)! }} />
                : <div className="brand-icon"><img src={`/logos/${getLogoName(slug)}.svg`} alt={`${conf.short} logo`} width={80} height={80} /></div>}
              <div className="brand-divider" />
              <div className="brand-lockup">
                <div className="brand-line-1">{conf.discipline}-<span className="brand-year">20{conf.year_suffix}</span></div>
                <div className="brand-line-3">
                  {(() => {
                    const dm = conf.dates.match(/^(\w+)\s+([\d\-]+),\s*\d+/);
                    const ds = dm ? `${dm[1].slice(0, 3)} ${dm[2]}` : conf.dates.replace(/,\s*\d{4}\s*$/, '');
                    return <>{ds}{conf.country ? <><span className="brand-sep">|</span><span className="brand-country">{conf.country}</span></> : null}</>;
                  })()}
                </div>
              </div>
            </a>
            <p className="lpb-foot-tag">{conf.name}</p>
            <ul className="lpb-foot-contact">
              <li><i className="fas fa-calendar" /><span>{conf.dates}</span></li>
              <li><i className="fas fa-location-dot" /><span>{conf.country} · Hybrid</span></li>
              <li><a href={`mailto:${conf.email}`}><i className="fas fa-envelope" /><span>{conf.email}</span></a></li>
              <li><a href={`tel:${conf.phone.replace(/\D/g, '')}`}><i className="fas fa-phone" /><span>{conf.phone}</span></a></li>
            </ul>
          </div>

          {/* Programme links */}
          <nav className="lpb-foot-col" aria-label="Programme">
            <h5>Programme</h5>
            <a href={`${MAIN}/sessions`}>Sessions &amp; tracks</a>
            <a href={`${MAIN}/speakers`}>Speakers</a>
            <a href={`${MAIN}/committee`}>Committee</a>
            <a href={`${MAIN}/scientific-program`}>Schedule</a>
          </nav>

          {/* Attendees links */}
          <nav className="lpb-foot-col" aria-label="Attendees">
            <h5>Attendees</h5>
            <a href={`${MAIN}/register`}>Register</a>
            <a href={`${MAIN}/call-for-abstract-submission`}>Submit abstract</a>
            <a href={`${MAIN}/guidelines`}>Author guidelines</a>
            <a href={`${MAIN}/venue`}>Venue &amp; travel</a>
            <a href={`${MAIN}/faqs`}>FAQs</a>
          </nav>

          {/* Connect links */}
          <nav className="lpb-foot-col" aria-label="Connect">
            <h5>Connect</h5>
            <a href={`${MAIN}/sponsor-exhibitor`}>Sponsor &amp; exhibit</a>
            <a href={`${MAIN}/contact`}>Contact us</a>
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); window.dispatchEvent(new Event('lpb-open-brochure')); }}
            >Download brochure</a>
            <div className="lpb-foot-social" aria-label="Social media">
              <a href="#" aria-label="LinkedIn"><i className="fab fa-linkedin-in" /></a>
              <a href="#" aria-label="X / Twitter"><i className="fab fa-x-twitter" /></a>
              <a href="#" aria-label="Facebook"><i className="fab fa-facebook-f" /></a>
              <a href="#" aria-label="YouTube"><i className="fab fa-youtube" /></a>
            </div>
          </nav>
        </div>

        {/* Bottom bar — copyright + legal */}
        <div className="container lpb-foot-bottom">
          <small>© {conf.hero_title_year} {conf.short}. All rights reserved.</small>
          <nav>
            <a href={`${MAIN}/terms-of-use`}>Terms of Use</a>
            <a href={`${MAIN}/privacy-policy`}>Privacy Policy</a>
            <a href={`${MAIN}/contact`}>Cookies</a>
          </nav>
        </div>
      </footer>

      <LandingLeadModal conf={conf} mainSiteUrl={MAIN} slug={slug} />
    </main>
  );
}
