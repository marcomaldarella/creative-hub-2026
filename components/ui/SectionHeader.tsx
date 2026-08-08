import type { ReactNode } from 'react';
import { Reveal } from './Reveal';
import styles from './SectionHeader.module.css';

export type SectionHeaderProps = {
  /** etichetta mono sopra il titolo (es. "lo studio") */
  kicker?: string;
  /** titolo display-thin grande */
  title: ReactNode;
  /** paragrafo introduttivo opzionale */
  lede?: ReactNode;
  /** per sezioni petrolio: kicker azzurro, testi osso */
  dark?: boolean;
  /** tag del titolo: h2 di default, h1 quando l'header apre la pagina */
  as?: 'h1' | 'h2';
  className?: string;
};

export function SectionHeader({
  kicker,
  title,
  lede,
  dark = false,
  as = 'h2',
  className,
}: SectionHeaderProps) {
  const cls = [styles.header, dark ? styles.dark : '', className]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={cls}>
      {kicker && (
        <Reveal as="span" className={`mono ${styles.kicker}`}>
          {kicker}
        </Reveal>
      )}
      <Reveal as={as} className={`display-thin ${styles.title}`} delay={80}>
        {title}
      </Reveal>
      {lede && (
        <Reveal as="p" className={styles.lede} delay={160}>
          {lede}
        </Reveal>
      )}
    </div>
  );
}
