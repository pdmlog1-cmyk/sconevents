'use client';

/* /neurology landing page — a mirror of the neuroscience-conference.com home
   page (Sconconferences/neurology/app/page.tsx).

   Why this is a separate file rather than a change to LandingClient.tsx:
   LandingClient is shared by all ten landing pages, and only neurology is
   meant to mirror its main site for now. app/[conference]/page.tsx picks
   this component for the neurology slug and leaves the other nine on the
   existing layout.

   Differences from the main-site original, all forced by this being a
   separate deployment that only serves /<slug>:
     · every internal link is an absolute <a> to the canonical main site
     · the brochure button dispatches the 'lpb-open-brochure' event that
       LandingLeadModal listens for, instead of the main site's BrochureModal
     · sessions / navigation / registration JSON are imported directly,
       because getConfig() does not expose them
   Sections the main site has switched off (committee preview, standalone
   speakers grid, venue, partners) are omitted here for the same reason. */

import type { ConferenceConfig } from '@/lib/config';
import type { ConferenceTheme } from '@/lib/conferences';
import {
  MainSiteHeader,
  MainSiteFooter,
  type NavItem,
  type NavLeaf,
  type FooterColumn,
} from '@/components/MainSiteChrome';
import EarlyBirdBanner from '@/components/EarlyBirdBanner';
import HeroSpeakerSlider from '@/components/HeroSpeakerSlider';
import LegacySection from '@/components/LegacySection';
import HomepageFaqsLanding from '@/components/HomepageFaqsLanding';
import LandingLeadModal from '@/components/LandingLeadModal';
import sessionsJson from '@/data/neurology/sessions.json';
import navigationJson from '@/data/neurology/navigation.json';
import registrationJson from '@/data/neurology/registration.json';
import speakersJson from '@/data/neurology/speakers.json';

interface Props {
  conf: ConferenceConfig;
  mainSiteUrl: string;
  theme: ConferenceTheme;
  slug: string;
}

type Session = { title: string; slug: string; description: string };

const SESSIONS = sessionsJson.sessions as Session[];

/* Hero speakers — the first four of the same `speakers` array that the main
   site's /speakers page renders, in that page's order.

   Deliberately NOT conf.featured_speakers: that is a hand-maintained copy of
   the first three, so it silently drifts from the real speaker list (it was
   three entries against nine when this was written). Deriving from the source
   array keeps the hero and /speakers in step, and changing the count is a
   one-number edit here. HeroSpeakerSlider wants positional tuples, so the
   records are flattened into its shape. */
type SpeakerRecord = {
  name: string;
  affiliation: string;
  country: string;
  abstract_title: string;
  photo: string;
};
type SpeakerTuple = [string, string, string, string, string?, string?];

const HERO_SPEAKER_COUNT = 4;
const HERO_SPEAKERS: SpeakerTuple[] = (speakersJson.speakers as SpeakerRecord[])
  .slice(0, HERO_SPEAKER_COUNT)
  .map(s => [s.name, 'Speaker', s.affiliation, s.photo, s.abstract_title, s.country]);
const HEADER_NAV = navigationJson.header as NavItem[];
const FOOTER_COLUMNS = navigationJson.footer_columns as FooterColumn[];
const FOOTER_LEGAL = navigationJson.footer_legal as NavLeaf[];

/* Homepage pricing reads the in-person tab totals — the figure the main
   site's registration form actually charges — so the landing page can never
   advertise a price the visitor will not be charged. Same binding the main
   site uses. */
const IN_PERSON_PRICES: Record<string, number> = Object.fromEntries(
  (registrationJson.form.tabs.find(t => t.id === 'inperson')?.categories ?? [])
    .map(c => [c.id, c.total]),
);

export default function NeurologyLanding({ conf, mainSiteUrl, theme, slug }: Props) {
  const MAIN = mainSiteUrl;

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

  const openBrochure = () => window.dispatchEvent(new Event('lpb-open-brochure'));

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: themeStyles }} />

      <EarlyBirdBanner conf={conf} baseUrl={MAIN} />
      <MainSiteHeader conf={conf} baseUrl={MAIN} slug={slug} nav={HEADER_NAV} />

      {/* Hero — venue background + speaker slider */}
      <section className="hero-poster" style={{ position: 'relative', overflow: 'hidden' }}>
        <div className="hero-bg-image" aria-hidden style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/images/prague-hero.jpg" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'color-mix(in srgb, var(--accent) 12%, rgba(255,255,255,0.90))' }} />
        </div>
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div className="hero-poster-grid">
            <div className="hero-poster-text">
              <div className="hero-theme">
                <span className="hero-theme-primary">{conf.theme_primary}.</span>
              </div>
              <h1>
                {conf.hero_title_lead}<br />
                {conf.hero_title_main}{' '}
                <span className="hero-year">{conf.hero_title_year}</span>
              </h1>
              <p className="hero-tagline">{conf.hero_subtitle}</p>
              <div className="hero-actions">
                <a href={`${MAIN}/register`} className="btn btn-primary">
                  {conf.hero_cta.register_label} <i className="fas fa-arrow-right" />
                </a>
                <a href={`${MAIN}/call-for-abstract-submission`} className="btn btn-ghost">
                  {conf.hero_cta.abstract_label}
                </a>
                <button type="button" onClick={openBrochure} className="btn btn-outline-ink">
                  <i className="fas fa-file-arrow-down" /> {conf.hero_cta.brochure_label}
                </button>
              </div>
              <div className="hero-trust">
                {conf.stats.map(([value, label]) => (
                  <div key={label} className="trust-item">
                    <strong>{value}</strong><span>{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {HERO_SPEAKERS.length > 0 && (
              <HeroSpeakerSlider speakers={HERO_SPEAKERS} baseUrl={MAIN} />
            )}
          </div>
        </div>
      </section>

      {/* Legacy / Track Record */}
      <LegacySection />

      {/* §02 Scientific Sessions — first 6 here, full set on the main site */}
      <section className="section section-cream">
        <div className="container">
          <div className="section-head">
            <div className="section-head-text">
              <div className="eyebrow"><span className="eyebrow-num">02</span> Scientific Sessions</div>
              <h2>Multidisciplinary tracks.<br />One conference.</h2>
            </div>
            <div className="section-head-text">
              <p>From fundamental research to industrial translation — {conf.short} invites original contributions across the full breadth of {conf.discipline.toLowerCase()}.</p>
            </div>
          </div>
          <div className="topics-grid">
            {SESSIONS.slice(0, 6).map((s, i) => (
              <div key={s.slug} className="topic-card">
                <span className="topic-num">{String(i + 1).padStart(2, '0')} · Session</span>
                <h4>{s.title}</h4>
                <p>{s.description.split(/[.!?]/)[0] + '.'}</p>
                <a href={`${MAIN}/sessions/${s.slug}`}>Explore <i className="fas fa-arrow-up" /></a>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 32 }}>
            <a href={`${MAIN}/sessions`} className="btn btn-ink">
              View all {SESSIONS.length} sessions <i className="fas fa-arrow-right" />
            </a>
          </div>
        </div>
      </section>

      {/* §03 About Us */}
      <section className="section">
        <div className="container">
          <div className="about-grid">
            {(() => {
              const m = conf.dates.match(/(\w+)\s+(\d+)[–\-](\d+),\s*(\d+)/);
              const poMonth = m?.[1] ?? '';
              const poD1 = m?.[2] ?? '';
              const poD2 = m?.[3] ?? '';
              const poYear = m?.[4] ?? '';
              return (
                <div className="poster-card">
                  <div className="ps-glow" aria-hidden="true" />
                  <div className="ps-noise" aria-hidden="true" />
                  <div className="ps-monogram" aria-hidden="true">{poYear.slice(-2)}</div>

                  <div className="ps-top">
                    <span className="ps-badge"><span className="ps-dot" />Live · {poMonth} {poYear}</span>
                  </div>

                  <div className="ps-hero">
                    <div className="ps-day-big">
                      <span className="ps-d1">{poD1}</span>
                      <span className="ps-slash">/</span>
                      <span className="ps-d2">{poD2}</span>
                    </div>
                    <div className="ps-month-col">
                      <span className="ps-mo">{poMonth}</span>
                      <span className="ps-yr">{poYear}</span>
                    </div>
                  </div>

                  <div className="ps-rule"><span /></div>

                  <h3 className="ps-name">
                    {conf.short}
                    <span>{conf.name}</span>
                  </h3>

                  <div className="ps-venue">
                    <svg className="ps-pin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path d="M12 21s-7-7.5-7-12a7 7 0 0 1 14 0c0 4.5-7 12-7 12z" />
                      <circle cx="12" cy="9" r="2.5" />
                    </svg>
                    <div className="ps-venue-text">
                      <strong>{conf.venue || 'Venue to be announced'}</strong>
                      {/* De-duplicated without spreading a Set — this project's
                          tsconfig target predates downlevelIteration. Matters for
                          Singapore, where city and country are the same word. */}
                      <span>{[conf.city, conf.country].filter(Boolean).filter((v, i, a) => a.indexOf(v) === i).join(', ')}</span>
                    </div>
                  </div>
                </div>
              );
            })()}
            <div className="about-content">
              <div className="eyebrow"><span className="eyebrow-num">03</span> About Us</div>
              <h2>{conf.about_heading}</h2>
              <p className="lead">{conf.about_lead}</p>
              <p>{conf.about_body}</p>
              <div className="about-highlights">
                {conf.stats.map(([v, l]) => (
                  <div key={l} className="about-highlight"><strong>{v}</strong><span>{l}</span></div>
                ))}
              </div>
              <a href={`${MAIN}/sessions`} className="btn btn-ink">Explore Sessions <i className="fas fa-arrow-up" /></a>
            </div>
          </div>
        </div>
      </section>

      {/* §04 Why Attend */}
      <section className="section section-cream">
        <div className="container">
          <div className="section-head">
            <div className="section-head-text">
              <div className="eyebrow"><span className="eyebrow-num">04</span> {conf.why_eyebrow}</div>
              <h2>{conf.why_heading}</h2>
            </div>
            <div className="section-head-text">
              <p>{conf.why_intro}</p>
            </div>
          </div>
          <div className="why-grid">
            {conf.why_attend.map(([icon, title, desc]) => (
              <div key={title} className="why-card">
                <div className="why-icon"><i className={`fas ${icon}`} /></div>
                <div><h4>{title}</h4></div>
                <p>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* §05 Registration */}
      <section className="section">
        <div className="container">
          <div className="section-head">
            <div className="section-head-text">
              <div className="eyebrow"><span className="eyebrow-num">05</span> Registration</div>
              <h2>Secure your seat.</h2>
            </div>
            <div className="section-head-text">
              <p>Early-bird pricing available until {conf.early_bird_deadline}. All fees include the full two-day program, conference kit, lunches and networking events.</p>
            </div>
          </div>
          <div className="pricing-grid">
            <div className="pricing-card featured">
              <h4>Presenter</h4>
              <div className="tier-label">Most Popular</div>
              <div className="price"><span className="cur">$</span>{IN_PERSON_PRICES.presenter}</div>
              <div className="price-period">Present your research + full access</div>
              <ul className="pricing-features">
                <li>Abstract submission &amp; presentation slot</li>
                <li>All keynotes &amp; technical sessions</li>
                <li>Conference kit &amp; proceedings</li>
                <li>Lunches &amp; coffee breaks</li>
                <li>Networking with global researchers</li>
                <li>Certificate of presentation</li>
              </ul>
              <a href={`${MAIN}/register?category=presenter`} className="btn btn-primary btn-block">Register <i className="fas fa-arrow-right" /></a>
            </div>
            <div className="pricing-card">
              <h4>Listener</h4>
              <div className="tier-label">Full Access</div>
              <div className="price"><span className="cur">$</span>{IN_PERSON_PRICES.listener}</div>
              <div className="price-period">Full conference access</div>
              <ul className="pricing-features">
                <li>All keynotes &amp; technical sessions</li>
                <li>Conference kit &amp; proceedings</li>
                <li>Lunches &amp; coffee breaks</li>
                <li>Networking with global researchers</li>
                <li>Certificate of participation</li>
              </ul>
              <a href={`${MAIN}/register?category=listener`} className="btn btn-ghost btn-block">Register <i className="fas fa-arrow-right" /></a>
            </div>
            <div className="pricing-card">
              <h4>Student</h4>
              <div className="tier-label">Early Bird</div>
              <div className="price"><span className="cur">$</span>{IN_PERSON_PRICES.student}</div>
              <div className="price-period">Valid university ID required</div>
              <ul className="pricing-features">
                <li>All keynotes &amp; technical sessions</li>
                <li>Conference kit &amp; proceedings</li>
                <li>Lunches &amp; coffee breaks</li>
                <li>Welcome reception</li>
              </ul>
              <a href={`${MAIN}/register?category=student`} className="btn btn-ghost btn-block">Register <i className="fas fa-arrow-right" /></a>
            </div>
          </div>
        </div>
      </section>

      {/* Mid-page CTA banner */}
      <section className="cta-banner">
        <div className="container">
          <div className="cta-banner-inner">
            <div>
              <div className="cta-eyebrow">Ready to join?</div>
              <h2>Shape the future of {conf.discipline.toLowerCase()}.</h2>
              <p>Secure your seat at the global congress.</p>
            </div>
            <div className="cta-actions">
              <a href={`${MAIN}/register`} className="btn btn-primary">Register Now <i className="fas fa-arrow-right" /></a>
              <a href={`${MAIN}/call-for-abstract-submission`} className="btn btn-outline-light">Submit Abstract</a>
            </div>
          </div>
        </div>
      </section>

      {/* §06 Important Dates */}
      <section className="section section-cream">
        <div className="container">
          <div className="section-head">
            <div className="section-head-text">
              <div className="eyebrow"><span className="eyebrow-num">06</span> Key Milestones</div>
              <h2>Important<br />dates.</h2>
            </div>
            <div className="section-head-text">
              <p>Mark these deadlines to stay ahead of abstract submission, registration and arrival.</p>
            </div>
          </div>
          <div className="dates-timeline">
            {conf.key_dates.map(([day, month, title, desc]) => (
              <div key={title} className="date-node">
                <div>
                  <div className="date-num">{day}</div>
                  <div className="date-month">{month}</div>
                </div>
                <div>
                  <div className="date-title">{title}</div>
                  <div className="date-desc">{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* §08 Downloads */}
      <section className="section section-cream">
        <div className="container">
          <div className="section-head">
            <div className="section-head-text">
              <div className="eyebrow"><span className="eyebrow-num">08</span> Resources</div>
              <h2>Download &amp; prepare.</h2>
            </div>
            <div className="section-head-text">
              <p>Everything you need to submit abstracts, prepare presentations, and share {conf.short} with your colleagues.</p>
            </div>
          </div>
          <div className="downloads-grid">
            <button
              type="button"
              onClick={openBrochure}
              className="download-card"
              style={{ textAlign: 'left', cursor: 'pointer', font: 'inherit', width: '100%' }}
            >
              <div className="download-icon"><i className="fas fa-file-pdf" /></div>
              <div className="download-content">
                <span className="download-label">PDF · 2.4 MB</span>
                <h4>Conference Brochure</h4>
                <p>Full overview of program, speakers, tracks and venue details.</p>
              </div>
              <span className="download-action"><i className="fas fa-arrow-down" /></span>
            </button>
            <a href={`${MAIN}/assets/abstract-template.docx`} className="download-card" download={`${conf.short} - Abstract Template.docx`}>
              <div className="download-icon"><i className="fas fa-file-word" /></div>
              <div className="download-content">
                <span className="download-label">DOCX · 13 KB</span>
                <h4>Abstract Template</h4>
                <p>Formatted Word template with structure and formatting guidelines.</p>
              </div>
              <span className="download-action"><i className="fas fa-arrow-down" /></span>
            </a>
            <a href={`${MAIN}/assets/presentation-template.pptx`} className="download-card" download={`${conf.short} - PowerPoint.pptx`}>
              <div className="download-icon"><i className="fas fa-file-powerpoint" /></div>
              <div className="download-content">
                <span className="download-label">PPTX · 360 KB</span>
                <h4>Presentation Template</h4>
                <p>16:9 widescreen PowerPoint template for oral presenters.</p>
              </div>
              <span className="download-action"><i className="fas fa-arrow-down" /></span>
            </a>
          </div>
        </div>
      </section>

      {/* §09 Quick FAQs */}
      <HomepageFaqsLanding baseUrl={MAIN} />

      <MainSiteFooter
        conf={conf}
        baseUrl={MAIN}
        slug={slug}
        columns={FOOTER_COLUMNS}
        legal={FOOTER_LEGAL}
      />

      {/* Brochure lead-capture modal — listens for 'lpb-open-brochure' */}
      <LandingLeadModal conf={conf} mainSiteUrl={MAIN} slug={slug} />
    </>
  );
}
