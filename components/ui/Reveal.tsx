'use client';

import {
  useEffect,
  useRef,
  type CSSProperties,
  type ElementType,
  type ReactNode,
  type RefObject,
} from 'react';

/**
 * Hook condiviso: aggiunge la classe globale `.in` all'elemento quando entra
 * nel viewport (threshold .18, unobserve dopo il primo ingresso).
 * Riusato da <Reveal>, <RevealGroup> e <Rule>.
 */
export function useRevealOnce<T extends HTMLElement>(
  threshold = 0.18
): RefObject<T | null> {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // fail-open: se al mount siamo già in viewport (es. atterraggio su
    // un'ancora prima dell'hydration), rivela subito senza observer
    const r = el.getBoundingClientRect();
    if (r.top < window.innerHeight && r.bottom > 0) {
      el.classList.add('in');
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('in');
            io.unobserve(entry.target);
          }
        }
      },
      { threshold }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);

  return ref;
}

export type RevealProps = {
  children?: ReactNode;
  /** ritardo del reveal in ms (via transition-delay inline) */
  delay?: number;
  /** tag/elemento da renderizzare (default: div) */
  as?: ElementType;
  className?: string;
  style?: CSSProperties;
  id?: string;
};

/**
 * Wrappa i children con la classe globale `.rv` e aggiunge `.in`
 * quando entra nel viewport. prefers-reduced-motion è già gestito
 * globalmente in globals.css.
 */
export function Reveal({
  children,
  delay = 0,
  as: Tag = 'div',
  className,
  style,
  id,
}: RevealProps) {
  const ref = useRevealOnce<HTMLElement>();
  const mergedStyle: CSSProperties | undefined =
    delay > 0 ? { transitionDelay: `${delay}ms`, ...style } : style;

  return (
    <Tag
      ref={ref}
      id={id}
      className={className ? `rv ${className}` : 'rv'}
      style={mergedStyle}
    >
      {children}
    </Tag>
  );
}

export type RevealGroupProps = {
  children?: ReactNode;
  /** tag/elemento contenitore (default: div) */
  as?: ElementType;
  className?: string;
  style?: CSSProperties;
  id?: string;
};

/**
 * Osserva TUTTI i discendenti con classe `.rv` (per liste/griglie):
 * i figli portano la classe `rv` da soli, il gruppo li rivela.
 */
export function RevealGroup({
  children,
  as: Tag = 'div',
  className,
  style,
  id,
}: RevealGroupProps) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const targets = root.querySelectorAll('.rv');
    if (targets.length === 0) return;
    // fail-open come in useRevealOnce: già visibile → rivela subito
    targets.forEach((t) => {
      const r = t.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) t.classList.add('in');
    });
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('in');
            io.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.18 }
    );
    targets.forEach((t) => io.observe(t));
    return () => io.disconnect();
  }, []);

  return (
    <Tag ref={ref} id={id} className={className} style={style}>
      {children}
    </Tag>
  );
}
