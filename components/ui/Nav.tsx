'use client';

import Link from 'next/link';
import { useCallback, useEffect, useId, useState } from 'react';
import { ThemeToggle } from './ThemeToggle';
import { Wordmark } from './Wordmark';
import styles from './Nav.module.css';

export type NavSubEntry = {
  label: string;
  href: string;
  /** rimando a un'altra sezione (es. "/studio"), stile mono */
  cross?: { label: string; href: string };
};

export type NavSub = {
  /** eyebrow mono del pannello (es. "/academy") */
  eyebrow: string;
  desc: string;
  /** label del link "esplora la sezione" */
  explore: string;
  entries: NavSubEntry[];
};

export type NavItem = {
  label: string;
  href: string;
  /** mega-menu della sezione (solo desktop, hover/focus) */
  sub?: NavSub;
};

export type NavProps = {
  /** link di sezione (label già localizzate) */
  items: NavItem[];
  /** lingua attiva */
  locale: 'it' | 'en';
  /** path già costruiti per lo switcher lingua */
  langHrefs: { it: string; en: string };
  /** CTA pill */
  bookHref: string;
  bookLabel: string;
  /** true se bookHref è esterno (WooCommerce): target _blank + rel */
  bookExternal?: boolean;
  /** href del wordmark (default '/') */
  homeHref?: string;
  /** variante per pagine con hero petrolio */
  dark?: boolean;
  /** aria-label del bottone hamburger (da dizionario; default 'menu') */
  menuLabel?: string;
  /** aria-label dello switcher lingua (da dizionario; default 'lingua') */
  langLabel?: string;
};

export function Nav({
  items,
  locale,
  langHrefs,
  bookHref,
  bookLabel,
  bookExternal = false,
  homeHref = '/',
  dark = false,
  menuLabel = 'menu',
  langLabel = 'lingua',
}: NavProps) {
  const [open, setOpen] = useState(false);
  const overlayId = useId();
  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const rootClass = [
    styles.nav,
    dark ? styles.dark : '',
    open ? styles.menuOpen : '',
  ]
    .filter(Boolean)
    .join(' ');

  const lang = (
    <span className={styles.lang} role="group" aria-label={langLabel}>
      <Link
        href={langHrefs.it}
        onClick={close}
        aria-current={locale === 'it' ? 'true' : undefined}
        className={locale === 'it' ? styles.langOn : undefined}
      >
        it
      </Link>
      <span aria-hidden="true"> / </span>
      <Link
        href={langHrefs.en}
        onClick={close}
        aria-current={locale === 'en' ? 'true' : undefined}
        className={locale === 'en' ? styles.langOn : undefined}
      >
        en
      </Link>
    </span>
  );

  const cta = bookExternal ? (
    <a
      href={bookHref}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.cta}
    >
      {bookLabel}
    </a>
  ) : (
    <Link href={bookHref} onClick={close} className={styles.cta}>
      {bookLabel}
    </Link>
  );

  return (
    <header className={rootClass}>
      <div className={styles.inner}>
        <Link href={homeHref} onClick={close} className={styles.brand}>
          <Wordmark />
        </Link>

        <nav className={styles.links}>
          {items.map((item) => (
            <div key={item.href} className={styles.navItem}>
              <Link href={item.href} className={styles.navLink}>
                {item.label}
                {item.sub && (
                  <svg
                    className={styles.caret}
                    viewBox="0 0 10 6"
                    width="10"
                    height="6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    aria-hidden="true"
                  >
                    <path d="M1 1l4 4 4-4" />
                  </svg>
                )}
              </Link>

              {item.sub && (
                <div className={styles.panel}>
                  <div className={`wrap ${styles.panelIn}`}>
                    <div className={styles.panelIntro}>
                      <span className={`mono ${styles.panelEyebrow}`}>
                        {item.sub.eyebrow}
                      </span>
                      <span className={`display-black ${styles.panelTitle}`}>
                        {item.label}
                      </span>
                      <p className={styles.panelDesc}>{item.sub.desc}</p>
                      <Link href={item.href} className={styles.panelExplore}>
                        {item.sub.explore} <span aria-hidden="true">→</span>
                      </Link>
                    </div>
                    <ul
                      className={styles.panelList}
                      style={{
                        gridTemplateRows: `repeat(${Math.ceil(item.sub.entries.length / 2)}, auto)`,
                      }}
                    >
                      {item.sub.entries.map((entry) => (
                        <li key={entry.label} className={styles.panelRow}>
                          <Link href={entry.href} className={styles.panelEntry}>
                            <span className={styles.panelChev} aria-hidden="true">
                              ›
                            </span>
                            {entry.label}
                          </Link>
                          {entry.cross && (
                            <Link
                              href={entry.cross.href}
                              className={`mono ${styles.panelCross}`}
                            >
                              <span aria-hidden="true">↗</span> {entry.cross.label}
                            </Link>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          ))}
        </nav>

        {lang}
        <ThemeToggle className={styles.theme} />
        {cta}

        <button
          type="button"
          className={styles.burger}
          aria-label={menuLabel}
          aria-expanded={open}
          aria-controls={overlayId}
          onClick={() => setOpen((v) => !v)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      {/* Overlay mobile: display:none quando chiuso (regola iOS del progetto) */}
      <div
        id={overlayId}
        className={open ? `${styles.overlay} ${styles.open}` : styles.overlay}
      >
        <nav className={styles.overlayNav}>
          {items.map((item, i) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={close}
              className={`display-thin ${styles.overlayLink}`}
              style={{ animationDelay: `${80 + i * 50}ms` }}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className={styles.overlayFoot}>
          {lang}
          <ThemeToggle />
          {cta}
        </div>
      </div>
    </header>
  );
}
