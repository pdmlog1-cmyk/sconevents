'use client';

import { useEffect, useRef, useState } from 'react';

/* Languages offered in the switcher. */
const LANGS: { code: string; label: string; native: string }[] = [
  { code: 'en',    label: 'English',    native: 'English' },
  { code: 'es',    label: 'Spanish',    native: 'Español' },
  { code: 'fr',    label: 'French',     native: 'Français' },
  { code: 'de',    label: 'German',     native: 'Deutsch' },
  { code: 'pt',    label: 'Portuguese', native: 'Português' },
  { code: 'it',    label: 'Italian',    native: 'Italiano' },
  { code: 'ru',    label: 'Russian',    native: 'Русский' },
  { code: 'zh-CN', label: 'Chinese',    native: '中文' },
  { code: 'ja',    label: 'Japanese',   native: '日本語' },
  { code: 'ko',    label: 'Korean',     native: '한국어' },
  { code: 'ar',    label: 'Arabic',     native: 'العربية' },
  { code: 'hi',    label: 'Hindi',      native: 'हिन्दी' },
];

const STORAGE_KEY = 'conf_lang';
const CACHE_PREFIX = 'tx_';

/* Collect visible text nodes worth translating. */
function collectTextNodes(root: Node): Text[] {
  const out: Text[] = [];
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode: (node) => {
      const text = node.textContent ?? '';
      if (!text.trim()) return NodeFilter.FILTER_REJECT;
      const parent = (node as Text).parentElement;
      if (!parent) return NodeFilter.FILTER_REJECT;
      const tag = parent.tagName;
      if (['SCRIPT', 'STYLE', 'NOSCRIPT', 'CODE', 'PRE'].includes(tag)) return NodeFilter.FILTER_REJECT;
      if (parent.closest('.lang-switcher')) return NodeFilter.FILTER_REJECT;
      if (parent.closest('[data-no-translate]')) return NodeFilter.FILTER_REJECT;
      // Skip our marker class
      if (parent.getAttribute('data-lang-target')) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });
  let n: Node | null;
  while ((n = walker.nextNode())) out.push(n as Text);
  return out;
}

const cache = new Map<string, string>();

async function translateOne(text: string, target: string): Promise<string> {
  const key = `${target}::${text}`;
  if (cache.has(key)) return cache.get(key)!;
  try {
    const stored = sessionStorage.getItem(CACHE_PREFIX + key);
    if (stored) { cache.set(key, stored); return stored; }
  } catch { /* ignore */ }

  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${encodeURIComponent(target)}&dt=t&q=${encodeURIComponent(text)}`;
  try {
    const res = await fetch(url);
    if (!res.ok) return text;
    const data = await res.json();
    // data[0] is an array of [translatedChunk, originalChunk, ...]
    const out = Array.isArray(data[0]) ? data[0].map((chunk: unknown[]) => chunk[0] as string).join('') : text;
    cache.set(key, out);
    try { sessionStorage.setItem(CACHE_PREFIX + key, out); } catch { /* ignore */ }
    return out;
  } catch {
    return text;
  }
}

async function translatePage(target: string) {
  if (target === 'en') return;
  const nodes = collectTextNodes(document.body);
  // Translate in parallel (capped concurrency)
  const CONCURRENCY = 6;
  let idx = 0;
  const workers = Array.from({ length: CONCURRENCY }, async () => {
    while (idx < nodes.length) {
      const node = nodes[idx++];
      const original = node.textContent ?? '';
      const trimmed = original.trim();
      if (!trimmed) continue;
      const translated = await translateOne(trimmed, target);
      if (translated && translated !== trimmed) {
        // Preserve surrounding whitespace
        const lead = original.match(/^\s*/)?.[0] ?? '';
        const trail = original.match(/\s*$/)?.[0] ?? '';
        node.textContent = lead + translated + trail;
        const parent = node.parentElement;
        if (parent) parent.setAttribute('data-lang-target', target);
      }
    }
  });
  await Promise.all(workers);
}

export default function LanguageSwitcher() {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState('en');
  const [working, setWorking] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<MutationObserver | null>(null);
  const currentRef = useRef<string>('en');

  useEffect(() => {
    const saved = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
    if (saved && saved !== 'en') {
      setCurrent(saved);
      currentRef.current = saved;
      // Translate the already-rendered page
      (async () => {
        setWorking(true);
        await translatePage(saved);
        setWorking(false);
      })();
    }

    // Watch for React re-renders and re-translate new text nodes
    const obs = new MutationObserver((mutations) => {
      const target = currentRef.current;
      if (target === 'en') return;
      const fresh: Text[] = [];
      for (const m of mutations) {
        m.addedNodes.forEach((n) => {
          if (n.nodeType === Node.TEXT_NODE) {
            const t = n as Text;
            if (t.textContent?.trim() && !(t.parentElement?.getAttribute('data-lang-target'))) fresh.push(t);
          } else if (n.nodeType === Node.ELEMENT_NODE) {
            fresh.push(...collectTextNodes(n as Element));
          }
        });
      }
      if (fresh.length === 0) return;
      // Translate these new nodes
      (async () => {
        for (const node of fresh) {
          const original = node.textContent ?? '';
          const trimmed = original.trim();
          if (!trimmed) continue;
          const translated = await translateOne(trimmed, target);
          if (translated && translated !== trimmed) {
            const lead = original.match(/^\s*/)?.[0] ?? '';
            const trail = original.match(/\s*$/)?.[0] ?? '';
            node.textContent = lead + translated + trail;
            const p = node.parentElement;
            if (p) p.setAttribute('data-lang-target', target);
          }
        }
      })();
    });
    obs.observe(document.body, { childList: true, subtree: true, characterData: true });
    observerRef.current = obs;

    const onDocClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('click', onDocClick);
    return () => {
      document.removeEventListener('click', onDocClick);
      obs.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pick = async (code: string) => {
    setOpen(false);
    if (code === current) return;
    setCurrent(code);
    currentRef.current = code;
    try { localStorage.setItem(STORAGE_KEY, code); } catch { /* ignore */ }

    if (code === 'en') {
      location.reload();
      return;
    }
    setWorking(true);
    await translatePage(code);
    setWorking(false);
  };

  const activeLabel = LANGS.find(l => l.code === current)?.native ?? 'English';

  return (
    <div className="lang-switcher" ref={wrapRef} data-no-translate>
      <button
        type="button"
        className="lang-trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen(v => !v)}
        title="Change language"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="10" />
          <path d="M2 12h20" />
          <path d="M12 2a15 15 0 0 1 0 20" />
          <path d="M12 2a15 15 0 0 0 0 20" />
        </svg>
        <span className="lang-label">{working ? '…' : activeLabel}</span>
        <i className="fas fa-chevron-down lang-caret" aria-hidden="true" />
      </button>

      {open && (
        <ul className="lang-menu" role="listbox">
          {LANGS.map(l => (
            <li key={l.code} role="option" aria-selected={current === l.code}>
              <button
                type="button"
                className={`lang-option${current === l.code ? ' is-active' : ''}`}
                onClick={() => pick(l.code)}
              >
                <span className="lang-native">{l.native}</span>
                <span className="lang-en">{l.label}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
