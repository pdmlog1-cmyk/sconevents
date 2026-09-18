'use client';

/* Main-site style info strip: Venue · Abstract Deadline · Expected Attendees ·
   Registrations. Markup and class names are copied from
   Sconconferences/<slug>/components/InfoStrip.tsx, so the `.info-strip` CSS
   already in app/globals.css styles it unchanged.

   This is the arrangement the main conference sites use. The landing page's
   own InfoStrip.tsx stays as it is — it leads with "Days to Event" and ends
   with a Register CTA, and the other nine landing pages still use it. Links
   are absolute <a> tags to the canonical main site, because this deployment
   only serves /<slug>. */

import type { ConferenceConfig } from '@/lib/config';

export default function MainInfoStrip({
  conf,
  baseUrl,
}: {
  conf: ConferenceConfig;
  baseUrl: string;
}) {
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
              <span className="info-value">{conf.expected_attendees || '50+'}</span>
            </div>
          </div>
          <div className="info-item">
            <i className="fas fa-circle-check" />
            <div>
              <span className="info-label">Registrations</span>
              <span className="info-value">{conf.registrations_status || 'Open'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
