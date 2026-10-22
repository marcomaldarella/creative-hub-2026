/**
 * Allineamento ai mockup HTML delle lezioni su misura (ott 2026, fonte
 * `pagine-html/lezioni-su-misura/*.html`, più completa dei PDF).
 *
 * Aggiunge a `lesson` di it.json e en.json quello che nel mockup c'è e
 * in pagina mancava:
 *  - creditsLabelBySlug + nuove voci creditsBySlug → il nastro di prova
 *    cambia testa e contenuto per strumento ("stili che puoi suonare"
 *    su basso e pianoforte, le collaborazioni su canto e chitarra, le
 *    esperienze sulla produzione)
 *  - styles.bySlug → la riga di chip sotto "cosa impari" (stili per gli
 *    strumenti, software per la produzione; il canto non ce l'ha)
 *  - school.itemsBySlug → le sei card "cosa trovi" scritte per
 *    strumento (canto, chitarra, pianoforte: basso resta il default,
 *    la produzione ha già itemsProduzione)
 *
 * Restano FUORI, come da regola, tutti i contenuti gialli del mockup:
 * voto e numero delle recensioni Google, le recensioni stesse, i prezzi
 * "da definire", gli sconti, il dato "metà degli allievi ha più di 30
 * anni", gli orari e i vincoli da confermare.
 *
 * IDEMPOTENTE: rilegge i file a ogni esecuzione e scrive SOLO le chiavi
 * assenti — nessun testo già presente viene sovrascritto.
 *
 * Uso: node scripts/patch-dict-lezioni-mockup.mjs [--dry-run]
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const dryRun = process.argv.includes('--dry-run')

/* i nomi propri non si traducono: una lista sola per le due lingue */
const STILI_BASSO = ['Pop', 'Rock', 'Funk', 'Soul', 'Jazz', 'Reggae', 'Blues', 'R&B']
const STILI_PIANO = [
  'Pop', 'Rock', 'Funk', 'Soul', 'Blues', 'R&B', 'Elettronica', 'Jazz',
  'Colonne sonore',
]
const STILI_PIANO_EN = [
  'Pop', 'Rock', 'Funk', 'Soul', 'Blues', 'R&B', 'Electronica', 'Jazz',
  'Soundtracks',
]
const STILI_CHITARRA = [
  'Rock', 'Blues', 'Funk', 'Indie', 'Alternative', 'Neo-soul',
  'Jazz fusion', 'Fingerstyle',
]
const SOFTWARE = ['Ableton Live', 'Logic Pro', 'Reaper', 'Pro Tools']

const PROOF_CANTO = [
  'Mina', 'Gianni Morandi', 'Renato Zero', 'Laura Pausini', 'Ivana Spagna',
  'Mietta', 'Nomadi', 'Benassi Bros',
]
const PROOF_PRODUZIONE = [
  'Franco Battiato', 'CSI', 'Disciplinatha', 'Festival di Sanremo', 'RAI',
  'The Blackbird Academy Nashville', 'Morphing Studio',
]

const IT = {
  lesson: {
    /* il nastro di prova: su basso e pianoforte non sono collaborazioni
       ma gli stili suonabili, quindi cambia anche l'etichetta */
    creditsLabelBySlug: {
      'corso-custom-basso': 'Stili che puoi suonare',
      'corso-custom-canto': 'I nostri insegnanti hanno cantato con',
      'corso-custom-pianoforte-tastiere': 'Stili che puoi suonare',
      'corso-custom-produzione-musicale': 'Esperienze dei nostri insegnanti',
    },
    creditsBySlug: {
      'corso-custom-basso': STILI_BASSO,
      'corso-custom-canto': PROOF_CANTO,
      'corso-custom-pianoforte-tastiere': STILI_PIANO,
      'corso-custom-produzione-musicale': PROOF_PRODUZIONE,
    },
    /* riga di chip sotto "cosa impari" */
    styles: {
      bySlug: {
        'corso-custom-basso': { label: 'Stili', items: STILI_BASSO },
        'corso-custom-chitarra': { label: 'Stili', items: STILI_CHITARRA },
        'corso-custom-pianoforte-tastiere': {
          label: 'Stili',
          items: STILI_PIANO,
        },
        'corso-custom-produzione-musicale': {
          label: 'Software',
          items: SOFTWARE,
        },
      },
    },
    school: {
      itemsBySlug: {
        'corso-custom-canto': [
          {
            title: 'Sale attrezzate e cabine voce',
            text: 'Fai lezione in ambienti pensati per la voce, con impianto, microfoni e acustica professionale.',
          },
          {
            title: 'Insegnanti in attività',
            text: 'Cantanti che lavorano ancora oggi tra palco, studio e televisione.',
          },
          {
            title: 'Un programma su misura',
            text: 'Costruito sul tuo livello e sul tuo obiettivo, non uguale per tutti.',
          },
          {
            title: 'Una band con cui cantare',
            text: 'Con la musica d’insieme porti la voce fuori dalla cabina, insieme ad altri musicisti.',
          },
          {
            title: 'Sale studio per esercitarti',
            text: 'Puoi venire a provare anche fuori dall’orario di lezione.',
          },
          {
            title: 'Una community di musicisti',
            text: 'Nella stessa sede studiano gli allievi dei corsi universitari di musica: incontri, collaborazioni, nuove band.',
          },
        ],
        'corso-custom-chitarra': [
          {
            title: 'Sale e strumentazione professionale',
            text: 'Amplificatori, effetti e sale della sede, prenotabili anche fuori dall’orario di lezione.',
          },
          {
            title: 'Chitarristi in attività',
            text: 'Insegnanti che suonano ancora oggi in tour, in studio e per il cinema.',
          },
          {
            title: 'Una roadmap chiara',
            text: 'Dalla prima nota al primo brano completo, con obiettivi concreti lezione dopo lezione. Niente più tutorial a caso.',
          },
          {
            title: 'Jam session ed eventi',
            text: 'Occasioni per suonare con altri musicisti e portare quello che impari fuori dalla sala.',
          },
          {
            title: 'Orari anche serali',
            text: 'Pensati per chi lavora: lezioni la sera e pacchetti che puoi mettere in pausa.',
          },
          {
            title: 'Una community di musicisti',
            text: 'Ragazzi e adulti insieme, nella stessa sede dei corsi universitari.',
          },
        ],
        'corso-custom-pianoforte-tastiere': [
          {
            title: 'Aule con pianoforti e tastiere',
            text: 'Pianoforti, tastiere moderne, controller, pad e computer, in aule attrezzate.',
          },
          {
            title: 'Acustico ed elettronico insieme',
            text: 'Non devi scegliere un solo strumento: pianoforte, synth e DAW nelle stesse lezioni.',
          },
          {
            title: 'Una roadmap chiara',
            text: 'Dal primo accordo al primo brano completo, con obiettivi concreti lezione dopo lezione.',
          },
          {
            title: 'Jam session, eventi e saggi',
            text: 'Occasioni per suonare con altri musicisti e portare quello che impari fuori dall’aula.',
          },
          {
            title: 'Orari anche serali',
            text: 'Lezioni la sera, pacchetti che puoi mettere in pausa e sale prova con pianoforte prenotabili fuori orario.',
          },
          {
            title: 'Anche per bambini',
            text: 'Dai 6 anni, suonando fin da subito musica che piace: pop, rock, colonne sonore. Non serve saper leggere la musica.',
          },
        ],
      },
    },
  },
}

const EN = {
  lesson: {
    creditsLabelBySlug: {
      'corso-custom-basso': 'Styles you can play',
      'corso-custom-canto': 'Our teachers have sung with',
      'corso-custom-pianoforte-tastiere': 'Styles you can play',
      'corso-custom-produzione-musicale': 'What our teachers have worked on',
    },
    creditsBySlug: {
      'corso-custom-basso': STILI_BASSO,
      'corso-custom-canto': PROOF_CANTO,
      'corso-custom-pianoforte-tastiere': STILI_PIANO_EN,
      'corso-custom-produzione-musicale': PROOF_PRODUZIONE,
    },
    styles: {
      bySlug: {
        'corso-custom-basso': { label: 'Styles', items: STILI_BASSO },
        'corso-custom-chitarra': { label: 'Styles', items: STILI_CHITARRA },
        'corso-custom-pianoforte-tastiere': {
          label: 'Styles',
          items: STILI_PIANO_EN,
        },
        'corso-custom-produzione-musicale': {
          label: 'Software',
          items: SOFTWARE,
        },
      },
    },
    school: {
      itemsBySlug: {
        'corso-custom-canto': [
          {
            title: 'Rooms and vocal booths',
            text: 'You study in spaces built for the voice, with a proper PA, microphones and professional acoustics.',
          },
          {
            title: 'Working teachers',
            text: 'Singers who still work today between stage, studio and television.',
          },
          {
            title: 'A programme built for you',
            text: 'Shaped on your level and your goal, not the same for everyone.',
          },
          {
            title: 'A band to sing with',
            text: 'Ensemble work takes your voice out of the booth, alongside other musicians.',
          },
          {
            title: 'Practice rooms',
            text: 'You can come and rehearse outside lesson hours too.',
          },
          {
            title: 'A community of musicians',
            text: 'The degree students share the same building: people to meet, collaborate and start bands with.',
          },
        ],
        'corso-custom-chitarra': [
          {
            title: 'Professional rooms and gear',
            text: 'Amps, effects and the rooms of the building, bookable outside lesson hours too.',
          },
          {
            title: 'Working guitarists',
            text: 'Teachers who still play today on tour, in the studio and for film.',
          },
          {
            title: 'A clear roadmap',
            text: 'From the first note to your first complete song, with concrete goals lesson after lesson. No more random tutorials.',
          },
          {
            title: 'Jam sessions and events',
            text: 'Chances to play with other musicians and take what you learn outside the room.',
          },
          {
            title: 'Evening slots too',
            text: 'Made for people who work: evening lessons and packages you can pause.',
          },
          {
            title: 'A community of musicians',
            text: 'Teenagers and adults together, in the same building as the degree courses.',
          },
        ],
        'corso-custom-pianoforte-tastiere': [
          {
            title: 'Rooms with pianos and keyboards',
            text: 'Pianos, modern keyboards, controllers, pads and computers, in fully equipped rooms.',
          },
          {
            title: 'Acoustic and electronic together',
            text: 'You don’t have to pick one instrument: piano, synths and DAW in the same lessons.',
          },
          {
            title: 'A clear roadmap',
            text: 'From the first chord to your first complete song, with concrete goals lesson after lesson.',
          },
          {
            title: 'Jam sessions, events and shows',
            text: 'Chances to play with other musicians and take what you learn outside the room.',
          },
          {
            title: 'Evening slots too',
            text: 'Evening lessons, packages you can pause and practice rooms with a piano, bookable outside lesson hours.',
          },
          {
            title: 'For children too',
            text: 'From the age of 6, playing music they like from day one: pop, rock, soundtracks. No need to read music.',
          },
        ],
      },
    },
  },
}

const isPlain = (v) => typeof v === 'object' && v !== null && !Array.isArray(v)

/* scrive solo le chiavi assenti (o rimaste stringa vuota, cioè mai
   compilate): nessun testo già tradotto viene mai sovrascritto */
function addMissing(target, patch, path, added) {
  for (const [key, value] of Object.entries(patch)) {
    const here = path ? `${path}.${key}` : key
    const absent = !(key in target) || target[key] === ''
    if (absent && target[key] !== value) {
      target[key] = value
      added.push(here)
      continue
    }
    if (isPlain(target[key]) && isPlain(value)) {
      addMissing(target[key], value, here, added)
    }
  }
}

for (const [file, patch] of [
  ['it.json', IT],
  ['en.json', EN],
]) {
  const path = join(root, 'lib/i18n', file)
  /* rilettura a ogni esecuzione: le altre sessioni toccano lo stesso file */
  const dict = JSON.parse(readFileSync(path, 'utf8'))
  const added = []
  addMissing(dict, patch, '', added)
  if (added.length && !dryRun) {
    writeFileSync(path, `${JSON.stringify(dict, null, 2)}\n`)
  }
  console.log(
    `${file}: ${added.length} chiavi aggiunte${dryRun ? ' (dry run)' : ''}`
  )
  for (const key of added) console.log(`  + ${key}`)
}
