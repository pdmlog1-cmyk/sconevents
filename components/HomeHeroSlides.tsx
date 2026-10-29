'use client';

/* The sconevents.com hero: photos from SCON's own past congresses fill the
   band in turn, with the heading laid over them. The caption says what each
   moment is; the dots jump to any one. A visit opens on the last photo, then
   the show carries on from the first. Visitors who ask for reduced motion get
   that opening photo and the dots, but no automatic change. */

import { useEffect, useState, type ReactNode } from 'react';

export type HeroSlide = {
  src: string;
  /** object-position keeping the photo's people in frame */
  focus: string;
  /** what the photo shows, e.g. "Keynote at the podium" */
  label: string;
};

const SLIDE_MS = 5500;
/* the dots take the network's colours in turn */
const DOT_COLOURS = ['#f0b429', '#e8536e', '#7541d4', '#0b8f8a', '#2f6fec'];

export default function HomeHeroSlides({
  slides, children, footer,
}: { slides: HeroSlide[]; children: ReactNode; footer: ReactNode }) {
  const opening = Math.max(slides.length - 1, 0);
  const [idx, setIdx] = useState(opening);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || slides.length < 2) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = setInterval(() => setIdx(i => (i + 1) % slides.length), SLIDE_MS);
    return () => clearInterval(id);
  }, [paused, slides.length]);

  const cur = slides[idx];
  const colour = (i: number) => DOT_COLOURS[i % DOT_COLOURS.length];

  return (
    <section
      className="sh-hero sh-hero--photo"
      id="top"
      style={{ '--c-accent': colour(idx) } as React.CSSProperties}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="sh-hero-slides" aria-hidden>
        {slides.map((s, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={s.src}
            src={s.src}
            alt=""
            loading={i === opening ? 'eager' : 'lazy'}
            className={i === idx ? 'is-on' : undefined}
            style={{ objectPosition: s.focus }}
          />
        ))}
      </div>
      <div className="sh-hero-veil" aria-hidden />

      <div className="sh-wrap sh-hero-content">
        {children}

        {cur && (
          <div className="sh-hero-now">
            <p className="sh-hero-caption" aria-live="polite">
              <span className="sh-hero-caption-tag">At past SCON congresses</span>
              <b>{cur.label}</b>
            </p>
            <div className="sh-hero-dots" role="tablist" aria-label="Congress photos">
              {slides.map((s, i) => (
                <button
                  key={s.src}
                  type="button"
                  role="tab"
                  aria-selected={i === idx}
                  aria-label={s.label}
                  className={i === idx ? 'is-on' : undefined}
                  style={{ '--c-accent': colour(i) } as React.CSSProperties}
                  onClick={() => setIdx(i)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="sh-wrap">{footer}</div>
    </section>
  );
}
