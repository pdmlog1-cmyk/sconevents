import { conf } from '@/lib/config';
import Link from 'next/link';

type Props = { variant?: 'header' | 'footer' };

/**
 * Premium emblem — gradient tile + accent ribbon + topic glyph + initials chip.
 * The topic glyph block is swapped per-conference by _patch-logos.mjs using
 * markers: `{/* Soft radial glow behind target *\/}` and `{/* Corner technical dots *\/}`.
 */
export default function BrandLogo({ variant = 'header' }: Props) {
  const isFooter = variant === 'footer';
  const suffix = isFooter ? 'F' : 'H';
  const yearFull = conf.year_suffix === '27' ? '2027' : `20${conf.year_suffix}`;
  const dm = conf.dates.match(/^(\w+)\s+([\d\-]+),\s*\d+/);
  const dateShort = dm ? `${dm[1].slice(0, 3)} ${dm[2]}` : conf.dates.replace(/,\s*\d{4}\s*$/, '');

  return (
    <Link href="/" className={`brand brand-v3${isFooter ? ' brand-footer' : ''}`}>
      <div className="brand-icon">
        <svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg" aria-label={`${conf.short} logo`}>
          <defs>
            <linearGradient id={`tile${suffix}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%"   style={{ stopColor: 'var(--ink-soft)' }} />
              <stop offset="55%"  style={{ stopColor: 'var(--ink)' }} />
              <stop offset="100%" style={{ stopColor: 'var(--ink)' }} />
            </linearGradient>
            <linearGradient id={`acc${suffix}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%"   style={{ stopColor: 'var(--accent)', stopOpacity: 0.9 }} />
              <stop offset="100%" style={{ stopColor: 'var(--accent)' }} />
            </linearGradient>
            <radialGradient id={`glow${suffix}`} cx="0.5" cy="0.5" r="0.6">
              <stop offset="0%"   style={{ stopColor: 'var(--accent)' }} stopOpacity="0.3" />
              <stop offset="100%" style={{ stopColor: 'var(--accent)' }} stopOpacity="0" />
            </radialGradient>
            <linearGradient id={`hi${suffix}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"  stopColor="#ffffff" stopOpacity="0.16" />
              <stop offset="45%" stopColor="#ffffff" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Refined rounded tile */}
          <rect x="3" y="3" width="74" height="74" rx="20" fill={`url(#tile${suffix})`} />
          <rect x="3" y="3" width="74" height="74" rx="20" fill={`url(#hi${suffix})`} />
          <rect x="7" y="7" width="66" height="66" rx="16" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="0.8" />

          {/* Accent ribbon (top-right corner) */}
          <path d="M 77 3 L 77 31 L 49 3 Z" fill={`url(#acc${suffix})`} />
          <path d="M 77 3 L 77 31 L 49 3 Z" fill="none" stroke="rgba(255,255,255,0.16)" strokeWidth="0.6" />

          {/* addiction icon — side-profile head + pill capsule (cognitive/neurobiology theme) */}

          <ellipse cx="40" cy="40" rx="22" ry="22" fill={`url(#glow${suffix})`} />

          {/* White head profile silhouette (facing right, scaled-up from favicon) */}
          <path d="M 18 60 L 18 38 C 18 26, 28 18, 40 20 C 50 22, 54 30, 54 38 L 58 42 L 54 46 L 54 52 C 54 56, 51 60, 46 60 Z" fill="#ffffff" />
          {/* Eye */}
          <circle cx="44" cy="36" r="1.6" fill="rgba(31,6,6,0.95)" />
          {/* Mouth hint */}
          <path d="M 48 46 Q 52 47, 54 46" stroke="rgba(31,6,6,0.85)" strokeWidth="0.9" fill="none" strokeLinecap="round" />

          {/* Pill capsule (substance) — diagonal */}
          <g transform="translate(64 22) rotate(-25)">
            <rect x="-9" y="-3.5" width="18" height="7" rx="3.5" fill="var(--accent)" />
            <rect x="0" y="-3.5" width="9" height="7" rx="3.5" fill="rgba(255,255,255,0.35)" />
          </g>
          {/* Thought bubble dots between head and capsule */}
          <circle cx="60" cy="34" r="1.6" fill="var(--accent)" />
          <circle cx="56" cy="38" r="1.2" fill="var(--accent)" />

          {/* Corner technical dots */}
          <circle cx="11" cy="11" r="1.2" fill="rgba(255,255,255,0.28)" />
          <circle cx="11" cy="69" r="1.2" fill="rgba(255,255,255,0.18)" />

          {/* Initials chip (bottom-right) */}
          <g transform="translate(44 57)">
            <rect x="0" y="0" width="28" height="16" rx="4.5" fill="rgba(0,0,0,0.42)" stroke="rgba(255,255,255,0.22)" strokeWidth="0.6" />
            <text x="14" y="12" textAnchor="middle" fontFamily="'JetBrains Mono', monospace" fontSize="7.5" fontWeight="700" fill="#ffffff" letterSpacing="0.5">
              {conf.initials.slice(0, 4)}
            </text>
          </g>
        </svg>
      </div>
      <div className="brand-divider" />
      <div className="brand-lockup">
        <div className="brand-line-1">
          {conf.discipline}-<span className="brand-year">{yearFull}</span>
        </div>
        <div className="brand-line-3">
          {dateShort}{conf.country ? <><span className="brand-sep">|</span><span className="brand-country">{conf.country}</span></> : null}
        </div>
      </div>
    </Link>
  );
}
