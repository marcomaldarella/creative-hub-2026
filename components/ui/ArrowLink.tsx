import Link from 'next/link';
import type { ReactNode } from 'react';
import styles from './ArrowLink.module.css';

export type ArrowLinkProps = {
  href: string;
  children: ReactNode;
  /** freccia prima del testo */
  reverse?: boolean;
  /** target _blank + rel noopener */
  external?: boolean;
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
  className,
}: ArrowLinkProps) {
  const cls = [styles.link, reverse ? styles.reverse : '', className]
    .filter(Boolean)
    .join(' ');

  const inner = (
    <>
      <span>{children}</span>
      <span className={styles.arrow} aria-hidden="true">
        ↙
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
