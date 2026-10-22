import Link from 'next/link';
import type { MouseEventHandler, ReactNode } from 'react';
import styles from './Button.module.css';

export type ButtonProps = {
  children: ReactNode;
  /** primary: petrolio→osso · azzurro: accento→accent-on · osso: pastiglia
   *  chiara per le sezioni in blu brand · ghost: bordo linea ·
   *  whatsapp: verde del marchio, solo per i link wa.me */
  variant?: 'primary' | 'azzurro' | 'osso' | 'ghost' | 'whatsapp';
  /** se presente rende <Link> (o <a> se external) */
  href?: string;
  /** target _blank + rel noopener */
  external?: boolean;
  onClick?: MouseEventHandler<HTMLElement>;
  type?: 'button' | 'submit' | 'reset';
  /** solo per la variante <button>: stati "continua" dei flussi guidati */
  disabled?: boolean;
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
  disabled = false,
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
    <button
      type={type}
      className={cls}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  );
}
