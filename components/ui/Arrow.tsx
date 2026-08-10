import styles from './Arrow.module.css';

/** e = →  ·  ne = ↗  ·  sw = ↙  ·  w = ←  */
export type ArrowDir = 'e' | 'w' | 'ne' | 'sw';

export type ArrowProps = {
  dir?: ArrowDir;
  /** lato del quadrato in px (default 14) */
  size?: number;
  className?: string;
};

const ROTATION: Record<ArrowDir, number> = {
  e: 0,
  w: 180,
  ne: -45,
  sw: 135,
};

/**
 * La freccia del brand, DISEGNATA.
 *
 * ⚠️ Mai i caratteri unicode ↗ ↙ ⬆ ➡: iOS/Android li rendono con
 * l'emoji a colori (↗️), e nel mezzo di una parola in Helvetica è un
 * disastro. Le frecce del sito sono sempre SVG, currentColor, come
 * questa: il verso lo dà la rotazione, così una sola forma basta.
 */
export function Arrow({ dir = 'e', size = 14, className }: ArrowProps) {
  return (
    <svg
      viewBox="0 0 16 16"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={[styles.arrow, className].filter(Boolean).join(' ')}
      style={{ transform: `rotate(${ROTATION[dir]}deg)` }}
      aria-hidden="true"
      focusable="false"
    >
      <path d="M2.4 8h11.2" />
      <path d="M9.2 3.6 13.6 8l-4.4 4.4" />
    </svg>
  );
}
