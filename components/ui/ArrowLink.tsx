import Link from 'next/link';
import type { ReactNode } from 'react';
import { Arrow } from './Arrow';
import styles from './ArrowLink.module.css';

export type ArrowLinkProps = {
  href: string;
  children: ReactNode;
  /** freccia prima del testo */
  reverse?: boolean;
  /** target _blank + rel noopener */
  external?: boolean;
  /** direzione della freccia: ↙ di default, 'e' per i link in avanti */
  dir?: 'sw' | 'e';
  className?: string;
};

/**
 * Link con la freccia ↙ del brand che ruota a 90° on-hover.
 */
export function ArrowLink({
  href,
  children,
  reverse = false,
  external = false,
  dir = 'sw',
  className,
}: ArrowLinkProps) {
  const cls = [styles.link, reverse ? styles.reverse : '', className]
    .filter(Boolean)
    .join(' ');

  const inner = (
    <>
      <span>{children}</span>
      <span className={styles.arrow} aria-hidden="true">
        <Arrow dir={dir} size={15} />
      </span>
    </>
  );

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
        {inner}
      </a>
    );
  }

  return (
    <Link href={href} className={cls}>
      {inner}
    </Link>
  );
}
