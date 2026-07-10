'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import styles from './Counter.module.css';

export type CounterProps = {
  value: number;
  /** '+', '%', … — appeso solo a conteggio finito */
  suffix?: string;
  label: string;
  /** locale per toLocaleString (default 'it-IT') */
  formatLocale?: string;
  className?: string;
};

/**
 * Contatore stile peak-meter: il numero sale con easing quartico (1.4s),
 * la barretta azzurra fa overshoot al 100% e si assesta all'82%.
 * Parte quando entra nel viewport (threshold .5).
 * Con prefers-reduced-motion mostra subito il valore finale.
 */
export function Counter({
  value,
  suffix = '',
  label,
  formatLocale = 'it-IT',
  className,
}: CounterProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const numRef = useRef<HTMLDivElement | null>(null);
  const barRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    const num = numRef.current;
    const bar = barRef.current;
    if (!root || !num || !bar) return;

    const fmt = (n: number) => n.toLocaleString(formatLocale);
    const finish = () => {
      num.textContent = fmt(value) + suffix;
      bar.style.width = '82%';
    };

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      finish();
      return;
    }

    let raf = 0;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          io.unobserve(entry.target);

          const t0 = performance.now();
          const dur = 1400;
          const ease = (t: number) => 1 - Math.pow(1 - t, 4);

          const tick = (now: number) => {
            const t = Math.min((now - t0) / dur, 1);
            num.textContent =
              fmt(Math.round(value * ease(t))) + (t === 1 ? suffix : '');
            // overshoot al 100%, poi assestamento all'82% (peak-hold)
            const over =
              t < 0.6 ? ease(t / 0.6) : 1 - 0.18 * ease((t - 0.6) / 0.4);
            bar.style.width = `${over * 100}%`;
            if (t < 1) raf = requestAnimationFrame(tick);
          };
          raf = requestAnimationFrame(tick);
        }
      },
      { threshold: 0.5 }
    );
    io.observe(root);

    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [value, suffix, formatLocale]);

  return (
    <div
      ref={rootRef}
      className={className ? `${styles.stat} ${className}` : styles.stat}
    >
      <div ref={numRef} className={styles.num}>
        0
      </div>
      <div className={styles.meter}>
        <i ref={barRef} className={styles.bar} />
      </div>
      <div className={styles.label}>{label}</div>
    </div>
  );
}

export type CounterRowProps = {
  children: ReactNode;
  className?: string;
};

/** Griglia responsive per una fila di <Counter>. */
export function CounterRow({ children, className }: CounterRowProps) {
  return (
    <div className={className ? `${styles.row} ${className}` : styles.row}>
      {children}
    </div>
  );
}
