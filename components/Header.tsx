'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import BrandLogo from './BrandLogo';
import InfoStrip from './InfoStrip';
import LanguageSwitcher from './LanguageSwitcher';
import { navigationData, isDropdown, type HeaderNavItem } from '@/lib/config';

const HEADER_NAV = navigationData.header as HeaderNavItem[];

export default function Header() {
  const pathname = usePathname();
  // Campaign landing page renders its own top bar — skip the main-site chrome.
  if (pathname?.startsWith('/landing')) return null;

  const [navOpen, setNavOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLLIElement>(null);

  // Close everything (used when a nav link is tapped)
  const closeMenu = () => {
    setNavOpen(false);
    setOpenDropdown(null);
  };

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeMenu();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="site-top">
      <InfoStrip />
      <header className="site-header">
        <div className="container header-inner">
          <BrandLogo variant="header" />
          <nav className={`main-nav${navOpen ? ' open' : ''}`} id="mainNav">
            <ul>
              {HEADER_NAV.map((item) => {
                if (isDropdown(item)) {
                  const isOpen = openDropdown === item.label;
                  return (
                    <li
                      key={item.label}
                      ref={dropdownRef}
                      className={`has-dropdown${isOpen ? ' open' : ''}`}
                    >
                      <button
                        type="button"
                        className="nav-dropdown-toggle"
                        aria-haspopup="true"
                        aria-expanded={isOpen}
                        onClick={() => setOpenDropdown((cur) => (cur === item.label ? null : item.label))}
                      >
                        {item.label} <i className="fas fa-chevron-down" />
                      </button>
                      <ul className="dropdown">
                        {item.dropdown.map((sub) => (
                          <li key={sub.href}>
                            <Link href={sub.href} onClick={closeMenu}>
                              {sub.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </li>
                  );
                }
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={item.cta ? 'btn-nav' : undefined}
                      onClick={closeMenu}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
          <LanguageSwitcher />
          <button className="nav-toggle" aria-label="Menu" onClick={() => setNavOpen((v) => !v)}>
            <i className={`fas ${navOpen ? 'fa-times' : 'fa-bars'}`} />
          </button>
        </div>
      </header>
    </div>
  );
}
