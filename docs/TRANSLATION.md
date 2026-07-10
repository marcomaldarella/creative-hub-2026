# Traduzione automatica it → en (DeepL)

I contenuti Sanity sono localizzati con oggetti `localeString` / `localeText` / `localeBlock`
(`{ it, en }`): l'italiano è la fonte, l'inglese può essere generato automaticamente con
`scripts/translate-deepl.mjs`.

## Come funziona

1. Scarica da Sanity tutti i documenti published dei tipi con campi localizzati
   (`siteSettings`, `teacher`, `courseCategory`, `course`, `author`, `category`,
   `article`, `space`, `page` — `partner` non ha campi locale).
2. Attraversa ricorsivamente ogni documento e trova gli oggetti locale dove `it` è
   valorizzato e `en` è vuoto o mancante.
3. Traduce con DeepL (`it` → `en-GB`, `preserveFormatting`). Per i `localeBlock`
   (portable text) traduce solo il testo degli span, preservando `_key`, marks,
   markDefs e struttura; i blocchi immagine non vengono toccati.
4. Scrive su Sanity patch puntuali (`title.en`, `body.en`,
   `sections[_key=="…"].body.en`, …) in transaction a lotti. I campi `it` non
   vengono mai modificati.

Le chiamate DeepL sono raggruppate (fino a 40 testi per richiesta) ed eseguite in
sequenza con una pausa, per rispettare i limiti del piano free.

## Chiave DeepL

1. Registrati su [deepl.com/pro-api](https://www.deepl.com/pro-api) (il piano
   **DeepL API Free** basta: 500.000 caratteri/mese).
2. Copia la chiave da Account → API Keys.
3. Aggiungila a `.env.local`: `DEEPL_API_KEY=xxxx…`
   (le chiavi free finiscono in `:fx`; la libreria `deepl-node` sceglie da sola l'endpoint giusto).

## Comandi

```bash
node scripts/translate-deepl.mjs --dry-run          # mostra cosa tradurrebbe, senza DeepL né scritture
node scripts/translate-deepl.mjs                    # traduce tutti i campi en mancanti
node scripts/translate-deepl.mjs --type article     # limita a un tipo di documento
node scripts/translate-deepl.mjs --overwrite        # ritraduce anche gli en già esistenti
```

Il `--dry-run` funziona anche senza `DEEPL_API_KEY`; tutti gli altri casi escono
con errore se la chiave manca.

## Flusso consigliato

1. L'editor scrive/aggiorna i contenuti **in italiano** nello Studio (`/studio`).
2. Si lancia `--dry-run` per controllare cosa verrà tradotto.
3. Si lancia lo script senza flag: gli `en` mancanti vengono compilati.
4. L'editor **rilegge e rifinisce** le traduzioni inglesi nello Studio (DeepL è una
   bozza, non una revisione). Se un testo IT cambia, ripassare con `--overwrite`
   limitato al tipo interessato.

## Automazione futura (non implementata)

- **Webhook Sanity → GitHub Action**: un GROQ-powered webhook su create/update dei
  tipi localizzati chiama `repository_dispatch` su GitHub; una Action fa checkout,
  `npm ci` e lancia lo script con `SANITY_API_TOKEN` e `DEEPL_API_KEY` nei secrets.
  Serve un debounce (es. schedulare la Action ogni ora invece che per evento) per
  non consumare quota DeepL a ogni salvataggio.
- In alternativa, una Action schedulata (cron notturno) che lancia lo script:
  più semplice, nessun webhook, latenza massima di un giorno.
