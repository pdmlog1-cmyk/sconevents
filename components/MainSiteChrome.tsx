'use client';

/* Main-site chrome (info strip + header + footer) rebuilt as prop-driven
   components.

   The existing InfoStrip/Header/Footer in this repo read `conf` and
   `navigationData` from '@/lib/config', which holds a single hard-coded
   conference (Addiction) for backwards compatibility. That is fine for the
   pages that already use them, but a landing page that must mirror one
   specific main site needs its own conference's data. Rather than change
   those shared files — which would move all ten landing pages at once —
   these are separate components that take everything as props.

   Markup and class names are copied from
   Sconconferences/neurology/components/{InfoStrip,Header,Footer}.tsx so the
   CSS already in app/globals.css styles them unchanged. Every internal link
   is an absolute <a> to the canonical main site, because this deployment
   only serves /<slug> and has no /register, /sessions, ... routes. */

import { useEffect, useRef, useState } from 'react';
import type { ConferenceConfig } from '@/lib/config';
import LanguageSwitcher from './LanguageSwitcher';
import { getLogoSvg } from '@/lib/logoSvgs';

export type NavLeaf = { label: string; href: string; cta?: boolean };
export type NavGroup = { label: string; dropdown: NavLeaf[] };
export type NavItem = NavLeaf | NavGroup;

const isDropdown = (item: NavItem): item is NavGroup =>
  Object.prototype.hasOwnProperty.call(item, 'dropdown');

export type FooterColumn = { heading: string; items: NavLeaf[] };

/* ── Info strip ─────────────────────────────────────────────────────────
   Venue · Abstract Deadline · Expected Attendees · Registrations.
   Note this is the main-site arrangement, which differs from the existing
   InfoStrip.tsx in this repo (that one leads with "Days to Event" and ends
   with a Register CTA). */
export function MainInfoStrip({ conf, baseUrl }: { conf: ConferenceConfig; baseUrl: string }) {
  return (
    <div className="info-strip">
      <div className="container">
        <div className="info-strip-inner">
          <div className="info-item">
            <i className="fas fa-map-marker-alt" />
            <div>
              <span className="info-label">Venue</span>
              <span className="info-value">{conf.venue || conf.city || 'To be announced'}</span>
            </div>
          </div>
          <a href={`${baseUrl}/call-for-abstract-submission`} className="info-item info-link">
            <i className="fas fa-file-signature" />
            <div>
              <span className="info-label">Abstract Deadline</span>
              <span className="info-value">{conf.abstract_deadline}</span>
            </div>
          </a>
          <div className="info-item">
            <i className="fas fa-users" />
            <div>
              <span className="info-label">Expected Attendees</span>
              <span className="info-value">50+</span>
            </div>
          </div>
          <div className="info-item">
            <i className="fas fa-circle-check" />
            <div>
              <span className="info-label">Registrations</span>
              <span className="info-value">Open</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Header ─────────────────────────────────────────────────────────────
   Brand lockup + nav (with dropdowns) + language switcher + burger. */
export function MainSiteHeader({
  conf, baseUrl, slug, nav,
}: {
  conf: ConferenceConfig;
  baseUrl: string;
  slug: string;
  nav: NavItem[];
}) {
  const [navOpen, setNavOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLUListElement>(null);

  const closeMenu = () => {
    setNavOpen(false);
    setOpenDropdown(null);
  };

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeMenu();
    };
    document.addEventListener('click', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('click', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  // "June 22-23, 2027" → "JUN 22-23", shown next to the city in the lockup.
  const dm = conf.dates.match(/^(\w+)\s+([\d–\-]+),\s*\d+/);
  const dateShort = dm ? `${dm[1].slice(0, 3)} ${dm[2]}` : conf.dates.replace(/,\s*\d{4}\s*$/, '');
  const logoSvg = getLogoSvg(slug);

  return (
    <div className="site-top">
      <MainInfoStrip conf={conf} baseUrl={baseUrl} />
      <header className="site-header">
        <div className="container header-inner">
          <a href={baseUrl} className="brand brand-v3" aria-label={`${conf.short} home`}>
            {logoSvg
              ? <div className="brand-icon" dangerouslySetInnerHTML={{ __html: logoSvg }} />
              : <div className="brand-icon"><img src={`/logos/${slug}.svg`} alt={`${conf.short} logo`} width={80} height={80} /></div>}
            <div className="brand-divider" />
            <div className="brand-lockup">
              <div className="brand-line-1">
                {conf.discipline}-<span className="brand-year">20{conf.year_suffix}</span>
              </div>
              <div className="brand-line-3">
                {dateShort}
                {conf.city ? (
                  <>
                    <span className="brand-sep">|</span>
                    <span className="brand-country">{conf.city}</span>
                  </>
                ) : null}
              </div>
            </div>
          </a>

          <nav className={`main-nav${navOpen ? ' open' : ''}`} id="mainNav">
            <ul ref={dropdownRef}>
              {nav.map((item) => {
                if (isDropdown(item)) {
                  const isOpen = openDropdown === item.label;
                  return (
                    <li key={item.label} className={`has-dropdown${isOpen ? ' open' : ''}`}>
                      <button
                        type="button"
                        className="nav-dropdown-toggle"
                        aria-haspopup="true"
                        aria-expanded={isOpen}
                        onClick={() => setOpenDropdown((cur) => (cur === item.label ? null : item.label))}
                      >
                        {item.label} <i className="fas fa-chevron-down" />
                      </button>
                      <ul className="dropdown">
                        {item.dropdown.map((sub) => (
                          <li key={sub.href}>
                            <a href={`${baseUrl}${sub.href}`} onClick={closeMenu}>{sub.label}</a>
                          </li>
                        ))}
                      </ul>
                    </li>
                  );
                }
                return (
                  <li key={item.href}>
                    <a
                      href={`${baseUrl}${item.href}`}
                      className={item.cta ? 'btn-nav' : undefined}
                      onClick={closeMenu}
                    >
                      {item.label}
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>

          <LanguageSwitcher />

          <button className="nav-toggle" aria-label="Menu" onClick={() => setNavOpen((v) => !v)}>
            <i className={`fas ${navOpen ? 'fa-times' : 'fa-bars'}`} />
          </button>
        </div>
      </header>
    </div>
  );
}

/* ── Footer ─────────────────────────────────────────────────────────────── */
export function MainSiteFooter({
  conf, baseUrl, slug, columns, legal,
}: {
  conf: ConferenceConfig;
  baseUrl: string;
  slug: string;
  columns: FooterColumn[];
  legal: NavLeaf[];
}) {
  const logoSvg = getLogoSvg(slug);
  const dm = conf.dates.match(/^(\w+)\s+([\d–\-]+),\s*\d+/);
  const dateShort = dm ? `${dm[1].slice(0, 3)} ${dm[2]}` : conf.dates.replace(/,\s*\d{4}\s*$/, '');

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-col footer-brand">
            <a href={baseUrl} className="brand brand-v3 brand-footer" aria-label={`${conf.short} home`}>
              {logoSvg
                ? <div className="brand-icon" dangerouslySetInnerHTML={{ __html: logoSvg }} />
                : <div className="brand-icon"><img src={`/logos/${slug}.svg`} alt={`${conf.short} logo`} width={80} height={80} /></div>}
              <div className="brand-divider" />
              <div className="brand-lockup">
                <div className="brand-line-1">
                  {conf.discipline}-<span className="brand-year">20{conf.year_suffix}</span>
                </div>
                <div className="brand-line-3">{dateShort}</div>
              </div>
            </a>
            <p className="footer-tagline">{conf.tagline}</p>
            <div className="footer-social">
              <a href={conf.social?.twitter || '#'} aria-label="Twitter"><i className="fab fa-twitter" /></a>
              <a href={conf.social?.linkedin || '#'} aria-label="LinkedIn"><i className="fab fa-linkedin-in" /></a>
              <a href={conf.social?.facebook || '#'} aria-label="Facebook"><i className="fab fa-facebook-f" /></a>
              <a href={conf.social?.youtube || '#'} aria-label="YouTube"><i className="fab fa-youtube" /></a>
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.heading} className="footer-col">
              <h5>{col.heading}</h5>
              <ul>
                {col.items.map((item) => (
                  <li key={item.href}>
                    <a href={`${baseUrl}${item.href}`}>{item.label}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="footer-col">
            <h5>Contact &amp; Address</h5>
            <div className="footer-address">
              <div className="fa-line">
                <i className="fas fa-map-marker-alt" />
                <span>
                  {conf.venue && (<>{conf.venue}<br /></>)}
                  {[conf.city, conf.country].filter(Boolean).join(', ') || 'Venue to be announced'}
                </span>
              </div>
              <div className="fa-line">
                <i className="fas fa-calendar" />
                <span>{conf.dates}</span>
              </div>
              <div className="fa-line">
                <i className="fas fa-envelope" />
                <a href={`mailto:${conf.email}`}>{conf.email}</a>
              </div>
              <div className="fa-line">
                <i className="fas fa-phone" />
                <a href={`tel:${conf.phone.replace(/\s/g, '')}`}>{conf.phone}</a>
              </div>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div>&copy; {new Date().getFullYear()} {conf.name}. All rights reserved.</div>
          <div className="footer-links">
            {legal.map((item) => (
              <a key={item.href} href={`${baseUrl}${item.href}`}>{item.label}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
