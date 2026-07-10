import Link from 'next/link';
import type { ReactNode } from 'react';
import styles from './Card.module.css';

export type CardProps = {
  /** light: bianco su ghiaccio · dark: per sezioni petrolio */
  variant?: 'light' | 'dark';
  /** etichetta mono in alto (in dark: azzurro) */
  kicker?: string;
  title?: ReactNode;
  children?: ReactNode;
  /** riga mono in basso (es. categoria + data) */
  meta?: ReactNode;
  /** se presente la card diventa un link */
  href?: string;
  /** target _blank + rel noopener */
  external?: boolean;
  className?: string;
};

export function Card({
  variant = 'light',
  kicker,
  title,
  children,
  meta,
  href,
  external = false,
  className,
}: CardProps) {
  const cls = [
    styles.card,
    variant === 'dark' ? styles.dark : styles.light,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const body = (
    <>
      {kicker && <span className={`mono ${styles.kicker}`}>{kicker}</span>}
      {title && <h3 className={styles.title}>{title}</h3>}
      {children && <div className={styles.body}>{children}</div>}
      {meta && <div className={`mono ${styles.meta}`}>{meta}</div>}
    </>
  );

  if (href) {
    if (external) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={cls}
        >
          {body}
        </a>
      );
    }
    return (
      <Link href={href} className={cls}>
        {body}
      </Link>
    );
  }

  return <article className={cls}>{body}</article>;
}
