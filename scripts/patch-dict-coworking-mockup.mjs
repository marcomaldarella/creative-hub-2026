/* chiavi mancanti delle tre pagine coworking rispetto ai mockup v3 del
   cliente: barra delle pagine di sezione, barra prenota mobile, prezzo
   pieno barrato del carnet, didascalie degli spazi comuni e il
   configuratore evento di sale & eventi.
   Idempotente: rilegge i dizionari e scrive SOLO le chiavi mancanti
   (altre sessioni lavorano sugli stessi file). */
import { readFileSync, writeFileSync } from 'node:fs'

const ROOT = new URL('../lib/i18n/', import.meta.url)

/* ————— coworking (pagina indice) ————— */
const COWORKING = {
  it: {
    /* barra delle tre pagine della sezione, come nei mockup */
    subnavLabel: 'Coworking · zona Roveri',
    subnavPages: ['Coworking', 'Sale & eventi', 'Prenota il tuo spazio'],
    /* barra fissa in basso su mobile (istruzione del mockup) */
    mobileBarCta: 'Prenota',
    /* prezzo pieno barrato accanto allo scontato, allineato a
       tableRows: solo il carnet da dieci ingressi ne ha uno */
    tableWas: ['', '95€', '', '', '', ''],
    /* didascalie delle foto del palazzo, nell'ordine del nastro */
    corridoiCaptions: [
      'Il murale "future together"',
      'La scala "small steps big change"',
      'I corridoi delle aule',
      "L'ingresso dell'area CW300",
      'La library',
      'La segreteria',
      'Il corridoio degli uffici',
    ],
  },
  en: {
    subnavLabel: 'Coworking · Roveri district',
    subnavPages: ['Coworking', 'Rooms & events', 'Book your space'],
    mobileBarCta: 'Book',
    tableWas: ['', '€95', '', '', '', ''],
    corridoiCaptions: [
      'The "future together" mural',
      'The "small steps big change" stairs',
      'The classroom corridors',
      'The entrance to the CW300 area',
      'The library',
      'The front office',
      'The corridor to the offices',
    ],
  },
}

/* ————— sale & eventi: il configuratore "componi il tuo evento" ————— */
const SALE = {
  it: {
    builderKicker: 'componi il tuo evento',
    builderTitle: 'Componi il tuo evento.',
    builderLede:
      'Quattro scelte e ti mandiamo una proposta con sala, servizi e preventivo.',
    builder: {
      subject: 'Proposta per un evento',
      q1: '1. Che evento è?',
      /* room = la sala che proponiamo per quel tipo di evento */
      types: [
        { id: 'riunione', label: 'Riunione o colloquio', room: 'Sala riunioni' },
        { id: 'corso', label: 'Corso o workshop', room: 'Sala didattica' },
        { id: 'talk', label: 'Talk o conferenza', room: 'Aula magna' },
        { id: 'aziendale', label: 'Evento aziendale', room: 'Aula magna' },
        { id: 'networking', label: 'Networking o aperitivo', room: 'Banano room' },
        { id: 'mostra', label: 'Mostra o lancio', room: 'Showroom' },
      ],
      q2: '2. Quante persone?',
      sizes: ['fino a 10', '10–30', '30–80', 'più di 80'],
      q3: '3. Quando?',
      q4: '4. Cosa ti serve in più?',
      extras: [
        'Diretta streaming',
        'Catering',
        'Tecnico audio e video',
        "Foto e video dell'evento",
      ],
      /* una riunione che non sta nella sala riunioni cambia sala */
      roomBig: 'Area Culture o sala didattica',
      summaryTitle: 'Il tuo evento',
      sType: 'tipo',
      sSize: 'persone',
      sDate: 'data',
      sRoom: 'sala',
      sExtra: 'extra',
      noDate: 'da scegliere',
      noExtra: 'nessuno',
      name: 'Nome e cognome',
      contact: 'Cellulare o email',
      send: 'Chiedi la proposta',
      sending: 'Invio…',
      missing: 'Compila nome e contatto.',
      sendError:
        "L'invio non è andato a buon fine: riprova tra poco, o chiama lo 051 631 3706.",
      doneTitle: 'Richiesta inviata.',
      doneText: 'Ti mandiamo la proposta dal lunedì al venerdì.',
      privacyBefore: "Inviando accetti l'",
      privacyLink: 'informativa privacy',
    },
  },
  en: {
    builderKicker: 'plan your event',
    builderTitle: 'Plan your event.',
    builderLede:
      'Four choices and we send you a proposal with room, services and quote.',
    builder: {
      subject: 'Event proposal',
      q1: '1. What kind of event?',
      types: [
        { id: 'riunione', label: 'Meeting or interview', room: 'Meeting room' },
        { id: 'corso', label: 'Course or workshop', room: 'Teaching room' },
        { id: 'talk', label: 'Talk or conference', room: 'Main hall' },
        { id: 'aziendale', label: 'Company event', room: 'Main hall' },
        { id: 'networking', label: 'Networking or drinks', room: 'Banano room' },
        { id: 'mostra', label: 'Exhibition or launch', room: 'Showroom' },
      ],
      q2: '2. How many people?',
      sizes: ['up to 10', '10–30', '30–80', 'more than 80'],
      q3: '3. When?',
      q4: '4. Anything else you need?',
      extras: [
        'Live streaming',
        'Catering',
        'Audio and video technician',
        'Event photo and video',
      ],
      roomBig: 'Area Culture or teaching room',
      summaryTitle: 'Your event',
      sType: 'type',
      sSize: 'people',
      sDate: 'date',
      sRoom: 'room',
      sExtra: 'extras',
      noDate: 'to be chosen',
      noExtra: 'none',
      name: 'Full name',
      contact: 'Phone or email',
      send: 'Ask for a proposal',
      sending: 'Sending…',
      missing: 'Please fill in name and contact.',
      sendError:
        'Sending failed: please try again shortly, or call +39 051 631 3706.',
      doneTitle: 'Request sent.',
      doneText: 'We send the proposal Monday to Friday.',
      privacyBefore: 'By sending this you accept the ',
      privacyLink: 'privacy policy',
    },
  },
}

/* il quarto fatto della testata sale & eventi, come nel mockup */
const SALE_FACT = { it: 'Zona Roveri, Bologna', en: 'Roveri district, Bologna' }

/* scrive solo le chiavi assenti, senza toccare quelle già presenti */
const fill = (target, source) => {
  for (const [k, v] of Object.entries(source)) {
    if (target[k] === undefined) target[k] = v
  }
}

for (const lang of ['it', 'en']) {
  const file = new URL(`${lang}.json`, ROOT)
  const d = JSON.parse(readFileSync(file, 'utf8'))

  if (d.coworking) {
    /* prima stesura: i prezzi pieni erano una mappa per etichetta, che
       non può restare speculare fra IT ed EN — ora è un array */
    delete d.coworking.wasPrices
    /* le didascalie seguono l'ordine delle foto: se l'ordine cambia va
       riscritto, non solo completato (chiave di questa sessione) */
    d.coworking.corridoiCaptions = COWORKING[lang].corridoiCaptions
    fill(d.coworking, COWORKING[lang])
  } else console.log(lang, 'coworking assente: salto')

  if (d.saleEventiPage) {
    fill(d.saleEventiPage, SALE[lang])
    /* il fatto in più si accoda una volta sola */
    const facts = d.saleEventiPage.facts
    if (Array.isArray(facts) && !facts.includes(SALE_FACT[lang])) {
      facts.push(SALE_FACT[lang])
    }
  } else console.log(lang, 'saleEventiPage assente: salto')

  writeFileSync(file, JSON.stringify(d, null, 2) + '\n')
  console.log(lang, 'ok')
}
