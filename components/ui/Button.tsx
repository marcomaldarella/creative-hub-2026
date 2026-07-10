import Link from 'next/link';
import type { MouseEventHandler, ReactNode } from 'react';
import styles from './Button.module.css';

export type ButtonProps = {
  children: ReactNode;
  /** primary: petrolio→osso · azzurro: azzurro→petrolio · ghost: bordo linea */
  variant?: 'primary' | 'azzurro' | 'ghost';
  /** se presente rende <Link> (o <a> se external) */
  href?: string;
  /** target _blank + rel noopener */
  external?: boolean;
  onClick?: MouseEventHandler<HTMLElement>;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  ariaLabel?: string;
};

export function Button({
  children,
  variant = 'primary',
  href,
  external = false,
  onClick,
  type = 'button',
  className,
  ariaLabel,
}: ButtonProps) {
  const cls = [styles.btn, styles[variant], className]
    .filter(Boolean)
    .join(' ');

  if (href) {
    if (external) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={cls}
          onClick={onClick}
          aria-label={ariaLabel}
        >
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={cls} onClick={onClick} aria-label={ariaLabel}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} className={cls} onClick={onClick} aria-label={ariaLabel}>
      {children}
    </button>
  );
}
