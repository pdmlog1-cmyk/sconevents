'use client';

/* Ported from Sconconferences/neurology/components/EarlyBirdBanner.tsx.
   Difference from the main-site original: that one imports `conf` from
   '@/lib/config' because it serves a single conference. This deployment
   serves ten, so the conference and the absolute main-site URL arrive as
   props instead. Markup and class names are unchanged. */

import { useEffect, useState } from 'react';
import type { ConferenceConfig } from '@/lib/config';

function parseDeadline(dateStr: string): Date | null {
  try {
    const d = new Date(dateStr + ' 23:59:59');
    return isNaN(d.getTime()) ? null : d;
  } catch {
    return null;
  }
}

function getTimeLeft(deadline: Date) {
  const diff = deadline.getTime() - Date.now();
  if (diff <= 0) return null;
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

const ROTATING_MESSAGES = [
  (deadline: string) => `Early bird discount closes ${deadline} — register before rates increase.`,
  () => 'Bring your partner and earn 10% discount on registration fee.',
  () => "Can't attend in person? Join us virtually from anywhere in the world.",
];

type Props = {
  conf: ConferenceConfig;
  /** Absolute URL of the canonical main site — the CTA leaves this deployment. */
  baseUrl: string;
};

export default function EarlyBirdBanner({ conf, baseUrl }: Props) {
  const deadline = parseDeadline(conf.early_bird_deadline);
  const [timeLeft, setTimeLeft] = useState<ReturnType<typeof getTimeLeft>>(null);
  const [dismissed, setDismissed] = useState(false);
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    try {
      if (sessionStorage.getItem('eb-banner-dismissed') === '1') {
        setDismissed(true);
        return;
      }
    } catch {}

    if (!deadline) return;
    setTimeLeft(getTimeLeft(deadline));
    const timer = setInterval(() => {
      setTimeLeft(getTimeLeft(deadline));
    }, 1000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const rotator = setInterval(() => {
      setMsgIndex(i => (i + 1) % ROTATING_MESSAGES.length);
    }, 3500);
    return () => clearInterval(rotator);
  }, []);

  if (dismissed) return null;
  if (!deadline) return null;

  const expired = !timeLeft;

  return (
    <div className="eb-banner" role="region" aria-label="Early bird registration deadline">
      <div className="eb-banner-inner">
        {expired ? (
          <span className="eb-message">
            <i className="fas fa-clock" /> Early bird pricing has ended — standard rates now apply.
          </span>
        ) : (
          <>
            <span className="eb-label">
              <span className="eb-dot" aria-hidden="true" />
              Early Bird Closes
            </span>

            <span className="eb-countdown">
              {[
                { v: timeLeft.days,    l: 'Days' },
                { v: timeLeft.hours,   l: 'Hrs'  },
                { v: timeLeft.minutes, l: 'Min'  },
                { v: timeLeft.seconds, l: 'Sec'  },
              ].map(({ v, l }) => (
                <span key={l} className="eb-unit">
                  <strong>{String(v).padStart(2, '0')}</strong>
                  <small>{l}</small>
                </span>
              ))}
            </span>

            <span className="eb-warning" key={msgIndex}>
              {ROTATING_MESSAGES[msgIndex](conf.early_bird_deadline)}
            </span>

            <a href={`${baseUrl}/register`} className="eb-cta">
              Register Now <i className="fas fa-arrow-right" />
            </a>
          </>
        )}
      </div>
    </div>
  );
}
