import type { CSSProperties } from 'react';
import styles from './PartnerMark.module.css';

/**
 * Loghi locali (public/img/partners). ratio = viewBox w/h dell'SVG,
 * h = altezza in px calibrata a occhio perché i marchi pesino uguale.
 */
const LOGOS: Record<string, { file: string; ratio: number; h: number }> = {
  'sony music': { file: 'sony-music', ratio: 1.07, h: 57 },
  'universal music group': { file: 'universal', ratio: 2.7, h: 51 },
  'warner music group': { file: 'warner', ratio: 4.06, h: 45 },
  rai: { file: 'rai', ratio: 1, h: 54 },
  dolby: { file: 'dolby', ratio: 3.95, h: 42 },
  'solid state logic': { file: 'ssl', ratio: 4.81, h: 36 },
  adobe: { file: 'adobe', ratio: 3.96, h: 39 },
  ableton: { file: 'ableton', ratio: 5.71, h: 33 },
  steinberg: { file: 'steinberg', ratio: 4.46, h: 39 },
  avid: { file: 'avid', ratio: 2.34, h: 45 },
  apple: { file: 'apple', ratio: 0.81, h: 48 },
  'berklee college of music': { file: 'berklee', ratio: 3.99, h: 42 },
  google: { file: 'google', ratio: 2.96, h: 42 },
  'ik multimedia': { file: 'ik-multimedia', ratio: 3.65, h: 40 },
  pearson: { file: 'pearson', ratio: 4.99, h: 36 },
  'coventry university': { file: 'coventry', ratio: 3.57, h: 44 },
  'erasmus+': { file: 'erasmus-plus', ratio: 3.49, h: 40 },
  'confindustria emilia': { file: 'confindustria', ratio: 1.93, h: 48 },
  'università di bologna': { file: 'unibo', ratio: 1, h: 54 },
  'cnr tecnopolo bologna': { file: 'cnr', ratio: 8.57, h: 34 },
  'regione emilia-romagna': { file: 'regione-emilia-romagna', ratio: 1, h: 48 },
  'comune di bologna': { file: 'comune-bologna', ratio: 0.66, h: 54 },
};

export type PartnerMarkProps = {
  name: string;
};

/**
 * Marchio partner per il Marquee: se esiste l'SVG locale lo renderizza
 * come mask riempita di currentColor (così eredita colore e hover
 * dell'item e si inverte col tema); altrimenti degrada al nome testuale.
 */
export function PartnerMark({ name }: PartnerMarkProps) {
  const logo = LOGOS[name.trim().toLowerCase()];
  if (!logo) return <>{name}</>;

  const style = {
    '--logo': `url(/img/partners/${logo.file}.svg)`,
    height: `${logo.h}px`,
    aspectRatio: logo.ratio,
  } as CSSProperties;

  return <span className={styles.mark} role="img" aria-label={name} style={style} />;
}
