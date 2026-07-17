import type { ReactNode } from 'react';
import styles from './Marquee.module.css';

export type MarqueeProps = {
  items: ReactNode[];
  /** durata di un loop in secondi (default 38) */
  speed?: number;
  /** bordi osso-16, testo osso-60 */
  dark?: boolean;
  className?: string;
};

/**
 * Marquee infinito CSS (translateX -50%, contenuto duplicato con
 * aria-hidden, pausa on-hover). Con prefers-reduced-motion degrada
 * a lista statica scrollabile.
 */
export function Marquee({ items, speed = 38, dark = false, className }: MarqueeProps) {
  const cls = [styles.marquee, dark ? styles.dark : '', className]
    .filter(Boolean)
    .join(' ');

  // 3 ripetizioni per metà: il gruppo supera sempre il viewport,
  // così il loop -50% non mostra mai il bordo (niente salti)
  const row = [0, 1, 2].flatMap((rep) =>
    items.map((item, i) => (
      <span className={styles.item} key={`${rep}-${i}`}>
        {item}
      </span>
    ))
  );

  return (
    <div className={cls}>
      <div className={styles.track} style={{ animationDuration: `${speed}s` }}>
        <div className={styles.group}>{row}</div>
        <div className={`${styles.group} ${styles.copy}`} aria-hidden="true">
          {row}
        </div>
      </div>
    </div>
  );
}
