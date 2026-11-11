import styles from './LogoMark.module.css';

export type LogoMarkProps = {
  className?: string;
};

/**
 * Logotipo nuovo (nov 2026): SVG in public/img/logo-new.svg reso come
 * maschera riempita di currentColor, così segue il colore della barra
 * (bianco su nav nera, inchiostro sulle flood) senza varianti di file.
 */
export function LogoMark({ className }: LogoMarkProps) {
  return (
    <span
      className={className ? `${styles.logo} ${className}` : styles.logo}
      role="img"
      aria-label="Creative Hub Bologna"
    />
  );
}
