'use client';

import Link from 'next/link';
import { useCallback, useRef, useEffect, useId, useState } from 'react';
import { Arrow } from './Arrow';
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
  /** accento di sezione per il pannello (--accent / --accent-ink) */
  accent?: { accent: string; ink: string; on: string };
  /** nelle pagine flood, SOLO la voce della sezione corrente porta qui
   *  il colore di sezione: il suo pannello si dipinge di quel colore
   *  (testo nero), tutti gli altri restano neri come la barra */
  floodPanel?: string;
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
  /** strip utility sopra la barra (desktop): sinistra · centro+cta · contatti */
  topbar?: {
    left: string;
    middle: string;
    cta: string;
    ctaHref: string;
    phone?: string;
    email?: string;
  };
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
  topbar,
}: NavProps) {
  const [open, setOpen] = useState(false);
  /* l'overlay resta montato mentre le voci escono: senza, `display:none`
     lo farebbe sparire di colpo e lo stagger non si vedrebbe */
  const [closing, setClosing] = useState(false);
  const [topOpen, setTopOpen] = useState(true);
  // accordion overlay: indice della voce espansa (una alla volta)
  const [expanded, setExpanded] = useState<number | null>(null);
  /* mega-menu: l'apertura la governa JS, non il solo :hover. Serve per
     due cose che il CSS non sa fare — la tregua all'uscita (si può
     tagliare fuori dal pannello per un attimo senza perderlo) e il velo
     che spegne la pagina sotto, che altrimenti ruba il puntatore mentre
     si punta una voce */
  const [panelOpen, setPanelOpen] = useState<number | null>(null);
  const panelTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const PANEL_GRACE_MS = 160;
  const overlayId = useId();
  /* durata dell'uscita: stagger delle voci + animazione dell'ultima */
  const CLOSE_MS = 520;
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wasOpen = useRef(false);

  const clearPanelTimer = () => {
    if (panelTimer.current) clearTimeout(panelTimer.current);
    panelTimer.current = null;
  };

  const openPanel = useCallback((i: number) => {
    clearPanelTimer();
    setPanelOpen(i);
  }, []);

  const closePanelNow = useCallback(() => {
    clearPanelTimer();
    setPanelOpen(null);
  }, []);

  /* uscita con tregua: il puntatore può passare fuori dal pannello
     (tagliando l'angolo verso una voce) senza che si chiuda */
  const closePanelSoon = useCallback(() => {
    clearPanelTimer();
    panelTimer.current = setTimeout(() => setPanelOpen(null), PANEL_GRACE_MS);
  }, []);

  useEffect(() => clearPanelTimer, []);

  const close = useCallback(() => {
    setOpen(false);
    closePanelNow();
  }, [closePanelNow]);

  /* l'uscita si aggancia alla TRANSIZIONE di `open`, non a chi la provoca:
     il menu si chiude dal burger, dai link e dal tasto Esc, e tutti devono
     far partire lo stagger */
  useEffect(() => {
    if (wasOpen.current && !open) {
      setClosing(true);
      if (closeTimer.current) clearTimeout(closeTimer.current);
      closeTimer.current = setTimeout(() => {
        setClosing(false);
        setExpanded(null);
      }, CLOSE_MS);
    }
    if (open) {
      /* riaperto a metà uscita: il timer scaduto resetterebbe l'accordion */
      if (closeTimer.current) clearTimeout(closeTimer.current);
      setClosing(false);
    }
    wasOpen.current = open;
  }, [open]);

  useEffect(
    () => () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
    },
    []
  );

  // topbar chiusa: resta chiusa per la sessione, e l'header si accorcia
  useEffect(() => {
    if (sessionStorage.getItem('topbar') === 'closed') {
      setTopOpen(false);
      document.documentElement.style.setProperty('--topbar-h', '0px');
    }
  }, []);

  const closeTopbar = useCallback(() => {
    setTopOpen(false);
    document.documentElement.style.setProperty('--topbar-h', '0px');
    try {
      sessionStorage.setItem('topbar', 'closed');
    } catch {
      /* niente storage: vale solo per la pagina */
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, close]);

  // Esc chiude anche il mega-menu (che non blocca lo scroll del body)
  useEffect(() => {
    if (panelOpen === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closePanelNow();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [panelOpen, closePanelNow]);

  /* pagina flood: la barra è nel colore di sezione, ma quando si apre il
     pannello di un'ALTRA sezione (nero) anche la barra scivola a nero,
     così barra e pannello leggono come un unico blocco */
  const floodMode = items.some((i) => i.floodPanel);
  const barToBlack =
    floodMode && panelOpen !== null && !items[panelOpen]?.floodPanel;

  const rootClass = [
    styles.nav,
    dark ? styles.dark : '',
    open ? styles.menuOpen : '',
    barToBlack ? styles.navToBlack : '',
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
      {topbar && topOpen && (
        <div className={styles.topbar}>
          <span className={styles.topLeft}>{topbar.left}</span>
          {/* marquee infinito al centro: due gruppi identici, loop -50% */}
          <span className={styles.topMid} aria-label={topbar.middle}>
            <span className={styles.topTrack}>
              {[0, 1].map((copy) => (
                <span
                  key={copy}
                  className={styles.topGroup}
                  aria-hidden={copy === 1 ? 'true' : undefined}
                >
                  {[0, 1, 2].map((i) => (
                    <span key={i} className={styles.topPair}>
                      {topbar.middle}
                      <a
                        href={topbar.ctaHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.topCta}
                        tabIndex={copy === 1 || i > 0 ? -1 : undefined}
                      >
                        {topbar.cta} <Arrow size={12} />
                      </a>
                    </span>
                  ))}
                </span>
              ))}
            </span>
          </span>
          <span className={styles.topRight}>
            {topbar.phone && <a href={`tel:${topbar.phone.replace(/\s/g, '')}`}>{topbar.phone}</a>}
            {topbar.phone && topbar.email && <span aria-hidden="true"> · </span>}
            {topbar.email && <a href={`mailto:${topbar.email}`}>{topbar.email}</a>}
          </span>
          <button
            type="button"
            className={styles.topClose}
            aria-label="chiudi"
            onClick={closeTopbar}
          >
            <svg viewBox="0 0 10 10" width="10" height="10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" aria-hidden="true">
              <path d="M1 1l8 8M9 1l-8 8" />
            </svg>
          </button>
        </div>
      )}
      <div className={styles.inner}>
        <Link href={homeHref} onClick={close} className={styles.brand}>
          <Wordmark />
        </Link>

        <nav className={styles.links}>
          {items.map((item, idx) => (
            <div
              key={item.href}
              className={
                panelOpen === idx
                  ? `${styles.navItem} ${styles.navItemOn}`
                  : styles.navItem
              }
              onPointerEnter={() => item.sub && openPanel(idx)}
              onPointerLeave={() => item.sub && closePanelSoon()}
              onFocus={() => item.sub && openPanel(idx)}
              onBlur={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                  closePanelNow();
                }
              }}
            >
              <Link
                href={item.href}
                className={styles.navLink}
                onClick={closePanelNow}
              >
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
                <div
                  className={
                    panelOpen === idx
                      ? `${styles.panel} ${styles.panelOn}`
                      : styles.panel
                  }
                  style={
                    item.accent || item.floodPanel
                      ? ({
                          ...(item.accent && {
                            '--accent': item.accent.accent,
                            '--accent-ink': item.accent.ink,
                            '--accent-on': item.accent.on,
                          }),
                          /* pannello a colore pieno della sezione corrente:
                             ridefinisce i token della fascia sul pannello
                             stesso (la barra sopra resta nera) */
                          ...(item.floodPanel && {
                            '--bg': item.floodPanel,
                            '--fg': '#000000',
                            '--fg-2': '#141414',
                            '--line': 'rgba(0, 0, 0, 0.28)',
                            color: '#000000',
                          }),
                        } as React.CSSProperties)
                      : undefined
                  }
                >
                  <div className={`wrap ${styles.panelIn}`}>
                    {/* colonna sinistra: numerino, eyebrow, titolo, pre-descrizione */}
                    <div className={styles.panelHead}>
                      <span className={styles.panelLabel}>
                        <span className={styles.panelNum}>
                          {String(idx + 1).padStart(2, '0')}
                        </span>{' '}
                        {item.sub.eyebrow}
                      </span>
                      <span className={styles.panelTitle}>{item.label}</span>
                      <p className={styles.panelDesc}>{item.sub.desc}</p>
                      <Link
                        href={item.href}
                        onClick={closePanelNow}
                        className={`${styles.panelEntry} ${styles.panelExplore}`}
                      >
                        {item.sub.explore} <Arrow />
                      </Link>
                    </div>
                    <ul
                      className={styles.panelList}
                      style={{
                        gridTemplateRows: `repeat(${Math.ceil(item.sub.entries.length / 2)}, auto)`,
                      }}
                    >
                      {item.sub.entries.map((entry) => (
                        <li key={entry.label}>
                          <Link
                            href={entry.href}
                            onClick={closePanelNow}
                            className={styles.panelEntry}
                          >
                            {entry.label}
                            {entry.cross && (
                              <span className={styles.panelCross}>
                                <Arrow dir="ne" size={12} />{' '}
                                {entry.cross.label}
                              </span>
                            )}
                          </Link>
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

      {/* Velo sotto il mega-menu: mentre il pannello è aperto la pagina
          sotto non riceve più il puntatore — niente hover che scattano,
          niente click a vuoto mentre si punta una voce. Sfiorarlo chiude
          il pannello, con la stessa tregua dell'uscita laterale. */}
      {panelOpen !== null && (
        <div
          className={styles.scrim}
          aria-hidden="true"
          onPointerEnter={closePanelSoon}
          onPointerDown={closePanelNow}
        />
      )}

      {/* Overlay mobile: display:none quando chiuso (regola iOS del progetto) */}
      <div
        id={overlayId}
        className={[
          styles.overlay,
          open ? styles.open : '',
          closing ? styles.closing : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <nav className={styles.overlayNav}>
          {items.map((item, i) => {
            const isOpen = expanded === i;
            const hasSub = !!item.sub?.entries.length;
            return (
              <div
                key={item.href}
                className={styles.overlayItem}
                style={{
                  animationDelay: closing
                    ? `${(items.length - 1 - i) * 45}ms`
                    : `${80 + i * 50}ms`,
                }}
              >
                <div className={styles.overlayRow}>
                  <Link
                    href={item.href}
                    onClick={close}
                    className={`display-thin ${styles.overlayLink}`}
                  >
                    {item.label}
                  </Link>
                  {hasSub && (
                    <button
                      type="button"
                      className={
                        isOpen
                          ? `${styles.overlayPlus} ${styles.overlayPlusOpen}`
                          : styles.overlayPlus
                      }
                      aria-expanded={isOpen}
                      aria-label={item.label}
                      onClick={() => setExpanded(isOpen ? null : i)}
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 18 18"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        aria-hidden="true"
                      >
                        <path d="M9 3v12" className={styles.plusV} />
                        <path d="M3 9h12" />
                      </svg>
                    </button>
                  )}
                </div>
                {hasSub && (
                  <div
                    className={
                      isOpen
                        ? `${styles.overlaySub} ${styles.overlaySubOpen}`
                        : styles.overlaySub
                    }
                  >
                    <div>
                      {item.sub!.entries.map((entry) => (
                        <Link
                          key={entry.href + entry.label}
                          href={entry.href}
                          onClick={close}
                          className={styles.overlaySubLink}
                        >
                          {entry.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </nav>
        <div className={styles.overlayFoot}>
          {lang}
          {cta}
        </div>
      </div>
    </header>
  );
}
