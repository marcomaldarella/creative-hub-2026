import styles from './Waveform.module.css';

export type WaveformProps = {
  className?: string;
};

/**
 * Il mark a barre del brand (dal manuale studenti): mini equalizer
 * in currentColor con oscillazione lenta. Decorativo, aria-hidden.
 */
export function Waveform({ className }: WaveformProps) {
  const bars = [0.3, 0.7, 1, 0.5, 0.85, 0.4, 0.95, 0.6, 0.35];
  return (
    <span
      className={className ? `${styles.wave} ${className}` : styles.wave}
      aria-hidden="true"
    >
      {bars.map((h, i) => (
        <i
          key={i}
          style={{ '--h': h, '--wd': `${i * 0.14}s` } as React.CSSProperties}
        />
      ))}
    </span>
  );
}
