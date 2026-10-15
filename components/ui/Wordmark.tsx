import styles from './Wordmark.module.css';

export type WordmarkProps = {
  className?: string;
};

/**
 * Wordmark "creativehub": una parola sola, due pesi —
 * "creative" bold, "hub" regular.
 */
export function Wordmark({ className }: WordmarkProps) {
  return (
    <span
      className={className ? `${styles.wordmark} ${className}` : styles.wordmark}
    >
      <b>creative</b>hub
    </span>
  );
}
