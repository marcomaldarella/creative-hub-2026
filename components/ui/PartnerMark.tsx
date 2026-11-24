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
  /* loghi ufficiali dal pacchetto cliente 23/11: Tecnopolo al posto del
     marchio CNR, Regione con l'identità 2025, Comune solo stemma (il
     vecchio file diventava un blocco pieno nella mask) */
  'cnr tecnopolo bologna': { file: 'tecnopolo-cnr.png', ratio: 4.09, h: 40 },
  /* versione positiva (quadrato + scritta), appiattita per la mask: il
     lockup orizzontale 2025 era una targa piena → blocco bianco in dark */
  'regione emilia-romagna': {
    file: 'regione-emilia-romagna.png',
    ratio: 0.9,
    h: 54,
  },
  'comune di bologna': { file: 'comune-bologna', ratio: 0.656, h: 54 },
  'art-er': { file: 'art-er', ratio: 2.48, h: 44 },
  'its academy adriano olivetti': { file: 'its-olivetti', ratio: 1.7, h: 54 },
  'emilia-romagna startup': { file: 'emiliaromagna-startup', ratio: 4.81, h: 36 },
  'artes 4.0': { file: 'artes.png', ratio: 2.83, h: 44 },
  'clust-er create': { file: 'clust-er-create.png', ratio: 1.31, h: 52 },
  'incredibol!': { file: 'incredibol.png', ratio: 3.36, h: 40 },
  'erasmus for young entrepreneurs': {
    file: 'erasmus-young.png',
    ratio: 2.67,
    h: 44,
  },
  'hub cultura e creatività': { file: 'hub-cultura.png', ratio: 0.8, h: 54 },
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

  /* senza estensione nel map il file è un SVG; i marchi disponibili solo
     in raster (vedi pacchetto cliente) portano la propria ".png" */
  const file = logo.file.includes('.') ? logo.file : `${logo.file}.svg`;
  const style = {
    '--logo': `url(/img/partners/${file})`,
    height: `${logo.h}px`,
    aspectRatio: logo.ratio,
  } as CSSProperties;

  return <span className={styles.mark} role="img" aria-label={name} style={style} />;
}
