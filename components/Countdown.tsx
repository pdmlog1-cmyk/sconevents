'use client';

import { useEffect, useState } from 'react';

type Props = {
  target: string;
  /** Rendered as 4 tiles: Days / Hrs / Min / Sec with "fact-countdown" classes. Use `aside` for the 3-tile aside variant. */
  variant?: 'factsbar' | 'aside';
};

export default function Countdown({ target, variant = 'factsbar' }: Props) {
  const [parts, setParts] = useState({ d: '000', h: '00', m: '00', s: '00' });

  useEffect(() => {
    const end = new Date(target).getTime();
    const tick = () => {
      const diff = Math.max(0, end - Date.now());
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setParts({
        d: String(d).padStart(3, '0'),
        h: String(h).padStart(2, '0'),
        m: String(m).padStart(2, '0'),
        s: String(s).padStart(2, '0'),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);

  if (variant === 'aside') {
    return (
      <div className="aside-countdown">
        <div><strong>{parts.d}</strong><span>Days</span></div>
        <div><strong>{parts.h}</strong><span>Hrs</span></div>
        <div><strong>{parts.m}</strong><span>Min</span></div>
      </div>
    );
  }

  return (
    <div className="fact-countdown-row">
      <div><strong>{parts.d}</strong><span>Days</span></div>
      <div><strong>{parts.h}</strong><span>Hrs</span></div>
      <div><strong>{parts.m}</strong><span>Min</span></div>
      <div><strong>{parts.s}</strong><span>Sec</span></div>
    </div>
  );
}
