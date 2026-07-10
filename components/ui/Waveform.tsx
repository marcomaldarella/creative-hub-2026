import styles from './Waveform.module.css';

export type WaveformProps = {
  className?: string;
};

/**
 * Il mark a barre del brand (dal manuale studenti): mini equalizer
 * in currentColor con oscillazione lenta. Decorativo, aria-hidden.
 */
export function Waveform({ className }: WaveformProps) {
  const bars = [0.55, 1, 0.4, 0.8, 0.6];
  return (
    <span
      className={className ? `${styles.wave} ${className}` : styles.wave}
      aria-hidden="true"
    >
      {bars.map((h, i) => (
        <i
          key={i}
          style={{ '--h': h, '--wd': `${i * 0.22}s` } as React.CSSProperties}
        />
      ))}
    </span>
  );
}
