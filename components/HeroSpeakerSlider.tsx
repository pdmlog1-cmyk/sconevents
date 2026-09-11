'use client';

/* Ported from Sconconferences/<slug>/components/HeroSpeakerSlider.tsx — the
   "Featured Speakers" card on the right of the main site's hero.

   Differences from the original:
     · takes SpeakerRecord objects (the speakers.json `speakers` list) instead
       of positional tuples, so the landing page reads the same list, in the
       same order, as the main site's /speakers page
     · "View All Speakers" is a plain <a> to the absolute main-site URL, since
       this deployment has no /speakers route of its own
   Markup and class names are otherwise unchanged, so the .hero-spk-* CSS
   copied from the main site styles it as-is. */

import { useState, useEffect, useCallback } from 'react';
import type { SpeakerRecord } from '@/lib/config';

export default function HeroSpeakerSlider({
  speakers,
  baseUrl,
}: {
  speakers: SpeakerRecord[];
  baseUrl: string;
}) {
  const [idx, setIdx] = useState(0);
  const total = speakers.length;

  const next = useCallback(() => setIdx(i => (i + 1) % total), [total]);

  useEffect(() => {
    if (total <= 1) return;
    const t = setInterval(next, 5000);
    return () => clearInterval(t);
  }, [next, total]);

  if (total === 0) return null;

  const { name, affiliation, photo, abstract_title: abstractTitle, country } = speakers[idx];
  const initials = name.replace(/^(Prof\.|Dr\.|Mr\.|Ms\.|Mrs\.)\s*/i, '').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="hero-spk-wrap">
      <div className="hero-spk">
        <div className="hero-spk-label">
          <span className="hero-spk-line" />
          <span>Featured Speakers</span>
          <span className="hero-spk-line" />
        </div>
        <div className="hero-spk-showcase">
          <div className="hero-spk-photo">
            {photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photo} alt={name} width={320} height={400} />
            ) : (
              <div className="hero-spk-placeholder">{initials}</div>
            )}
          </div>

          <div className="hero-spk-card">
            <span className="hero-spk-badge">Speaker</span>
            <h3 className="hero-spk-name">{name}</h3>
            <p className="hero-spk-affil">{affiliation}</p>
            {country && <p className="hero-spk-country"><i className="fas fa-map-marker-alt" /> {country}</p>}
            {abstractTitle && <p className="hero-spk-abstract"><strong>Abstract Title:</strong> {abstractTitle}</p>}
            <a href={`${baseUrl}/speakers`} className="hero-spk-link">
              View All Speakers <i className="fas fa-arrow-right" />
            </a>
          </div>
        </div>

        {total > 1 && (
          <div className="hero-spk-dots">
            {speakers.map((_, i) => (
              <button
                key={i}
                className={`hero-spk-dot${i === idx ? ' active' : ''}`}
                onClick={() => setIdx(i)}
                aria-label={`Speaker ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
