import styles from './Wordmark.module.css';

export type WordmarkProps = {
  className?: string;
};

/**
 * Wordmark "creative——hub": l'em dash è un elemento grafico
 * (linea 1px in currentColor), non testo.
 */
export function Wordmark({ className }: WordmarkProps) {
  return (
    <span
      className={className ? `${styles.wordmark} ${className}` : styles.wordmark}
    >
      creative
      <em aria-hidden="true" />
      hub
    </span>
  );
}
