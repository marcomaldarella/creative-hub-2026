'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import styles from './SearchBox.module.css';

export type SearchBoxProps = {
  placeholder: string;
  ariaLabel?: string;
  className?: string;
};

/**
 * Ricerca di sezione: scrive `?q=` nell'URL con debounce (replace, senza
 * scroll) preservando gli altri parametri; il filtro vero avviene nel
 * server component della pagina. Convive con i filtri categoria.
 */
export function SearchBox({ placeholder, ariaLabel, className }: SearchBoxProps) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [value, setValue] = useState(params.get('q') ?? '');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // resta in sync se l'URL cambia da fuori (es. click su una pill)
  useEffect(() => {
    setValue(params.get('q') ?? '');
  }, [params]);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const apply = (v: string) => {
    const next = new URLSearchParams(params);
    if (v.trim()) {
      next.set('q', v.trim());
    } else {
      next.delete('q');
    }
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  return (
    <span className={[styles.box, className].filter(Boolean).join(' ')}>
      <svg
        viewBox="0 0 16 16"
        width="14"
        height="14"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        aria-hidden="true"
      >
        <circle cx="7" cy="7" r="4.6" />
        <path d="M10.4 10.4 14 14" />
      </svg>
      <input
        type="search"
        value={value}
        placeholder={placeholder}
        aria-label={ariaLabel ?? placeholder}
        className={styles.input}
        onChange={(e) => {
          const v = e.target.value;
          setValue(v);
          if (timer.current) clearTimeout(timer.current);
          timer.current = setTimeout(() => apply(v), 300);
        }}
      />
    </span>
  );
}
