'use client';

/* The landing-page footer, lifted out of LandingClient unchanged so both the
   original layout and the redesigned neurology page render the same markup.
   Class names and links are exactly as they were. */

import type { ConferenceConfig } from '@/lib/config';
import { getLogoSvg } from '@/lib/logoSvgs';

/* Inline rather than Font Awesome: these four were the only brand glyphs on
   the landing pages, and the brands webfont costs 108 KB to render them. */
const SOCIALS = [
  { key: 'linkedin', label: 'LinkedIn', path: 'M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05a3.74 3.74 0 0 1 3.37-1.85c3.6 0 4.27 2.37 4.27 5.46zM5.34 7.43a2.07 2.07 0 1 1 0-4.13 2.07 2.07 0 0 1 0 4.13M7.12 20.45H3.56V9h3.56zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0' },
  { key: 'twitter', label: 'X / Twitter', path: 'M18.9 1.15h3.68l-8.04 9.19L24 22.85h-7.41l-5.8-7.584-6.64 7.584H.47l8.6-9.83L0 1.15h7.59l5.24 6.93zm-1.29 19.5h2.04L6.49 3.24H4.3z' },
  { key: 'facebook', label: 'Facebook', path: 'M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.09 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.96.93-1.96 1.89v2.25h3.33l-.53 3.5h-2.8V24C19.61 23.09 24 18.1 24 12.07' },
  { key: 'youtube', label: 'YouTube', path: 'M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.5 3.55 12 3.55 12 3.55s-7.5 0-9.38.5A3.02 3.02 0 0 0 .5 6.19C0 8.08 0 12 0 12s0 3.92.5 5.81a3.02 3.02 0 0 0 2.12 2.14c1.88.5 9.38.5 9.38.5s7.5 0 9.38-.5a3.02 3.02 0 0 0 2.12-2.14C24 15.92 24 12 24 12s0-3.92-.5-5.81M9.55 15.57V8.43L15.82 12z' },
  { key: 'instagram', label: 'Instagram', path: 'M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9s.68.82.9 1.38c.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38s-.82.68-1.38.9c-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41-.56-.22-.96-.48-1.38-.9s-.68-.82-.9-1.38c-.16-.42-.36-1.06-.41-2.23C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38s.82-.68 1.38-.9c.42-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16M12 0C8.74 0 8.33.01 7.05.07 5.78.13 4.9.33 4.14.63a5.9 5.9 0 0 0-2.13 1.38A5.9 5.9 0 0 0 .63 4.14c-.3.76-.5 1.64-.56 2.91C.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.06 1.27.26 2.15.56 2.91a5.9 5.9 0 0 0 1.38 2.13 5.9 5.9 0 0 0 2.13 1.38c.76.3 1.64.5 2.91.56C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c1.27-.06 2.15-.26 2.91-.56a5.9 5.9 0 0 0 2.13-1.38 5.9 5.9 0 0 0 1.38-2.13c.3-.76.5-1.64.56-2.91.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.06-1.27-.26-2.15-.56-2.91a5.9 5.9 0 0 0-1.38-2.13A5.9 5.9 0 0 0 19.86.63c-.76-.3-1.64-.5-2.91-.56C15.67.01 15.26 0 12 0m0 5.84A6.16 6.16 0 1 0 18.16 12 6.16 6.16 0 0 0 12 5.84M12 16a4 4 0 1 1 4-4 4 4 0 0 1-4 4m7.85-10.4a1.44 1.44 0 1 1-1.44-1.44 1.44 1.44 0 0 1 1.44 1.44' },
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
            {/* Only the networks this conference actually has: an icon with
                no link behind it is worse than no icon. */}
            {SOCIALS.filter(({ key }) => {
              const href = conf.social?.[key];
              return href && href !== '#';
            }).map(({ key, label, path }) => (
              <a key={label} href={conf.social[key]} aria-label={label}
                 target="_blank" rel="noreferrer noopener">
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
