'use client';

import { useEffect } from 'react';

/**
 * Re-render any unrendered hCaptcha widget on the page once the API
 * is available.
 *
 * Fixes the SPA-navigation bug: the global hcaptcha onLoad callback
 * fires only on the initial hard page load. After a client-side
 * navigation (Next.js <Link>) a fresh .h-captcha div mounts but no
 * one re-runs hcaptcha.render(), so the widget stays blank until a
 * hard refresh.
 *
 * Call at the top of any form / modal that contains a `.h-captcha`
 * div. Idempotent — guarded by `:not([data-hcaptcha-widget-id])`.
 *
 * @param when Only attempts to render when truthy. Pass `isOpen`
 *   from a modal so render fires the moment the modal opens (when
 *   the captcha div actually appears in the DOM).
 */
export function useHCaptchaRender(when: boolean = true): void {
  useEffect(() => {
    if (!when) return;
    const tryRender = (): boolean => {
      const w = window as unknown as { hcaptcha?: { render: (el: Element) => unknown } };
      if (!w.hcaptcha) return false;
      document
        .querySelectorAll<HTMLElement>('.h-captcha:not([data-hcaptcha-widget-id])')
        .forEach((el) => {
          try { w.hcaptcha!.render(el); } catch { /* already rendered or invalid */ }
        });
      return true;
    };
    if (tryRender()) return;
    const id = window.setInterval(() => { if (tryRender()) window.clearInterval(id); }, 200);
    const stop = window.setTimeout(() => window.clearInterval(id), 10_000);
    return () => { window.clearInterval(id); window.clearTimeout(stop); };
  }, [when]);
}
