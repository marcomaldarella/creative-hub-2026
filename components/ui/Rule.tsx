'use client';

import { useRevealOnce } from './Reveal';
import styles from './Rule.module.css';

export type RuleProps = {
  /** etichetta mono a sinistra */
  left?: string;
  /** etichetta mono a destra */
  right?: string;
  /** linea osso-16, etichette azzurro */
  dark?: boolean;
  className?: string;
};

/**
 * La regola con doppia etichetta del brand: `label ——— label`.
 * La linea si disegna con scaleX quando entra nel viewport.
 */
export function Rule({ left, right, dark = false, className }: RuleProps) {
  const ref = useRevealOnce<HTMLDivElement>();
  const cls = [styles.rule, dark ? styles.dark : '', className]
    .filter(Boolean)
    .join(' ');

  return (
    <div ref={ref} className={cls} role="separator">
      {left && <span className={`mono ${styles.label}`}>{left}</span>}
      <span className={styles.line} aria-hidden="true" />
      {right && <span className={`mono ${styles.label}`}>{right}</span>}
    </div>
  );
}
