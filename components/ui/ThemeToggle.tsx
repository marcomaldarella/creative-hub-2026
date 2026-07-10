'use client';

import styles from './ThemeToggle.module.css';

export type ThemeToggleProps = {
  /** aria-label del bottone (da dizionario; default 'tema') */
  label?: string;
  className?: string;
};

/**
 * Interruttore light/dark: scrive data-theme su <html> e persiste in
 * localStorage ('theme'). Lo stato iniziale lo applica lo script inline
 * nel layout prima del paint; qui niente state React — quale icona
 * mostrare lo decide la CSS su [data-theme], così non c'è mismatch
 * di hydration.
 */
export function ThemeToggle({ label = 'tema', className }: ThemeToggleProps) {
  const toggle = () => {
    const root = document.documentElement;
    const dark = root.dataset.theme === 'dark';
    if (dark) {
      delete root.dataset.theme;
    } else {
      root.dataset.theme = 'dark';
    }
    try {
      localStorage.setItem('theme', dark ? 'light' : 'dark');
    } catch {
      /* storage non disponibile: il tema vale solo per la pagina */
    }
  };

  return (
    <button
      type="button"
      aria-label={label}
      className={[styles.toggle, className].filter(Boolean).join(' ')}
      onClick={toggle}
    >
      <svg
        className={styles.sun}
        viewBox="0 0 24 24"
        width="16"
        height="16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="4.4" />
        <path d="M12 2.5v2.4M12 19.1v2.4M2.5 12h2.4M19.1 12h2.4M5.3 5.3l1.7 1.7M17 17l1.7 1.7M18.7 5.3L17 7M7 17l-1.7 1.7" />
      </svg>
      <svg
        className={styles.moon}
        viewBox="0 0 24 24"
        width="16"
        height="16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M20 13.6A8.2 8.2 0 0 1 10.4 4a8.2 8.2 0 1 0 9.6 9.6Z" />
      </svg>
    </button>
  );
}
