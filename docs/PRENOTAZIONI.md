# Prenotazioni — integrazione WooCommerce

Il cliente gestisce le prenotazioni (coworking + sale musica) sul sito WordPress
attuale con **WooCommerce + plugin YITH**. Vincolo di progetto: **zero logica
carrello in Next** — il sito nuovo mostra il catalogo e manda al checkout WP.

## Come funziona

- `lib/woocommerce.ts` legge la **Store API pubblica** di WooCommerce
  (`/wp-json/wc/store/products`, nessuna chiave richiesta) con revalidate 1h.
  Normalizza nomi (il catalogo WP è TUTTO MAIUSCOLO → sentence case, codici
  HPxxx e VIP preservati), prezzi (centesimi), categorie
  (`Co-Working` → `coworking`, `Co-Playing` → `coplaying`) e ripulisce
  l'HTML delle descrizioni dagli stili inline dell'editor WP.
- Se WordPress non risponde si usa lo snapshot **`lib/wc-fallback.json`**
  (rigenerabile: scaricare di nuovo la Store API e ridurre ai campi del tipo
  `RawProduct`).
- Pagine: **`/prenota`** (listino a due fasce: coworking chiaro, co-playing
  nero) e **`/prenota/[slug]`** (template prodotto: foto a filo sx, prezzo,
  descrizione, altri spazi della famiglia). La CTA "Prenota ora" porta al
  **permalink del prodotto WooCommerce**, dove si completano data e pagamento.
- Il permalink arriva dall'API: se il cliente sposta WordPress di dominio,
  i link si aggiornano da soli al prossimo revalidate.

## Env

- `NEXT_PUBLIC_WC_BASE` (opzionale, default `https://bologna-creativehub.it`):
  base URL dell'installazione WordPress. **Da aggiornare quando WP trasloca.**
- `NEXT_PUBLIC_SHOP_URL` / `siteSettings.shopUrl` in Sanity: fallback generico
  "shop" → ora puntano a `https://bologna-creativehub.it/prenota/`.

## ⚠️ Go-live sul dominio

Oggi i prodotti vivono su `bologna-creativehub.it/prodotto/*`. Quando il sito
Next prenderà il dominio, **quei permalink muoiono** con tutto il checkout.
Prima dello switch serve dal cliente/hosting:

1. **Spostare WordPress su un sottodominio** (es. `shop.bologna-creativehub.it`
   — oggi NON esiste nel DNS) e aggiornare `WP_HOME`/`WP_SITEURL`.
2. Aggiornare `NEXT_PUBLIC_WC_BASE` su Vercel al nuovo sottodominio
   (i permalink nelle risposte API si aggiornano di conseguenza).
3. Redirect 301 `bologna-creativehub.it/prodotto/* → shop.…/prodotto/*`
   (nel vhost o in proxy.ts).

## Cosa serve dal cliente per piena autonomia

- **Accesso WP admin** (utente amministratore) — per: verifica plugin YITH
  attivi (quali esatti: Booking? Request a Quote?), restyling child theme
  del checkout, eventuale configurazione CORS/webhook.
- **Accesso hosting/DNS** (o referente tecnico) — per il sottodominio shop
  e i redirect al go-live.
- Conferma **quali prodotti** devono apparire sul sito nuovo (oggi: tutti
  i 18 pubblicati) e se i due "su richiesta" (sala live, studio di
  registrazione) devono avere CTA contatto invece che shop.
- (Solo se un domani si volesse leggere ordini/disponibilità: **chiavi REST
  WooCommerce** `ck_/cs_` in sola lettura. NON servono per l'attuale vetrina.)
