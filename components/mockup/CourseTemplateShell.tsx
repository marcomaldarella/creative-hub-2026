'use client';

import { useEffect, useRef } from 'react';

export type CourseTemplateShellProps = {
  css: string;
  html: string;
};

/**
 * Monta un template corso statico (estratto da public/mockup-corso/*.html)
 * dentro uno Shadow DOM: il CSS del mockup (selettori generici come .hero,
 * .pill, *{...}) resta completamente isolato dal CSS globale del sito
 * (e viceversa — niente rischio di leak sui componenti reali che
 * SiteChrome renderizza sopra/sotto, es. Nav/Footer). --font-body e
 * --header-h sono custom property: attraversano il confine dello shadow
 * root, quindi il template eredita font e altezza header reali.
 */
export function CourseTemplateShell({ css, html }: CourseTemplateShellProps) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host || host.shadowRoot) return;
    const root = host.attachShadow({ mode: 'open' });

    const style = document.createElement('style');
    style.textContent = css;
    root.appendChild(style);

    const wrap = document.createElement('div');
    wrap.innerHTML = html;
    root.appendChild(wrap);

    // accordion (ammissioni / struttura del corso)
    root.querySelectorAll('.acc-item').forEach((item) => {
      const head = item.querySelector('.acc-head');
      head?.addEventListener('click', () => {
        const wasOpen = item.classList.contains('open');
        item.parentElement
          ?.querySelectorAll('.acc-item')
          .forEach((i) => i.classList.remove('open'));
        if (!wasOpen) item.classList.add('open');
      });
    });

    // link di sottonav (#panoramica, #struttura…): scroll fluido dentro
    // lo shadow root (document.getElementById non vedrebbe questi id)
    root.querySelectorAll('a[href^="#"]').forEach((a) => {
      a.addEventListener('click', (e) => {
        e.preventDefault();
        const id = a.getAttribute('href')?.slice(1);
        const target = id ? root.getElementById(id) : null;
        target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });

    // frecce dei caroselli (data-scroll-id/-by al posto dell'onclick
    // originale, che chiamava document.getElementById — irraggiungibile
    // da dentro lo shadow root)
    root.querySelectorAll<HTMLElement>('[data-scroll-id]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-scroll-id');
        const by = Number(btn.getAttribute('data-scroll-by') ?? 0);
        const target = id ? root.getElementById(id) : null;
        target?.scrollBy({ left: by, behavior: 'smooth' });
      });
    });

    return () => {
      wrap.remove();
      style.remove();
    };
  }, [css, html]);

  return (
    // paddingTop inline, non nel CSS shadow-scoped: il reset globale del
    // sito (`* { padding: 0 }`, globals.css) matcha anche l'host da fuori
    // e vinceva su ":host{padding-top:var(--header-h)}" nonostante la
    // specificità inferiore — inline sull'host bypassa la contesa.
    <div ref={hostRef} style={{ paddingTop: 'var(--header-h)' }} />
  );
}
