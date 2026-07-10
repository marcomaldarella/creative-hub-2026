# creative hub — bologna-creativehub.it

Sito di Creative Hub Bologna: coworking + academy + studio creativo.
Next.js 16 (App Router) · Sanity v3 · TypeScript · CSS Modules · deploy Vercel.

## Avvio

```bash
npm install
npm run dev          # sito su http://localhost:3000, studio su /studio
```

Env richieste (vedi `.env.example`):

| Variabile | Uso |
|---|---|
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | progetto Sanity (`if3942oc`) |
| `NEXT_PUBLIC_SANITY_DATASET` | `production` |
| `SANITY_API_TOKEN` | token editor — seed e pipeline DeepL |
| `NEXT_PUBLIC_SHOP_URL` | shop WooCommerce esterno (fallback per i CTA) |
| `DEEPL_API_KEY` | traduzione automatica IT→EN |

## Contenuti

```bash
node scripts/seed.mjs              # popola Sanity con i contenuti demo (idempotente)
node scripts/translate-deepl.mjs   # traduce i campi it→en mancanti via DeepL
```

## Architettura

- **i18n**: IT alla radice (`/academy`), EN con prefisso (`/en/academy`). Routing in `proxy.ts`
  (il middleware di Next 16), pagine sotto `app/(site)/[locale]/`. Stringhe UI in `lib/i18n/*.json`,
  contenuti Sanity localizzati come oggetti `{ it, en }` con fallback IT.
- **Sanity Studio** embedded su `/studio` (root layout separato, senza chrome del sito).
- **Shop/booking**: resta su WooCommerce esterno — i CTA puntano a `siteSettings.shopUrl`
  (o override per corso). Nessuna logica di carrello in Next.
- **Design**: token in `app/globals.css`, mockup di riferimento in `design/reference.html`,
  convenzioni in `CONVENTIONS.md`.
