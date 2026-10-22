/**
 * Secondo passaggio sui 5 corsi custom "lezioni su misura" (dopo
 * clean-lezioni.mjs), esito della verifica avversariale di ott 2026.
 *
 * Fix ai contenuti italiani:
 *  - structureIntro: via la prima frase "Tre modi di studiare X."
 *    (duplicava il titolo della sezione);
 *  - basso, body: via il paragrafo finale "Che tu voglia sbloccare lo
 *    slap… dicci con chi vorresti iniziare" (prometteva una sezione
 *    insegnanti che su basso non c'è: teachers vuoto);
 *  - chitarra/pianoforte/produzione, body: AGGIUNTO il terzo paragrafo
 *    del metodo dai mockup (presenta gli insegnanti collegati);
 *  - chitarra, faq "Mio figlio può fare lezioni di chitarra?":
 *    "Sì." → "Sì, dai 6 anni in su." (coerente col badge della pagina;
 *    l'età minima specifica resta da confermare col cliente).
 *
 * Inglese: riscrive TUTTI i campi .en dei 5 corsi traducendo
 * dall'italiano attuale (post-fix). Le .en legacy vengono SOVRASCRITTE:
 * erano copy di un'altra offerta (pacchetti 4/20/40 sul canto che vende
 * Smart/Standard mensili, skillsLede promozionali al posto del titolo
 * di sezione, eccetera). Campi coperti: summary, body, skillsLede,
 * skills, structure, structureIntro, admissions, admissionsKeys, faq,
 * packages del canto (i prezzi non si toccano).
 *
 * Patcha pubblicato + eventuale draft. Uso:
 *   node scripts/fix-lezioni-v2.mjs [--dry-run]
 * Idempotente: scrive solo i campi che differiscono dal target.
 */

import { readFileSync } from 'node:fs'
import { randomBytes } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { createClient } from '@sanity/client'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const env = {}
for (const line of readFileSync(join(root, '.env.local'), 'utf8').split('\n')) {
  const match = line.match(/^([A-Z0-9_]+)=(.*)$/)
  if (match) env[match[1]] = match[2].trim()
}

const client = createClient({
  projectId: env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  token: env.SANITY_API_TOKEN,
  apiVersion: '2026-07-01',
  useCdn: false,
})

const dryRun = process.argv.includes('--dry-run')
const key = () => randomBytes(6).toString('hex')

const COURSES = [
  'course-custom-basso',
  'course-custom-canto',
  'course-custom-chitarra',
  'course-custom-pianoforte',
  'course-custom-produzione',
]

/* ————— normalizzazione per il lookup —————
 * i contenuti usano l'apostrofo tipografico: le chiavi del dizionario
 * sono scritte con l'apostrofo dritto e il confronto normalizza */
const norm = (s) =>
  String(s ?? '')
    .replace(/’/g, "'")
    .replace(/\s+/g, ' ')
    .trim()

/* ————— dizionario it → en (post-fix) —————
 * copre titoli e testi di skills / structure / admissions / faq,
 * admissionsKeys, structureIntro e i localeString dei packages */
const TR_RAW = {
  /* — come funziona (basso/chitarra/pianoforte/produzione) — */
  'Compili il form': 'Fill in the form',
  'Ci vogliono 30 secondi. Ti contatta un tutor di Creative Hub.':
    'It takes 30 seconds. A Creative Hub tutor gets in touch.',
  'Chiamata conoscitiva': 'Intro call',
  'Obiettivi, livello e disponibilità: capiamo cosa ti serve.':
    'Goals, level and availability: we work out what you need.',
  'Prima lezione gratuita': 'First lesson free',
  'Una lezione completa, non una consulenza. Se non fa per te, non paghi niente.':
    "A full lesson, not a consultation. If it's not for you, you pay nothing.",
  'Inizi le lezioni': 'You start your lessons',
  'Scegli il pacchetto di lezioni che ti serve, individuali o di gruppo, e parti.':
    'Pick the lesson package that suits you, one-to-one or group, and get going.',

  /* — come funziona (canto) — */
  'Prenoti la lezione gratuita': 'Book your free lesson',
  'In sede o online, senza impegno. Capiamo il tuo livello e cosa vuoi ottenere.':
    'On site or online, no strings attached. We work out your level and what you want to achieve.',
  'Costruiamo il tuo programma': 'We build your programme',
  'Scegli insegnante, giorno e formula: individuale, di gruppo o entrambe.':
    'Choose your teacher, day and format: one-to-one, group or both.',
  'Porti la voce sul palco': 'You take your voice on stage',
  "Dalla tecnica alla musica d'insieme, fino a cantare davanti a un pubblico.":
    'From technique to ensemble music, all the way to singing in front of an audience.',

  /* — badge (admissionsKeys) — */
  'Lezioni anche serali': 'Evening lessons available',
  'In sede o online': 'On site or online',
  'Dai 6 anni in su': 'Ages 6 and up',

  /* — structureIntro (post-fix) — */
  'Puoi combinarli in base al tempo che hai.':
    'You can combine them to fit the time you have.',
  'Puoi combinarli. Il pacchetto Standard li unisce già.':
    'You can combine them. The Standard package already brings them together.',

  /* — tre modi di studiare — */
  'Lezioni di basso individuali': 'One-to-one bass lessons',
  'Lezioni di chitarra individuali': 'One-to-one guitar lessons',
  'Lezioni di pianoforte individuali': 'One-to-one piano lessons',
  'Lezioni di canto individuali': 'One-to-one singing lessons',
  'A tu per tu con il tuo insegnante, sui brani e sugli obiettivi che scegli tu. Il modo più veloce per colmare le lacune.':
    'Face to face with your teacher, working on the songs and goals you choose. The fastest way to close the gaps.',
  'Lezioni di gruppo e jam session': 'Group lessons and jam sessions',
  'Suoni con altri allievi, e puoi venire anche con un amico. È qui che impari a tenere il tempo, ascoltare gli altri e divertirti.':
    'You play with other students, and you can bring a friend. This is where you learn to keep time, listen to others and have fun.',
  'Lezioni di basso online': 'Online bass lessons',
  'Lezioni di chitarra online': 'Online guitar lessons',
  'Lezioni di pianoforte online': 'Online piano lessons',
  'Lezioni di canto online': 'Online singing lessons',
  'Stessi insegnanti e stessa roadmap, con la massima flessibilità di orario. Anche la prima lezione gratuita può essere online.':
    'Same teachers and same roadmap, with maximum scheduling flexibility. Even the first free lesson can be online.',
  'A tu per tu con il tuo insegnante, in sala attrezzata. Respirazione, impostazione, repertorio scelto insieme.':
    'Face to face with your teacher, in a fully equipped room. Breathing, vocal placement and a repertoire chosen together.',
  "Musica d'insieme": 'Ensemble music',
  'Ogni settimana canti con altri studenti e con la band. È qui che la tecnica diventa sicurezza davanti agli altri.':
    'Every week you sing with other students and with the band. This is where technique becomes confidence in front of others.',
  'Stessi insegnanti, stesso programma, da casa tua. Anche la prima lezione gratuita può essere online.':
    'Same teachers, same programme, from your home. Even the first free lesson can be online.',
  'Lezioni individuali in aula Ableton': 'One-to-one lessons in the Ableton room',
  "A tu per tu con il tuo insegnante, sui tuoi brani e con la strumentazione dell'aula.":
    "Face to face with your teacher, working on your own tracks with the room's equipment.",
  'Sessioni in studio': 'Studio sessions',
  "Prenoti l'aula fuori dall'orario di lezione e lavori ai tuoi progetti con l'attrezzatura professionale.":
    'You book the room outside lesson hours and work on your projects with professional equipment.',
  'Lezioni di produzione online': 'Online production lessons',
  'Stessi insegnanti e stessa roadmap, con il tuo computer e le tue cuffie. Anche la prima lezione gratuita può essere online.':
    'Same teachers and same roadmap, on your own computer and headphones. Even the first free lesson can be online.',

  /* — cosa impari: basso — */
  'Groove e tempo': 'Groove and time',
  'Il lavoro del bassista: tenere il tempo e far ballare la band.':
    "The bass player's job: keeping time and making the band groove.",
  'Tecnica delle due mani': 'Two-hand technique',
  'Dita, plettro, muting e controllo del suono.':
    'Fingers, pick, muting and sound control.',
  'Slap e tecniche moderne': 'Slap and modern techniques',
  'Slap, pop, ghost notes e tempi dispari.':
    'Slap, pop, ghost notes and odd time signatures.',
  'Linee di basso e armonia': 'Bass lines and harmony',
  'Capire gli accordi per costruire linee tue.':
    'Understanding chords so you can build your own lines.',
  'Brani completi': 'Complete songs',
  'Il primo brano in 2–3 mesi, poi un repertorio tutto tuo.':
    'Your first song in 2–3 months, then a repertoire of your own.',
  'Suonare in band': 'Playing in a band',
  'Ascolto, interplay e palco con altri musicisti. Stili: pop, rock, funk, soul, jazz, reggae, blues, R&B.':
    'Listening, interplay and stage time with other musicians. Styles: pop, rock, funk, soul, jazz, reggae, blues, R&B.',

  /* — cosa impari: canto — */
  'Respirazione diaframmatica': 'Diaphragmatic breathing',
  'La base di ogni voce: fiato, sostegno, resistenza.':
    'The foundation of every voice: breath, support, stamina.',
  'Impostazione vocale': 'Vocal placement',
  'Estensione, intonazione, timbro, senza forzare.':
    'Range, intonation and tone, without straining.',
  Interpretazione: 'Interpretation',
  "Dare intenzione a ogni frase, dalla tecnica all'emozione.":
    'Giving intention to every phrase, from technique to emotion.',
  "Canto d'insieme": 'Ensemble singing',
  'Ascolto, armonie, presenza scenica con altri musicisti.':
    'Listening, harmonies and stage presence with other musicians.',
  'Registrarti a casa': 'Recording yourself at home',
  'Le basi di informatica musicale per incidere la tua voce.':
    'The music technology basics you need to record your voice.',
  'Composizione e arrangiamento': 'Composition and arrangement',
  'Le basi per scrivere e arrangiare i tuoi brani.':
    'The basics of writing and arranging your own songs.',

  /* — cosa impari: chitarra — */
  'Accordi e ritmica': 'Chords and rhythm',
  'Le basi per accompagnare qualsiasi canzone, dal primo giro di accordi.':
    'The basics for accompanying any song, from your first chord progression.',
  'Tecnica della mano destra': 'Right-hand technique',
  'Plettro, arpeggi e fingerpicking.': 'Pick, arpeggios and fingerpicking.',
  'Scale e improvvisazione': 'Scales and improvisation',
  'Per suonare un assolo e uscire dai soliti schemi.':
    'To play a solo and break out of the usual patterns.',
  'Suono ed effetti': 'Sound and effects',
  'Amplificatore, pedali, timbro: come costruire il tuo suono.':
    'Amp, pedals and tone: how to build your own sound.',
  'Suonare con gli altri': 'Playing with others',
  'Tempo, ascolto, band e palco. Stili: rock, blues, funk, indie, alternative, neo-soul, jazz fusion, fingerstyle.':
    'Time, listening, band and stage. Styles: rock, blues, funk, indie, alternative, neo-soul, jazz fusion, fingerstyle.',

  /* — cosa impari: pianoforte — */
  'Tecnica e postura': 'Technique and posture',
  'Le basi per suonare con scioltezza, senza tensioni.':
    'The basics for playing fluently, without tension.',
  'Accordi e accompagnamento': 'Chords and accompaniment',
  'Accompagnare una canzone, da soli o con la voce.':
    'Accompanying a song, on your own or with a singer.',
  'Lettura, quando serve': 'Reading, when you need it',
  'Per iniziare non serve saper leggere: la lettura arriva strada facendo.':
    "You don't need to read music to start: reading comes along the way.",
  Improvvisazione: 'Improvisation',
  'Suonare con sicurezza anche fuori dallo spartito.':
    'Playing with confidence beyond the sheet music.',
  'Synth, suoni e DAW': 'Synths, sounds and DAWs',
  'Tastiere moderne, sintetizzatori e produzione al computer.':
    'Modern keyboards, synthesizers and computer-based production.',
  'Il primo brano in 2–3 mesi, poi un repertorio tutto tuo. Stili: pop, rock, funk, soul, blues, R&B, elettronica, jazz, colonne sonore.':
    'Your first song in 2–3 months, then a repertoire of your own. Styles: pop, rock, funk, soul, blues, R&B, electronic, jazz, film scores.',

  /* — cosa impari: produzione — */
  'Ableton e DAW': 'Ableton and DAWs',
  'Muoverti nel software con sicurezza, o usare la DAW che hai già.':
    'Moving around the software with confidence, or using the DAW you already have.',
  'Beatmaking e arrangiamento': 'Beatmaking and arrangement',
  'Dal loop alla struttura di un brano completo.':
    'From a loop to the structure of a complete track.',
  'Sound design e sintesi': 'Sound design and synthesis',
  'Costruire i tuoi suoni invece di cercarli.':
    'Building your own sounds instead of hunting for them.',
  Registrazione: 'Recording',
  'Registrare voce e strumenti, anche a casa.':
    'Recording vocals and instruments, at home too.',
  'Mix e mastering': 'Mixing and mastering',
  'Far suonare i brani come quelli che ascolti.':
    'Making your tracks sound like the ones you listen to.',
  'Il primo brano completo': 'Your first complete track',
  'In media in circa 2 mesi, poi un catalogo tutto tuo. Software: Ableton Live, Logic Pro, Reaper, Pro Tools.':
    'On average in about 2 months, then a catalogue of your own. Software: Ableton Live, Logic Pro, Reaper, Pro Tools.',

  /* — faq: condivise — */
  'Devo saper già suonare?': 'Do I need to already play?',
  'No. Molti allievi partono da zero e la roadmap si costruisce sul tuo livello.':
    'No. Many students start from scratch and the roadmap is built around your level.',
  'No. Non ci sono iscrizioni né calendari fissi: scegli un pacchetto di lezioni individuali o di gruppo e decidi tu ritmo e obiettivi. Se cerchi un corso triennale con titolo internazionale, c\'è il corso universitario.':
    "No. There are no enrolments or fixed timetables: you choose a package of one-to-one or group lessons and set your own pace and goals. If you're after a three-year course with an international qualification, there's the university course.",
  'Sì. Le lezioni si possono fare anche la sera e i pacchetti si possono mettere in pausa.':
    'Yes. Lessons can take place in the evening too, and packages can be paused.',
  'Dipende dal pacchetto: 4, 20 o 40 lezioni.':
    'It depends on the package: 4, 20 or 40 lessons.',
  'In quanto tempo suonerò un brano completo?':
    'How long until I can play a complete song?',
  'In media gli allievi suonano il primo brano completo in 2–3 mesi.':
    'On average, students play their first complete song in 2–3 months.',
  'Posso mettere in pausa le lezioni?': 'Can I pause my lessons?',
  'Sì, i pacchetti sono flessibili e puoi adattare il ritmo.':
    'Yes, packages are flexible and you can adjust your pace.',
  'Sì, i pacchetti sono flessibili.': 'Yes, packages are flexible.',
  'Meglio lezioni in sede o online?': 'Are lessons better on site or online?',
  "Funzionano entrambe. In sede usi le aule e la strumentazione dell'Academy, online hai la massima flessibilità di orario.":
    "Both work. On site you use the Academy's rooms and equipment; online you get maximum scheduling flexibility.",
  "Funzionano entrambe. In sede usi le sale e la strumentazione dell'Academy, online hai la massima flessibilità di orario.":
    "Both work. On site you use the Academy's rooms and equipment; online you get maximum scheduling flexibility.",
  'Da che età si può iniziare?': 'From what age can you start?',
  'Sì. È una lezione completa, non una consulenza: provi le lezioni, conosci l\'insegnante e, se non fa per te, non paghi niente.':
    "Yes. It's a full lesson, not a consultation: you try the lessons, meet the teacher and, if it's not for you, you pay nothing.",

  /* — faq: basso — */
  'La prima lezione di basso è davvero gratuita?':
    'Is the first bass lesson really free?',
  'Devo iscrivermi a un corso di basso elettrico?':
    'Do I have to enrol in an electric bass course?',
  'Ci sono lezioni di basso per adulti?': 'Are there bass lessons for adults?',
  "Dai 6 anni, con lezioni adattate all'età e al carattere. Non serve saper leggere la musica e non serve comprare lo strumento: l'aula è attrezzata.":
    "From age 6, with lessons adapted to age and personality. You don't need to read music and you don't need to buy an instrument: the room is fully equipped.",
  'Quanto costano le lezioni di basso?': 'How much do bass lessons cost?',
  'Serve un basso costoso?': 'Do I need an expensive bass?',
  'No. Per iniziare va bene un basso entry level: un tutor ti consiglia quello giusto.':
    'No. An entry-level bass is fine to start with: a tutor will recommend the right one.',

  /* — faq: canto — */
  'La prima lezione di canto è davvero gratuita?':
    'Is the first singing lesson really free?',
  'Sì, gratuita e senza impegno: non ti chiediamo nessun pagamento. Serve a conoscere l\'insegnante e capire da dove partire. Decidi dopo se continuare.':
    "Yes, free and with no obligation: we don't ask for any payment. It's there to meet the teacher and work out where to start. You decide afterwards whether to continue.",
  'Non ho mai cantato: posso iniziare?': "I've never sung before: can I start?",
  "Sì. Non c'è audizione né livello minimo. Le lezioni partono da dove sei, anche dal primo giorno davanti al microfono.":
    "Yes. There's no audition and no minimum level. Lessons start from where you are, even your very first day at the microphone.",
  'Devo iscrivermi a un corso di canto?': 'Do I have to enrol in a singing course?',
  'No. Non ci sono iscrizioni né calendari fissi: scegli un pacchetto di lezioni individuali o di gruppo e decidi tu ritmo e obiettivi. Se cerchi un corso triennale con titolo internazionale, c\'è il corso universitario di canto.':
    "No. There are no enrolments or fixed timetables: you choose a package of one-to-one or group lessons and set your own pace and goals. If you're after a three-year course with an international qualification, there's the university singing course.",
  'Ci sono lezioni di canto per adulti?': 'Are there singing lessons for adults?',
  'Sì. Le lezioni sono costruite sul singolo studente e funzionano a qualsiasi età.':
    'Yes. Lessons are built around the individual student and work at any age.',
  'Lavoro: a che ore si fanno le lezioni?': 'I work: what times are lessons held?',
  "Giorno e ora li concordi con il tuo insegnante e li gestisci dall'app di prenotazione.":
    'You agree day and time with your teacher and manage them from the booking app.',
  'Quanto costano le lezioni di canto?': 'How much do singing lessons cost?',
  'Smart costa 96€ al mese, con una lezione individuale a settimana. Standard costa 160€ al mese e aggiunge una lezione settimanale di musica d\'insieme. La prima lezione è gratuita.':
    'Smart costs 96€ a month, with one one-to-one lesson a week. Standard costs 160€ a month and adds a weekly ensemble music lesson. The first lesson is free.',
  'Come funzionano le lezioni di canto online?':
    'How do online singing lessons work?',
  'Fai lezione in videochiamata con gli stessi insegnanti della sede. Anche la prova gratuita può essere online.':
    'You have your lesson over video call with the same teachers as on site. Even the free trial can be online.',
  "Posso scegliere l'insegnante?": 'Can I choose my teacher?',
  'Puoi indicare una preferenza quando prenoti: cerchiamo di rispettarla in base alle disponibilità.':
    'You can state a preference when you book: we do our best to honour it, depending on availability.',
  'Serve saper leggere la musica?': 'Do I need to read music?',
  'No. La teoria arriva strada facendo, quando serve alla tua voce.':
    'No. Theory comes along the way, when your voice needs it.',

  /* — faq: chitarra — */
  'La prima lezione di chitarra è davvero gratuita?':
    'Is the first guitar lesson really free?',
  'Devo iscrivermi a un corso di chitarra?':
    'Do I have to enrol in a guitar course?',
  'Ci sono lezioni di chitarra per adulti?':
    'Are there guitar lessons for adults?',
  'Mio figlio può fare lezioni di chitarra?':
    'Can my child take guitar lessons?',
  'Sì, dai 6 anni in su.': 'Yes, from age 6 up.',
  'Quanto costano le lezioni di chitarra?': 'How much do guitar lessons cost?',
  'Serve una chitarra costosa?': 'Do I need an expensive guitar?',
  'No. Per iniziare va bene una chitarra entry level: ti consigliamo quella giusta in base a quello che vuoi suonare.':
    "No. An entry-level guitar is fine to start with: we'll recommend the right one based on what you want to play.",
  'Che stili posso studiare?': 'What styles can I study?',
  'Rock, blues, funk, indie, alternative, neo-soul, jazz fusion, fingerstyle: scegli tu i brani su cui lavorare.':
    'Rock, blues, funk, indie, alternative, neo-soul, jazz fusion, fingerstyle: you choose the songs to work on.',

  /* — faq: pianoforte — */
  'La prima lezione di pianoforte è davvero gratuita?':
    'Is the first piano lesson really free?',
  'Devo iscrivermi a un corso di pianoforte?':
    'Do I have to enrol in a piano course?',
  'Ci sono lezioni di pianoforte per adulti?':
    'Are there piano lessons for adults?',
  "Dai 6 anni, con lezioni adattate all'età e al carattere. Non serve saper leggere la musica: si impara suonando.":
    "From age 6, with lessons adapted to age and personality. You don't need to read music: you learn by playing.",
  'Pianoforte o tastiere: devo scegliere?':
    'Piano or keyboards: do I have to choose?',
  'No. Nelle stesse lezioni puoi studiare pianoforte acustico, tastiere moderne, synth e DAW.':
    'No. In the same lessons you can study acoustic piano, modern keyboards, synths and DAWs.',
  'Quanto costano le lezioni di pianoforte?': 'How much do piano lessons cost?',
  'Serve una tastiera costosa?': 'Do I need an expensive keyboard?',
  'No. Per iniziare va bene una tastiera entry level: ti consigliamo quella giusta in base ai tuoi obiettivi.':
    "No. An entry-level keyboard is fine to start with: we'll recommend the right one based on your goals.",

  /* — faq: produzione — */
  'La prima lezione è davvero gratuita?': 'Is the first lesson really free?',
  'Serve saper suonare o conoscere la musica?':
    'Do I need to play an instrument or know music?',
  'No. Molti allievi partono da zero.': 'No. Many students start from scratch.',
  "Serve un'attrezzatura costosa?": 'Do I need expensive gear?',
  'No. Per iniziare bastano un computer e un paio di cuffie. In aula trovi tutta la strumentazione professionale.':
    "No. A computer and a pair of headphones are enough to start. In the room you'll find all the professional equipment.",
  'Che software si usa?': 'What software do you use?',
  'Soprattutto Ableton Live, in un\'aula dedicata. Se usi già Logic Pro, Reaper o Pro Tools, puoi continuare con la tua DAW.':
    'Mostly Ableton Live, in a dedicated room. If you already use Logic Pro, Reaper or Pro Tools, you can carry on with your own DAW.',
  'In quanto tempo produrrò un brano completo?':
    'How long until I produce a complete track?',
  'In media gli allievi finiscono il primo brano completo in circa 2 mesi.':
    'On average, students finish their first complete track in about 2 months.',
  'Ho 40 anni: è tardi per iniziare?': "I'm 40: is it too late to start?",
  'No. Molti allievi iniziano a 30, 40 o 50 anni, e le lezioni si possono fare anche la sera.':
    'No. Many students start at 30, 40 or 50, and lessons can take place in the evening too.',
  'Quanto costano le lezioni?': 'How much do lessons cost?',
  "Funzionano entrambe. In sede usi l'aula Ableton e la strumentazione dell'Academy, online hai la massima flessibilità di orario.":
    "Both work. On site you use the Ableton room and the Academy's equipment; online you get maximum scheduling flexibility.",
  "Che differenza c'è con il corso universitario?":
    'How is this different from the university course?',
  'Qui compri pacchetti di lezioni e scegli tu ritmo e obiettivi. Il Bachelor of Arts in Urban Music Production è un percorso triennale con titolo universitario internazionale.':
    'Here you buy lesson packages and set your own pace and goals. The Bachelor of Arts in Urban Music Production is a three-year programme with an international university degree.',

  /* — pacchetti canto — */
  'Lezione di prova': 'Trial lesson',
  'Si parte da qui': 'Where you start',
  'In sede o online, senza impegno': 'On site or online, no obligation',
  "Conosci l'insegnante": 'Meet the teacher',
  'Capiamo insieme il tuo livello': 'We work out your level together',
  'Decidi dopo se continuare': 'Decide afterwards whether to continue',
  Smart: 'Smart',
  Standard: 'Standard',
  '/ mese': '/ month',
  'circa 24€ a lezione': 'around 24€ per lesson',
  'circa 20€ a lezione, gruppo incluso': 'around 20€ per lesson, group included',
  'Per studiare con costanza': 'To study consistently',
  "Tecnica più musica d'insieme": 'Technique plus ensemble music',
  '1 lezione individuale a settimana': '1 one-to-one lesson a week',
  "1 lezione di musica d'insieme a settimana": '1 ensemble music lesson a week',
  'Accesso alle sale studio': 'Access to the practice rooms',
  'App di prenotazione': 'Booking app',
}
const TR = {}
for (const [k, v] of Object.entries(TR_RAW)) TR[norm(k)] = v
const tr = (it) => TR[norm(it)]

/* ————— campi singoli en, per corso (dall'it post-fix) ————— */
const SUMMARY_EN = {
  'course-custom-basso':
    'For all levels, from zero to your first complete song. One-to-one lessons, group lessons and jam sessions with working bass players. For adults, teenagers and children from age 6. Evenings too, online too.',
  'course-custom-canto':
    'For all levels, even if you have never sung before. One-to-one lessons and ensemble music with teachers who still sing with the big names of Italian music.',
  'course-custom-chitarra':
    'For all levels, from zero to your first complete song. One-to-one lessons, group lessons and jam sessions with guitarists who still play live. Evenings too, online too.',
  'course-custom-pianoforte':
    'For all levels, from your first chord to your first complete song. Acoustic piano, keyboards, synths and DAWs with working musicians as teachers. For adults, teenagers and children from age 6. Evenings too, online too.',
  'course-custom-produzione':
    'Produce your first complete track, even if you are starting from scratch. One-to-one lessons in a dedicated Ableton room, with working producers. All you need is a computer and a pair of headphones. Evenings too, online too.',
}

/* skillsLede è reso come TITOLO della sezione "cosa impari": la en è
   l'equivalente della it attuale, non il copy legacy */
const SKILLSLEDE_EN = {
  'course-custom-basso':
    'Six areas of work. Your teacher balances them around what you want to play.',
  'course-custom-canto':
    'Six areas of work. Your teacher balances them around where you want to go.',
  'course-custom-chitarra':
    'Six areas of work. Your teacher balances them around what you want to play.',
  'course-custom-pianoforte':
    'Six areas of work. Your teacher balances them around what you want to play.',
  'course-custom-produzione':
    'Six areas of work. Your teacher balances them around the music you want to produce.',
}

/* ————— body: fix it + traduzione en ————— */

/* paragrafo finale del basso da ELIMINARE (promette la sezione
   insegnanti, che su basso non esiste) */
const BASSO_DROP = 'Che tu voglia sbloccare lo slap'

/* terzi paragrafi del metodo da AGGIUNGERE (dai mockup) */
const BODY_APPEND_IT = {
  'course-custom-chitarra':
    'Cinque chitarristi, cinque stili: rock, fingerpicking, session, live, cantautorato. Scopri chi sono e, quando prenoti, dicci con chi vorresti iniziare.',
  'course-custom-pianoforte':
    'Tre insegnanti, tre approcci: chi lavora con bambini e ragazzi, chi unisce jazz ed elettronica, chi porta da zero a pianisti sicuri. Dicci con chi vorresti iniziare quando prenoti.',
  'course-custom-produzione':
    'Quattro produttori, quattro percorsi diversi tra studio, palco, cinema e conservatorio. Dicci con chi vorresti iniziare quando prenoti.',
}

const BODY_EN = {
  'course-custom-basso': [
    "At Creative Hub Academy, bass is taught the way it's played in a band: time, groove and listening first. Our bass teachers are working musicians, and in lessons they bring what they use on stage and in the studio.",
    'Every lesson starts from where you are. In the first lesson your teacher listens to you play, or puts a bass in your hands for the first time, works out what you want to play and builds a tailored roadmap: no pointless theory, real songs from the very first weeks.',
  ],
  'course-custom-canto': [
    "At Creative Hub Academy, singing is taught the way it's done on stage and in the studio. Our singing teachers still work today as singers, backing vocalists, vocal coaches and songwriters: in lessons they bring what they use every day, not just theory.",
    'Every lesson starts from your voice. In the first lesson your teacher listens to how you sing, understands where you want to go and builds a tailored programme. Technique, meaning breathing, placement and intonation, goes hand in hand with interpretation and with singing alongside others: the goal is to use your voice, not just train it.',
  ],
  'course-custom-chitarra': [
    "At Creative Hub Academy, guitar is taught the way it's played on stage and in the studio. Our guitar teachers are working professionals: in lessons they bring what they use every night live and every day in the recording room.",
    'Every lesson starts from where you are. In the first lesson your teacher listens to you play, or puts a guitar in your hands for the first time, works out what you want to play and builds a tailored roadmap: little theory, lots of practice, real songs from the very first weeks.',
    "Five guitarists, five styles: rock, fingerpicking, session, live, songwriting. Find out who they are and, when you book, tell us who you'd like to start with.",
  ],
  'course-custom-pianoforte': [
    'At Creative Hub Academy, piano is taught by playing, not just reading. Our piano teachers are working musicians and focus on what really matters: playing well, accompanying, improvising.',
    "Every lesson starts from where you are. In the first lesson your teacher listens to you play, or sits you at the piano for the first time, works out what you want to play and builds a tailored roadmap. You don't have to choose between acoustic piano, keyboards and synths: you can study them together.",
    "Three teachers, three approaches: one works with children and teenagers, one blends jazz and electronic music, one takes you from zero to a confident pianist. Tell us who you'd like to start with when you book.",
  ],
  'course-custom-produzione': [
    'At Creative Hub Academy, you learn production by producing. Our teachers are working producers and sound engineers: they work on records, film scores and live shows, and in lessons they bring the same workflow they use in the studio every day.',
    'Every lesson starts from where you are. In the first lesson your teacher understands the music in your head and builds a tailored roadmap, from your first beat to a finished track. You work on your own ideas, not abstract examples, with only the theory you need to produce and mix.',
    "Four producers, four different paths across studio, stage, film and conservatory. Tell us who you'd like to start with when you book.",
  ],
}

/* ————— helper PortableText ————— */
const blockText = (b) =>
  (b?.children ?? []).map((c) => c.text ?? '').join('').trim()

const mkBlock = (text) => ({
  _key: key(),
  _type: 'block',
  style: 'normal',
  markDefs: [],
  children: [{ _key: key(), _type: 'span', marks: [], text }],
})

/* ————— esecuzione ————— */
let warned = false
const warn = (msg) => {
  warned = true
  console.warn(`! ${msg}`)
}

for (const baseId of COURSES) {
  const docs = await client.getDocuments([baseId, `drafts.${baseId}`])
  for (const doc of docs) {
    if (!doc) continue
    const patch = client.patch(doc._id)
    let dirty = false
    const set = (obj) => {
      patch.set(obj)
      dirty = true
    }
    const log = (msg) => console.log(`→ ${doc._id}: ${msg}`)

    /* — 4a. structureIntro: via la frase che duplica il titolo — */
    const intro = doc.structureIntro?.it ?? ''
    const introClean = intro.replace(/^Tre modi di studiare [^.]+\.\s*/, '')
    if (introClean !== intro) {
      log(`structureIntro.it\n   da: "${intro}"\n   a:  "${introClean}"`)
      set({ 'structureIntro.it': introClean })
    }
    doc.structureIntro = { ...(doc.structureIntro ?? {}), it: introClean }

    /* — 4f. chitarra, faq figli: "Sì." → risposta col range d'età — */
    if (baseId === 'course-custom-chitarra') {
      const kid = (doc.faq ?? []).find(
        (f) => norm(f.title?.it) === 'Mio figlio può fare lezioni di chitarra?'
      )
      if (kid && norm(kid.text?.it) === 'Sì.') {
        log(`faq ${kid._key}: "Sì." → "Sì, dai 6 anni in su."`)
        set({ [`faq[_key=="${kid._key}"].text.it`]: 'Sì, dai 6 anni in su.' })
        kid.text = { ...(kid.text ?? {}), it: 'Sì, dai 6 anni in su.' }
      }
    }

    /* — 4b/c/d/e. body.it: paragrafo basso via, terzi paragrafi dentro — */
    let bodyIt = [...(doc.body?.it ?? [])]
    if (baseId === 'course-custom-basso') {
      const before = bodyIt.length
      bodyIt = bodyIt.filter((b) => !blockText(b).startsWith(BASSO_DROP))
      if (bodyIt.length !== before) {
        log('body.it: eliminato il paragrafo "Che tu voglia sbloccare lo slap…"')
        set({ 'body.it': bodyIt })
      }
    }
    const appendIt = BODY_APPEND_IT[baseId]
    if (appendIt) {
      const marker = appendIt.slice(0, 20)
      if (!bodyIt.some((b) => blockText(b).startsWith(marker))) {
        bodyIt = [...bodyIt, mkBlock(appendIt)]
        log(`body.it: aggiunto il terzo paragrafo "${marker}…"`)
        set({ 'body.it': bodyIt })
      }
    }

    /* — 5. inglese: sovrascrive le .en legacy con la traduzione
       dell'italiano post-fix — */

    /* summary / skillsLede / structureIntro */
    const singles = [
      ['summary', SUMMARY_EN[baseId]],
      ['skillsLede', SKILLSLEDE_EN[baseId]],
      ['structureIntro', tr(introClean)],
    ]
    for (const [field, en] of singles) {
      if (!en) {
        warn(`${doc._id}: nessuna en per ${field} ("${doc[field]?.it ?? ''}")`)
        continue
      }
      if ((doc[field]?.en ?? '') !== en) {
        log(`${field}.en riscritto`)
        set({ [`${field}.en`]: en })
      }
    }

    /* body.en */
    const bodyEnTarget = BODY_EN[baseId] ?? []
    const bodyEnCur = (doc.body?.en ?? []).map(blockText)
    if (bodyEnCur.join('\n') !== bodyEnTarget.join('\n')) {
      log(`body.en riscritto (${bodyEnTarget.length} paragrafi)`)
      set({ 'body.en': bodyEnTarget.map(mkBlock) })
    }

    /* skills / structure / admissions / faq: title+text via dizionario */
    for (const field of ['skills', 'structure', 'admissions', 'faq']) {
      for (const item of doc[field] ?? []) {
        for (const sub of ['title', 'text']) {
          const itVal = item[sub]?.it
          if (!itVal) continue
          const en = tr(itVal)
          if (!en) {
            warn(`${doc._id}: ${field} ${item._key} ${sub} senza en: "${itVal}"`)
            continue
          }
          if ((item[sub]?.en ?? '') !== en) {
            set({ [`${field}[_key=="${item._key}"].${sub}.en`]: en })
          }
        }
      }
      if ((doc[field] ?? []).length) log(`${field}: en allineate`)
    }

    /* admissionsKeys (localeString[]) */
    for (const k of doc.admissionsKeys ?? []) {
      const en = tr(k.it)
      if (!en) {
        warn(`${doc._id}: admissionsKeys ${k._key} senza en: "${k.it}"`)
        continue
      }
      if ((k.en ?? '') !== en) {
        set({ [`admissionsKeys[_key=="${k._key}"].en`]: en })
      }
    }

    /* packages (solo il canto li ha): name/per/unitNote/note/badge/features.
       price non si tocca */
    for (const p of doc.packages ?? []) {
      for (const sub of ['name', 'per', 'unitNote', 'note', 'badge']) {
        const itVal = p[sub]?.it
        if (!itVal) continue
        const en = tr(itVal)
        if (!en) {
          warn(`${doc._id}: packages ${p._key} ${sub} senza en: "${itVal}"`)
          continue
        }
        if ((p[sub]?.en ?? '') !== en) {
          set({ [`packages[_key=="${p._key}"].${sub}.en`]: en })
        }
      }
      for (const f of p.features ?? []) {
        const en = tr(f.it)
        if (!en) {
          warn(`${doc._id}: packages ${p._key} feature senza en: "${f.it}"`)
          continue
        }
        if ((f.en ?? '') !== en) {
          set({
            [`packages[_key=="${p._key}"].features[_key=="${f._key}"].en`]: en,
          })
        }
      }
    }
    if ((doc.packages ?? []).length) log('packages: en allineate')

    if (!dirty) {
      console.log(`= ${doc._id}: già allineato`)
      continue
    }
    if (dryRun) {
      console.log(`(dry-run) ${doc._id}: patch non inviata`)
      continue
    }
    await patch.commit()
    console.log(`✓ ${doc._id} aggiornato`)
  }
}

console.log(warned ? 'Fatto, con avvisi (vedi sopra).' : 'Fatto.')
