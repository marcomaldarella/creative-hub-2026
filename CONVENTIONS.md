# creative hub 2026 — convenzioni di progetto

Sito di Creative Hub Bologna (bologna-creativehub.it): coworking + academy + studio creativo.
Next.js 16.2 (App Router, Turbopack) + Sanity v3 + TypeScript + CSS Modules. Deploy: Vercel.

**IMPORTANTE**: Next 16 ha breaking changes — consulta `node_modules/next/dist/docs/` in caso di dubbio.
Già noto: `params` è una Promise (fare `await params`); il middleware si chiama `proxy.ts` (già creato, non toccarlo).

## Design (approvato — non deviare)

Riferimento visivo completo: `design/reference.html` (aprilo/leggilo prima di scrivere UI).
Deriva dal manuale brand reale: azzurro su ghiaccio, petrolio profondo, display pesante che
sanguina dai margini, thin expanded per i marcatori, annotazioni mono minuscole, freccia ↙,
regola con doppia etichetta (`label ——— label`), texture liquide.

- Token in `app/globals.css` — usare SOLO le CSS custom properties (--ghiaccio, --petrolio,
  --azzurro, --osso, --grigio, --linea, ecc.). Nessun colore hardcoded nei componenti.
- Font già configurati nel layout: `var(--font-display)` (Archivo variabile, con asse width),
  `var(--font-body)` (DM Sans), `var(--font-mono)` (Geist Mono).
  Classi utility pronte: `.display-black`, `.display-thin`, `.mono`, `.wrap`, `.rv` (reveal).
- MAIUSCOLO: vietato in UI (bottoni, label, eyebrow, nav → sempre lowercase/sentence case).
  Consentito SOLO nei titoli display oversized in `.display-black` (voce del brand).
- Sezioni dark: sfondo `--petrolio`, testo `--osso` (mai bianco puro). Base light: `--ghiaccio`.
- Bottoni pill (`--radius-pill`), card `--radius` 12px, bordi `--linea`.
- Animazioni: CSS + IntersectionObserver (classe `.rv` → aggiungere `.in`). Niente framer-motion.
  Tutto deve rispettare `prefers-reduced-motion` (già gestito in globals.css per .rv).

## Struttura

- `app/(site)/[locale]/` — tutte le pagine sito. Locale: `it` (default, senza prefisso URL)
  e `en` (prefisso /en). Il routing è gestito da `proxy.ts` — le pagine ricevono sempre
  `params.locale`. Validare con `isLocale()` + `notFound()`.
- `app/(studio)/studio/[[...tool]]/` — Sanity Studio embedded (root layout proprio, senza chrome sito).
- `lib/i18n/` — config, dizionari UI (it.json/en.json). Stringhe UI SOLO da dizionario, mai hardcoded.
  Link interni: usare `localeHref(locale, path)` da `lib/i18n/config.ts`.
- `lib/sanity/` — client, queries GROQ, tipi.
- `components/ui/` — design system. `components/sections/` — sezioni pagina.
- CSS Modules per componente (`Component.module.css`), accanto al file.

## Sanity

- Env: `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET` — nel client usare
  fallback `?? 'placeholder'` così la build non fallisce senza env.
- Ogni pagina che fa fetch Sanity: `export const dynamic = 'force-dynamic'`.
- Contenuti localizzati: oggetti `localeString` / `localeText` / `localeBlock` con campi
  `{ it, en }`. Helper `l(field, locale)` per la lettura con fallback IT.
- Array creati via API: OGNI item deve avere `_key` (crypto.randomBytes(6).toString('hex')).
- Relazioni: course→teacher[] (reference), course→courseCategory, article→category[],
  article→author, tutti con reference reali.

## Shop / booking — VINCOLO

Il carrello resta su WooCommerce esterno. NESSUNA logica di carrello/pagamento/prenotazione
in Next. Tutti i CTA "prenota/iscriviti" puntano a URL esterni presi da `siteSettings.shopUrl`
(Sanity) con fallback env `NEXT_PUBLIC_SHOP_URL`.

## Regole per gli agenti

- NON eseguire `git commit`/`git push` (li fa l'orchestratore tra le fasi).
- NON avviare `npm run dev` né server.
- Verifica i tipi con `npx tsc --noEmit` prima di finire.
- Tocca SOLO i file del tuo perimetro (indicato nel prompt). Se ti serve qualcosa fuori
  perimetro, segnalalo nel report finale invece di crearlo.
