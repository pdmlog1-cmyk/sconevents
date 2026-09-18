'use client';

/* "Meet Our Esteemed Experts" — the first few speakers from the conference's
   real speaker list (speakers.json `speakers`, the same list the main site's
   /speakers page renders), shown above the Sessions section.

   The first card is the featured one; the rest are plain cards. Speakers
   without a photo fall back to initials, exactly like the main site. Cards
   reveal on scroll with a small stagger — one IntersectionObserver, and the
   animation is skipped for visitors who ask for reduced motion.

   Only rendered for conferences that have a speaker list, so the other
   landing pages are untouched. */

import { useEffect, useRef, useState } from 'react';
import type { SpeakerRecord } from '@/lib/config';

/* First name + family name, like the main site: "Prof. Sergei M. Danilov, MD,
   PhD" → SD. Titles are dropped, and so is everything after the first comma,
   which is where the degrees sit. */
const initialsOf = (name: string) => {
  const core = name
    .replace(/^(Prof\.|Dr\.|Mr\.|Ms\.|Mrs\.)\s*/i, '')
    .split(',')[0]
    .trim();
  // A letter is anything whose upper and lower case differ — true for "Ş" and
  // other non-ASCII letters too, without needing a unicode regex flag.
  const isLetter = (c: string) => !!c && c.toLowerCase() !== c.toUpperCase();
  const words = core.split(/\s+/).filter(w => isLetter(w[0]));
  if (!words.length) return '';
  const first = words[0][0];
  const last = words.length > 1 ? words[words.length - 1][0] : '';
  return (first + last).toUpperCase();
};

/** Affiliations can list several appointments separated by ";" — show the first. */
const primaryAffiliation = (affiliation: string) => (affiliation || '').split(';')[0].trim();

export default function SpeakersStrip({
  speakers,
  baseUrl,
  heading = 'Meet Our Esteemed Experts',
}: {
  speakers: SpeakerRecord[];
  baseUrl: string;
  heading?: string;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    // No observer (very old browser) or reduced motion: show them straight away
    // rather than leave the cards stuck at opacity 0.
    if (
      typeof IntersectionObserver === 'undefined' ||
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    ) {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      entries => {
        if (entries.some(e => e.isIntersecting)) {
          setShown(true);
          io.disconnect();
        }
      },
      { rootMargin: '0px 0px -12% 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  if (!speakers.length) return null;

  return (
    <section className="lpb-band lpb-spk-band" aria-labelledby="lpb-spk-heading">
      <div className="lpb-spk-head">
        <h2 id="lpb-spk-heading">{heading}</h2>
        <a href={`${baseUrl}/speakers`} className="lpb-spk-all">
          View All Speakers <i className="fas fa-arrow-right" />
        </a>
      </div>

      <div ref={wrapRef} className={`lpb-spk-grid${shown ? ' is-shown' : ''}`}>
        {speakers.map((sp, i) => {
          const org = primaryAffiliation(sp.affiliation);
          const featured = i === 0;
          return (
            <article
              key={sp.name}
              className={`lpb-spk-card${featured ? ' lpb-spk-card-lead' : ''}`}
              style={{ transitionDelay: `${i * 110}ms` }}
            >
              <div className="lpb-spk-photo">
                {sp.photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={sp.photo} alt="" loading="lazy" decoding="async" />
                ) : (
                  <span className="lpb-spk-initials" aria-hidden>{initialsOf(sp.name)}</span>
                )}
                {featured && <span className="lpb-spk-badge">Keynote Speaker</span>}
              </div>

              <div className="lpb-spk-body">
                <h3 className="lpb-spk-name">{sp.name}</h3>
                {org && <p className="lpb-spk-org">{org}</p>}
                {sp.country && (
                  <p className="lpb-spk-country">
                    <i className="fas fa-location-dot" aria-hidden /> {sp.country}
                  </p>
                )}
                {sp.abstract_title && (
                  <p className="lpb-spk-topic">
                    <i className="fas fa-microscope" aria-hidden />
                    <span>{sp.abstract_title}</span>
                  </p>
                )}
              </div>

              <a
                href={`${baseUrl}/speakers`}
                className="lpb-spk-more"
                aria-label={`See ${sp.name} on the speakers page`}
              >
                <i className="fas fa-plus" aria-hidden />
              </a>
            </article>
          );
        })}
      </div>
    </section>
  );
}
