'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { conf, navigationData, type FooterColumn, type NavLink } from '@/lib/config';
import BrandLogo from './BrandLogo';

const FOOTER_COLUMNS = navigationData.footer_columns as FooterColumn[];
const FOOTER_LEGAL = navigationData.footer_legal as NavLink[];

export default function Footer() {
  const pathname = usePathname();
  // Campaign landing page renders its own compact footer — skip site footer.
  if (pathname?.startsWith('/landing')) return null;

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-col footer-brand">
            <BrandLogo variant="footer" />
            <p className="footer-tagline">{conf.tagline}</p>
            <div className="footer-social">
              <a href={conf.social.twitter} aria-label="Twitter"><i className="fab fa-twitter" /></a>
              <a href={conf.social.linkedin} aria-label="LinkedIn"><i className="fab fa-linkedin-in" /></a>
              <a href={conf.social.facebook} aria-label="Facebook"><i className="fab fa-facebook-f" /></a>
              <a href={conf.social.youtube} aria-label="YouTube"><i className="fab fa-youtube" /></a>
            </div>
          </div>

          {FOOTER_COLUMNS.map((col) => (
            <div key={col.heading} className="footer-col">
              <h5>{col.heading}</h5>
              <ul>
                {col.items.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href}>{item.label}</Link>
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
            {FOOTER_LEGAL.map((item) => (
              <Link key={item.href} href={item.href}>{item.label}</Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
