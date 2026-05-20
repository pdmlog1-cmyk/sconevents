'use client';

import Link from 'next/link';
import { useEffect, useState, useMemo } from 'react';
import { conf as defaultConf, type ConferenceConfig } from '@/lib/config';

type Props = {
  /** Absolute URL of the main conference site (e.g. https://cardiology-conference.com).
      When set, the three internal links are rendered as plain <a> tags
      pointing at the absolute URL — used by the landing page so a click
      leaves the campaign deployment for the canonical main site.
      When omitted (main-site usage), <Link> client-side routing is used. */
  baseUrl?: string;
  /** Conference config - if not provided, uses default from lib/config */
  conf?: ConferenceConfig;
};

export default function InfoStrip({ baseUrl, conf: confProp }: Props = {}) {
  const conf = confProp || defaultConf;

  const calcDays = useMemo(() => () => {
    const target = new Date(conf.start_date_iso).getTime();
    if (isNaN(target)) return null;
    return Math.max(0, Math.ceil((target - Date.now()) / 86_400_000));
  }, [conf.start_date_iso]);
  const [days, setDays] = useState<number | null>(() => calcDays());

  useEffect(() => {
    setDays(calcDays());
    const t = setInterval(() => setDays(calcDays()), 60 * 60 * 1000);
    return () => clearInterval(t);
  }, []);

  const countdownText =
    days === null ? '—' :
    days === 0 ? 'Live now' :
    days === 1 ? '1 day' :
    `${days} days`;

  // Helper: when `baseUrl` is set we want a plain anchor so the browser
  // does a full-page nav to the custom domain. Otherwise stay on the
  // same origin via Next.js Link (faster client-side route on main site).
  function NavLink(
    { href, className, children }:
    { href: string; className: string; children: React.ReactNode },
  ) {
    if (baseUrl) {
      return (
        <a href={`${baseUrl}${href}`} className={className}>
          {children}
        </a>
      );
    }
    return <Link href={href} className={className}>{children}</Link>;
  }

  return (
    <div className="info-strip">
      <div className="container">
        <div className="info-strip-inner">
          <div className="info-item">
            <i className="fas fa-hourglass-half" />
            <div>
              <span className="info-label">Days to Event</span>
              <span className="info-value" suppressHydrationWarning>{countdownText}</span>
            </div>
          </div>
          <div className="info-item">
            <i className="fas fa-map-marker-alt" />
            <div>
              <span className="info-label">Venue</span>
              <span className="info-value">{[conf.venue, conf.city].filter(Boolean).join(', ') || 'To be announced'}</span>
            </div>
          </div>
          <NavLink href="/call-for-abstract-submission" className="info-item info-link">
            <i className="fas fa-file-signature" />
            <div>
              <span className="info-label">Abstract Deadline</span>
              <span className="info-value">{conf.abstract_deadline}</span>
            </div>
          </NavLink>
          <NavLink href="/register" className="info-item info-link">
            <i className="fas fa-clock" />
            <div>
              <span className="info-label">Early Bird Ends</span>
              <span className="info-value">{conf.early_bird_deadline}</span>
            </div>
          </NavLink>
          <NavLink href="/register" className="info-cta">
            Register Now <i className="fas fa-arrow-right" />
          </NavLink>
        </div>
      </div>
    </div>
  );
}
