'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { Fluid } from '@/components/sections/FluidTrail';

/**
 * Zona con la scia fluida della home: monta un canvas in difference
 * sopra i figli e ci fa girare la simulazione (classe Fluid). Solo
 * mouse, mai con reduced-motion; ferma quando esce dal viewport.
 * L'inchiostro azzurro brand ~coincide con l'azzurro del flood, così
 * in difference la scia si annulla sul fondo e si vede solo sulle foto.
 */
export function FluidZone({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = ref.current;
    if (
      !host ||
      !window.matchMedia('(hover: hover) and (pointer: fine)').matches ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    )
      return;
    const canvas = document.createElement('canvas');
    canvas.setAttribute('aria-hidden', 'true');
    canvas.style.cssText =
      'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:5;mix-blend-mode:difference;';
    host.appendChild(canvas);
    let fluid: Fluid | null = null;
    let io: IntersectionObserver | null = null;
    try {
      fluid = new Fluid(canvas, host);
      fluid.setColor([0.443, 0.722, 1.0]); // azzurro brand
      io = new IntersectionObserver(
        ([en]) => {
          if (en.isIntersecting) fluid?.start();
          else fluid?.stop();
        },
        { threshold: 0.05 },
      );
      io.observe(host);
    } catch {
      canvas.remove(); // niente WebGL: la zona vive senza scia
    }
    return () => {
      io?.disconnect();
      fluid?.dispose();
      canvas.remove();
    };
  }, []);

  return (
    <div ref={ref} className={className} style={{ position: 'relative' }}>
      {children}
    </div>
  );
}
