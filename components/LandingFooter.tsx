'use client';

/* The landing-page footer, lifted out of LandingClient unchanged so both the
   original layout and the redesigned neurology page render the same markup.
   Class names and links are exactly as they were. */

import type { ConferenceConfig } from '@/lib/config';
import { getLogoSvg } from '@/lib/logoSvgs';

/* Inline rather than Font Awesome: these four were the only brand glyphs on
   the landing pages, and the brands webfont costs 108 KB to render them. */
const SOCIALS = [
  { label: 'LinkedIn', path: 'M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05a3.74 3.74 0 0 1 3.37-1.85c3.6 0 4.27 2.37 4.27 5.46zM5.34 7.43a2.07 2.07 0 1 1 0-4.13 2.07 2.07 0 0 1 0 4.13M7.12 20.45H3.56V9h3.56zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0' },
  { label: 'X / Twitter', path: 'M18.9 1.15h3.68l-8.04 9.19L24 22.85h-7.41l-5.8-7.584-6.64 7.584H.47l8.6-9.83L0 1.15h7.59l5.24 6.93zm-1.29 19.5h2.04L6.49 3.24H4.3z' },
  { label: 'Facebook', path: 'M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.09 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.96.93-1.96 1.89v2.25h3.33l-.53 3.5h-2.8V24C19.61 23.09 24 18.1 24 12.07' },
  { label: 'YouTube', path: 'M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.5 3.55 12 3.55 12 3.55s-7.5 0-9.38.5A3.02 3.02 0 0 0 .5 6.19C0 8.08 0 12 0 12s0 3.92.5 5.81a3.02 3.02 0 0 0 2.12 2.14c1.88.5 9.38.5 9.38.5s7.5 0 9.38-.5a3.02 3.02 0 0 0 2.12-2.14C24 15.92 24 12 24 12s0-3.92-.5-5.81M9.55 15.57V8.43L15.82 12z' },
];

export default function LandingFooter({
  conf,
  mainSiteUrl,
  slug,
  logoName,
  brandDates,
  brandPlace,
}: {
  conf: ConferenceConfig;
  mainSiteUrl: string;
  slug: string;
  /** Fallback logo file name when the slug has no inline SVG. */
  logoName: string;
  brandDates: string;
  brandPlace: string;
}) {
  const MAIN = mainSiteUrl;

  return (
    <footer className="lpb-foot">
      <div className="container lpb-foot-inner">
        {/* Brand column — same full BrandLogo emblem as the header, sized
            for the footer and adapted for the dark background. */}
        <div className="lpb-foot-brand">
          <a href={MAIN} className="brand brand-v3 brand-footer" aria-label={`${conf.short} home`}>
            {getLogoSvg(slug)
              ? <div className="brand-icon" dangerouslySetInnerHTML={{ __html: getLogoSvg(slug)! }} />
              : <div className="brand-icon"><img src={`/logos/${logoName}.svg`} alt={`${conf.short} logo`} width={80} height={80} /></div>}
            <div className="brand-divider" />
            <div className="brand-lockup">
              <div className="brand-line-1">{conf.discipline}-<span className="brand-year">20{conf.year_suffix}</span></div>
              <div className="brand-line-3">
                {brandDates}{brandPlace ? <><span className="brand-sep">|</span><span className="brand-country">{brandPlace}</span></> : null}
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
          {conf.brochure_on_main_site ? (
            <a href={`${MAIN}/?brochure=open`}>Download brochure</a>
          ) : (
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); window.dispatchEvent(new Event('lpb-open-brochure')); }}
            >Download brochure</a>
          )}
          <div className="lpb-foot-social" aria-label="Social media">
            {SOCIALS.map(({ label, path }) => (
              <a key={label} href="#" aria-label={label}>
                <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" aria-hidden>
                  <path d={path} />
                </svg>
              </a>
            ))}
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
  );
}
