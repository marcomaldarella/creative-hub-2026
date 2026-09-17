'use client';

import { useEffect, useRef } from 'react';
import { Fluid } from '@/components/sections/FluidTrail';

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
        // i caroselli loopati hanno il proprio passo (vedi sotto)
        if (target?.hasAttribute('data-loop')) return;
        target?.scrollBy({ left: by, behavior: 'smooth' });
      });
    });

    // carosello loopato (v3, "come conoscerci"): set clonato in coda e
    // scroll rinormalizzato — più cursore azzurro avanti/indietro che
    // compare solo sulle immagini; il click sull'immagine fa scorrere,
    // la didascalia sotto resta il link vero
    const ccursor = root.querySelector<HTMLElement>('.ccursor');
    root.querySelectorAll<HTMLElement>('.carousel[data-loop]').forEach((car) => {
      const step = () => {
        const first = car.children[0] as HTMLElement | undefined;
        return (first?.getBoundingClientRect().width ?? 300) + 20;
      };
      const setW = () => car.scrollWidth / 2;
      car.addEventListener(
        'scroll',
        () => {
          if (car.scrollLeft >= setW()) car.scrollLeft -= setW();
        },
        { passive: true },
      );
      const go = (dir: number) => {
        // all'indietro dal bordo sinistro: salto invisibile sul set clone
        if (dir < 0 && car.scrollLeft < step()) car.scrollLeft += setW();
        car.scrollBy({ left: dir * step(), behavior: 'smooth' });
      };
      root
        .querySelectorAll<HTMLElement>(`[data-scroll-id="${car.id}"]`)
        .forEach((btn) => {
          btn.addEventListener('click', () =>
            go(Number(btn.getAttribute('data-scroll-by') ?? 0) < 0 ? -1 : 1),
          );
        });
      if (!ccursor) return;
      const dirAt = (x: number) => {
        const r = car.getBoundingClientRect();
        return x > r.left + r.width / 2 ? 1 : -1;
      };
      car.addEventListener('pointermove', (e) => {
        if (e.pointerType !== 'mouse') return;
        ccursor.style.left = `${e.clientX}px`;
        ccursor.style.top = `${e.clientY}px`;
        ccursor.style.opacity = (e.target as HTMLElement).closest('.img')
          ? '1'
          : '0';
        ccursor.dataset.dir = dirAt(e.clientX) > 0 ? 'next' : 'prev';
      });
      car.addEventListener('pointerleave', () => {
        ccursor.style.opacity = '0';
      });
      car.addEventListener('click', (e) => {
        if (!(e.target as HTMLElement).closest('.img')) return;
        e.preventDefault();
        go(dirAt(e.clientX));
      });
    });

    // video di sfondo: su schermo stretto e verticale si passa al taglio
    // 9:16. Lo swap avviene PRIMA che il browser inizi a scaricare (il
    // markup parte con la versione orizzontale, cosi' senza JS il video
    // c'e' comunque) e solo se serve davvero, per non buttare banda.
    const wantsPortrait = window.matchMedia(
      '(max-width: 760px) and (orientation: portrait)'
    ).matches;
    const calmVideo = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    // i video di sfondo non scaricano niente finché non entrano in
    // campo: la sorgente si assegna al primo ingresso e la riproduzione
    // si ferma quando escono. Finché il file non c'è resta il poster
    const videoIO = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          const v = e.target as HTMLVideoElement;
          if (!e.isIntersecting) {
            if (!v.paused) v.pause();
            return;
          }
          if (!v.getAttribute('src')) {
            const wanted =
              (wantsPortrait && v.dataset.srcPortrait) || v.dataset.srcWide;
            if (wanted) {
              v.setAttribute('src', wanted);
              v.load();
            }
          }
          void v.play().catch(() => {});
        });
      },
      { rootMargin: '200px' }
    );
    if (!calmVideo) {
      root
        .querySelectorAll<HTMLVideoElement>('video[data-src-wide]')
        .forEach((v) => videoIO.observe(v));
    }

    // modale contatti (v3): la aprono tutte le CTA marcate data-contact
    // — cioè tutte tranne "Scarica il piano di studi" (riunione 17/09).
    // Submit finto da mockup: mostra la conferma, nessun invio reale.
    const modal = root.getElementById('contactModal');
    const onModalKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal();
    };
    const openModal = () => {
      if (!modal) return;
      modal.hidden = false;
      document.documentElement.style.overflow = 'hidden';
      window.addEventListener('keydown', onModalKey);
      modal.querySelector<HTMLInputElement>('input')?.focus();
    };
    const closeModal = () => {
      if (!modal) return;
      modal.hidden = true;
      modal.classList.remove('sent');
      document.documentElement.style.overflow = '';
      window.removeEventListener('keydown', onModalKey);
    };
    if (modal) {
      root.querySelectorAll<HTMLElement>('[data-contact]').forEach((el) => {
        el.addEventListener('click', (e) => {
          e.preventDefault();
          openModal();
        });
      });
      modal.querySelectorAll<HTMLElement>('[data-modal-close]').forEach((el) => {
        el.addEventListener('click', closeModal);
      });
      modal.querySelector('form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        modal.classList.add('sent');
      });
    }

    // scia fluida della home sul carosello "come conoscerci" (v3):
    // stessa simulazione (classe Fluid), inchiostro azzurro, in
    // difference sopra la sezione — solo mouse, mai con reduced-motion
    let fluid: Fluid | null = null;
    let fluidIO: IntersectionObserver | null = null;
    const connSez = root.getElementById('connetti');
    if (
      connSez &&
      window.matchMedia('(hover: hover) and (pointer: fine)').matches &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      const fcanvas = document.createElement('canvas');
      fcanvas.className = 'fluid-layer';
      fcanvas.setAttribute('aria-hidden', 'true');
      connSez.appendChild(fcanvas);
      try {
        fluid = new Fluid(fcanvas, connSez as HTMLElement);
        fluid.setColor([0.443, 0.722, 1.0]); // azzurro brand
        fluidIO = new IntersectionObserver(
          ([en]) => {
            if (en.isIntersecting) fluid?.start();
            else fluid?.stop();
          },
          { threshold: 0.05 },
        );
        fluidIO.observe(connSez);
      } catch {
        fcanvas.remove(); // niente WebGL: il carosello vive senza scia
      }
    }

    // testimonial a rotazione: dissolvenza fra le citazioni, frecce ai
    // lati e avanzamento automatico (fermo sotto al puntatore e con
    // prefers-reduced-motion)
    const quotes = Array.from(
      root.querySelectorAll<HTMLElement>('.qtrack blockquote')
    );
    let qTimer: ReturnType<typeof setInterval> | undefined;
    if (quotes.length > 1) {
      let i = 0;
      const show = (n: number) => {
        i = (n + quotes.length) % quotes.length;
        quotes.forEach((q, k) => q.classList.toggle('is-on', k === i));
      };
      const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const start = () => {
        if (!calm && !qTimer) qTimer = setInterval(() => show(i + 1), 7000);
      };
      const stop = () => {
        if (qTimer) clearInterval(qTimer);
        qTimer = undefined;
      };
      root.querySelectorAll<HTMLElement>('.qnav').forEach((btn) => {
        btn.addEventListener('click', () => {
          show(i + Number(btn.dataset.q ?? 1));
          // ripartire da zero dopo un click: altrimenti il cambio
          // automatico può arrivare mezzo secondo dopo il tuo
          stop();
          start();
        });
      });
      const box = root.querySelector<HTMLElement>('.quotes');
      box?.addEventListener('pointerenter', (e) => {
        if ((e as PointerEvent).pointerType === 'mouse') stop();
      });
      box?.addEventListener('pointerleave', start);
      start();
    }

    // indice di sezione: mirino sulla voce attiva. Gli id vivono dentro
    // lo shadow root, quindi niente IntersectionObserver su document:
    // misuriamo a mano le sezioni bersaglio a ogni frame utile.
    const links = Array.from(
      root.querySelectorAll<HTMLAnchorElement>('.subnav .jump a')
    );
    const subnav = root.querySelector<HTMLElement>('.subnav');
    let raf = 0;

    // le frecce in coda all'indice muovono di una sezione: l'indice
    // corrente lo tiene già lo scroll spy qui sotto
    let active = -1;
    const steps = Array.from(
      root.querySelectorAll<HTMLButtonElement>('.subnav .step')
    );
    steps.forEach((btn) => {
      btn.addEventListener('click', () => {
        const dir = Number(btn.dataset.step ?? 1);
        const next = Math.min(
          links.length - 1,
          Math.max(0, (active < 0 ? (dir > 0 ? -1 : 0) : active) + dir)
        );
        const id = links[next]?.getAttribute('href')?.slice(1);
        (id ? root.getElementById(id) : null)?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      });
    });

    const sync = () => {
      raf = 0;
      const targets = links.map((a) =>
        root.getElementById(a.getAttribute('href')?.slice(1) ?? '')
      );
      // la soglia è il bordo inferiore della barra: una sezione è
      // "attiva" appena passa sotto l'indice, non a metà schermo
      const line = (subnav?.getBoundingClientRect().bottom ?? 0) + 4;
      active = -1;
      targets.forEach((t, i) => {
        if (t && t.getBoundingClientRect().top <= line) active = i;
      });
      links.forEach((a, i) => a.classList.toggle('is-active', i === active));
      steps.forEach((btn) => {
        const dir = Number(btn.dataset.step ?? 1);
        btn.disabled =
          dir < 0 ? active <= 0 : active >= links.length - 1;
      });

    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(sync);
    };

    // l'indice parte alla stessa x della PRIMA voce del menu vero. Le
    // classi del CSS module sono hashate, l'aggancio è data-navlink.
    // Senza menu (mobile) si resta sul layout a flusso.
    const jump = root.querySelector<HTMLElement>('.subnav .jump');
    const alignToNav = () => {
      if (!jump) return;
      const bar = jump.parentElement?.getBoundingClientRect();
      const first = Array.from(
        document.querySelectorAll<HTMLElement>('[data-navlink]')
      ).find((el) => el.offsetParent !== null);
      if (!bar || !first) {
        jump.classList.remove('aligned');
        jump.style.left = '';
        return;
      }
      jump.classList.add('aligned');
      jump.style.left = `${first.getBoundingClientRect().left - bar.left}px`;
    };

    const onResize = () => {
      alignToNav();
      onScroll();
    };

    if (links.length) {
      // il menu vero monta dopo: un giro di rAF prima di misurarlo
      requestAnimationFrame(onResize);
      sync();
      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onResize);
    }

    return () => {
      fluidIO?.disconnect();
      fluid?.dispose();
      window.removeEventListener('keydown', onModalKey);
      document.documentElement.style.overflow = '';
      videoIO.disconnect();
      if (qTimer) clearInterval(qTimer);
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
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
