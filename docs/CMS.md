# Mappa Sanity (project `if3942oc`, dataset `production`)

Studio embedded a **`/admin`** (`sanity/structure.ts` definisce il desk).
Censimento completo: `node scripts/census.mjs`. Stato al 2026-10-05.

## Tipi e consistenza

| Tipo | Doc | Stato |
|---|---|---|
| `siteSettings` | 1 | singleton — contatti, social, shopUrl, openDay (data DA IMPOSTARE dal cliente: la vecchia era scaduta, rimossa) |
| `course` | 16 | 9 universitari (`course-uni-*`, triennio/magistrale) + 7 custom (`course-custom-*`). Tutti con cover tranne **Pianoforte** (foto in arrivo dal cliente). I corsi demo del seed sono stati eliminati |
| `teacher` | 55 | tutti con foto reale, **tutti senza ruolo e bio** (da cliente o da scrivere) |
| `courseCategory` | 4 | musica (10), suono (4), multimedia (1), visual (1) |
| `article` | 6 | **ANCORA DEMO**: autori finti, niente cover — alimentano /magazine e la fascia editoriale della home. Da sostituire con articoli veri |
| `author` | 3 | demo (Giulia Riva, Marco Del Vecchio, Chiara Neri) |
| `category` | 4 | le 4 vere del docx (produzione-musicale, industrie-creative, formazione-carriera, eventi-news) |
| `space` | 6 | **ANCORA DEMO** (seed, senza immagini): 3 coworking + 3 studio — alimentano le card di /coworking e /studios |
| `partner` | 12 | nomi reali; `logo` vuoto by design (i loghi sono SVG locali via PartnerMark) |
| `page` | 3 | pageId: `home`, `chi-siamo`, `innovazione` (hero/lede; le altre sezioni leggono i titoli dai dizionari i18n) |

Asset: 165 immagini, 1 orfana, **0 alt text** (campo `alt` assente negli
schema — TODO noto; i filename del cliente sarebbero già buoni alt).
Nessuna bozza pendente.

## Suddivisione logica del desk (`/admin`)

- **Impostazioni sito** (singleton)
- **Academy** → Tutti i corsi · Corsi universitari · Corsi custom ·
  Formazione finanziata (viste filtrate sul campo `types`, lo stesso dei
  filtri di /academy) · Categorie corsi · Docenti
- **Magazine** → Articoli · Categorie · Autori
- **Spazi (studio & coworking)** → viste per `kind`
- **Partner**
- **Pagine (hero & corpi)**

## Cosa NON vive in Sanity

- **Prenotazioni/prezzi**: catalogo WooCommerce del sito WordPress
  (vedi `docs/PRENOTAZIONI.md`), letto live da `lib/woocommerce.ts`.
- Testi di sezione e menu: dizionari `lib/i18n/{it,en}.json`.
- Loghi partner: SVG in `public/img/partners/`.

## Script di manutenzione (`scripts/`)

- `census.mjs` — censimento contenuti (read-only)
- `seed.mjs` — seed demo idempotente (NON rilanciare: ricreerebbe i demo)
- `import-corsi-universitari.mjs` / `import-corsi-custom.mjs` — import media cliente
- `patch-course-types.mjs`, `patch-page-copy.mjs` — allineamenti puntuali
- `translate-deepl.mjs` — traduzioni (DEEPL_API_KEY ancora vuota in .env.local)
