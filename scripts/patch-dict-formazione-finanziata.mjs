/**
 * Copy della pagina /academy/formazione-finanziata (mockup cliente).
 *
 * Uso: node scripts/patch-dict-formazione-finanziata.mjs
 *
 * ⚠️ Più sessioni lavorano sugli stessi dizionari: lo script RILEGGE
 * lib/i18n/it.json e en.json al momento dell'esecuzione e scrive SOLO il
 * namespace `finanziata`, lasciando intatto tutto il resto. È idempotente:
 * rilanciarlo riallinea la copy al mockup senza toccare le chiavi altrui.
 *
 * Fuori da questo namespace la pagina riusa chiavi già esistenti:
 * `topics.formazioneFinanziata` (eyebrow, punti hero, fascia FSE+) e
 * `avvisami` (form "Avvisami al prossimo bando").
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

/* ————— italiano: testi del mockup, niente dei campi gialli ————— */
const it = {
  title: 'Corsi gratuiti finanziati dalla Regione Emilia-Romagna.',
  lede: 'Formazione professionale per le industrie culturali e creative: suono, musica, dati e 3D. Docenti del settore, poche settimane o pochi mesi, zero costi per te.',
  heroCta: 'Avvisami al prossimo bando',
  band: {
    text: 'Oggi non ci sono iscrizioni aperte. Music Data Analyst & Strategist è in svolgimento: lascia il contatto per la prossima edizione.',
    cta: 'Avvisami',
  },
  howTitle: 'Gratuiti, ma non per tutti.',
  howLede:
    'I corsi sono pagati dalla Regione Emilia-Romagna e dal Fondo sociale europeo. Per questo hanno posti limitati, requisiti precisi e una selezione. Ecco come funzionano.',
  howItems: [
    {
      title: 'Chi può partecipare',
      text: 'Chi risiede o ha domicilio in Emilia-Romagna, con diploma o qualifica. Ogni corso ha i suoi requisiti specifici.',
    },
    {
      title: 'Come si entra',
      text: 'Prova scritta, colloquio individuale e criteri preferenziali. La graduatoria è pubblicata sul sito.',
    },
    {
      title: 'Cosa ottieni',
      text: 'Un attestato di frequenza o un certificato di specializzazione tecnica superiore (IFTS), secondo il corso.',
    },
    {
      title: 'Quando',
      text: 'Le iscrizioni restano aperte poche settimane, quando esce il bando. Per non perderle, lascia il contatto.',
    },
  ],
  coursesTitle: 'I corsi gratuiti.',
  filters: [
    { key: 'tutti', label: 'Tutti' },
    { key: 'suono', label: 'Suono' },
    { key: 'musica', label: 'Musica' },
    { key: 'dati', label: 'Dati' },
    { key: '3d-e-vr', label: '3D e VR' },
  ],
  status: {
    'in-corso': 'Corso in svolgimento',
    'prossima-edizione': 'Prossima edizione da annunciare',
    'iscrizioni-aperte': 'Iscrizioni aperte',
  },
  cardCta: 'scopri il corso',
  city: 'Bologna',
  free: 'gratuito',
  empty: 'Nessun corso in questa categoria.',
  uniTitle: 'Cerchi un titolo universitario?',
  uniLede:
    'I corsi finanziati sono brevi e professionalizzanti. Se vuoi un percorso di tre anni con un titolo internazionale, guarda i corsi universitari: Bachelor e Master in musica, suono e visual.',
  uniCta: 'Vai ai corsi universitari',
  faqTitle: 'Domande frequenti sui corsi gratuiti.',
  faq: [
    {
      title: 'Sono davvero gratuiti?',
      text: 'Sì. I corsi sono pagati dalla Regione Emilia-Romagna e dal Fondo sociale europeo Plus: per chi partecipa il costo è zero.',
    },
    {
      title: 'Devo vivere in Emilia-Romagna?',
      text: 'Serve la residenza o il domicilio in Emilia-Romagna. Ogni corso ha poi i suoi requisiti specifici, scritti nel bando.',
    },
    {
      title: 'Che titolo di studio serve?',
      text: 'Un diploma di scuola superiore o una qualifica professionale. I requisiti precisi cambiano da corso a corso e sono indicati nel bando.',
    },
    {
      title: 'Come funziona la selezione?',
      text: 'Prova scritta, colloquio individuale e criteri preferenziali. La graduatoria è pubblicata sul sito.',
    },
    {
      title: 'Posso partecipare se lavoro?',
      text: 'Orari, calendario e frequenza richiesta cambiano da corso a corso e sono indicati nel bando. Lasciaci un contatto: ti scriviamo appena esce, così puoi valutare per tempo.',
    },
    {
      title: 'Quando apre il prossimo corso?',
      text: 'Oggi non ci sono iscrizioni aperte: Music Data Analyst & Strategist è in svolgimento. Le iscrizioni restano aperte poche settimane, quando esce il bando: per non perderle, lascia il contatto.',
    },
  ],
  seo: {
    title: 'Corsi gratuiti finanziati Regione Emilia-Romagna | Creative Hub Academy',
    description:
      'Corsi professionali gratuiti a Bologna in suono, musica, dati e 3D, finanziati da Regione Emilia-Romagna e FSE+.',
  },
}

/* ————— inglese: speculare ————— */
const en = {
  title: 'Free courses funded by the Emilia-Romagna Region.',
  lede: 'Professional training for the cultural and creative industries: sound, music, data and 3D. Industry teachers, a few weeks or a few months, zero cost for you.',
  heroCta: 'Tell me about the next call',
  band: {
    text: 'There are no open enrolments today. Music Data Analyst & Strategist is running: leave your contact details for the next edition.',
    cta: 'Tell me',
  },
  howTitle: 'Free, but not for everyone.',
  howLede:
    'The courses are paid for by the Emilia-Romagna Region and the European Social Fund. That is why they have limited places, precise requirements and a selection. Here is how they work.',
  howItems: [
    {
      title: 'Who can take part',
      text: 'Anyone resident or domiciled in Emilia-Romagna, with a diploma or a vocational qualification. Each course has its own specific requirements.',
    },
    {
      title: 'How you get in',
      text: 'A written test, an individual interview and preferential criteria. The ranking is published on the site.',
    },
    {
      title: 'What you get',
      text: 'A certificate of attendance or a higher technical specialisation certificate (IFTS), depending on the course.',
    },
    {
      title: 'When',
      text: 'Enrolment stays open for a few weeks, when the call is published. To avoid missing it, leave your contact details.',
    },
  ],
  coursesTitle: 'The free courses.',
  filters: [
    { key: 'tutti', label: 'All' },
    { key: 'suono', label: 'Sound' },
    { key: 'musica', label: 'Music' },
    { key: 'dati', label: 'Data' },
    { key: '3d-e-vr', label: '3D and VR' },
  ],
  status: {
    'in-corso': 'Course running',
    'prossima-edizione': 'Next edition to be announced',
    'iscrizioni-aperte': 'Enrolment open',
  },
  cardCta: 'discover the course',
  city: 'Bologna',
  free: 'free',
  empty: 'No courses in this category.',
  uniTitle: 'Looking for a university degree?',
  uniLede:
    'The funded courses are short and vocational. If you want a three-year path with an international degree, have a look at the university courses: Bachelor and Master in music, sound and visual.',
  uniCta: 'Go to the university courses',
  faqTitle: 'Frequently asked questions about the free courses.',
  faq: [
    {
      title: 'Are they really free?',
      text: 'Yes. The courses are paid for by the Emilia-Romagna Region and the European Social Fund Plus: for those taking part the cost is zero.',
    },
    {
      title: 'Do I have to live in Emilia-Romagna?',
      text: 'You need residence or domicile in Emilia-Romagna. Each course then has its own specific requirements, written in the call.',
    },
    {
      title: 'What qualification do I need?',
      text: 'A secondary school diploma or a vocational qualification. The exact requirements change from course to course and are stated in the call.',
    },
    {
      title: 'How does the selection work?',
      text: 'A written test, an individual interview and preferential criteria. The ranking is published on the site.',
    },
    {
      title: 'Can I take part if I work?',
      text: 'Timetable, calendar and required attendance change from course to course and are stated in the call. Leave us your contact details: we will write as soon as it is out, so you can plan ahead.',
    },
    {
      title: 'When does the next course open?',
      text: 'There are no open enrolments today: Music Data Analyst & Strategist is running. Enrolment stays open for a few weeks, when the call is published: to avoid missing it, leave your contact details.',
    },
  ],
  seo: {
    title: 'Free courses funded by the Emilia-Romagna Region | Creative Hub Academy',
    description:
      'Free professional courses in Bologna in sound, music, data and 3D, funded by the Emilia-Romagna Region and ESF+.',
  },
}

/* scrive il solo namespace `finanziata`, rileggendo il file dal disco */
function patch(file, block) {
  const path = join(root, 'lib/i18n', file)
  const dict = JSON.parse(readFileSync(path, 'utf8'))
  dict.finanziata = block
  writeFileSync(path, `${JSON.stringify(dict, null, 2)}\n`)
  console.log(`${file}: namespace "finanziata" allineato (${Object.keys(block).length} chiavi)`)
}

patch('it.json', it)
patch('en.json', en)
