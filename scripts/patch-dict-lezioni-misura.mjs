/**
 * Copy delle pagine "lezioni su misura" (ott 2026, mockup basso /
 * chitarra / pianoforte-tastiere / produzione-musicale).
 *
 * Aggiunge al blocco `lesson` di it.json e en.json:
 *  - audience  → "Per chi sono le lezioni" (4 card hairline)
 *  - school    → "Cosa trovi alla nostra scuola" (6 card, variante aula
 *                Ableton per la produzione)
 *  - sede.lede / sede.mapLabel → SEO locale (gli orari segreteria del
 *    mockup restano fuori: sono un dato giallo da confermare)
 *  - ctaSteps  → i tre passi numerati sopra la chiusura
 *  - uniSection* + le voci uniExit mancanti → ponte al corso universitario
 *  - seo       → H1/title/description per corso (il pattern generico
 *                "Lezioni di {titolo} a Bologna" non basta per basso
 *                elettrico e per produzione + Ableton)
 *
 * IDEMPOTENTE: rilegge i file a ogni esecuzione e scrive SOLO le chiavi
 * assenti — le traduzioni già presenti (anche di altre sessioni) non
 * vengono mai sovrascritte.
 *
 * Uso: node scripts/patch-dict-lezioni-misura.mjs [--dry-run]
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const dryRun = process.argv.includes('--dry-run')

const IT = {
  lesson: {
    audience: {
      kicker: 'per chi è',
      title: 'Per chi sono le lezioni.',
      lede: 'Studenti, adulti che lavorano, bambini dai 6 anni e musicisti che vogliono crescere: le lezioni si costruiscono su ognuno.',
      items: [
        {
          v: 'studente',
          kicker: 'per te studente',
          title: 'Inizia senza spendere troppo.',
          text: 'Provi con poche lezioni e trovi un ambiente giovane, con jam session ed eventi. E se ti prende, hai già la strada per farne un mestiere: dopo le lezioni puoi proseguire con i corsi universitari dell’Academy.',
        },
        {
          v: 'lavoro',
          kicker: 'per te che lavori',
          title: 'Lezioni anche la sera.',
          text: 'Pensate per chi lavora: orari serali e pacchetti che puoi mettere in pausa quando il lavoro si prende tutto il tempo. Si parte da zero, a qualsiasi età.',
        },
        {
          v: 'genitore',
          kicker: 'per te genitore',
          title: 'Dai 6 anni in su.',
          text: 'Si suona fin da subito la musica che piace, con un repertorio pop, rock e colonne sonore. Non serve comprare lo strumento: l’aula è attrezzata.',
        },
        {
          v: 'musicista',
          kicker: 'per te musicista',
          title: 'Per sbloccarti e crescere.',
          text: 'Lavori sui tuoi brani e sui tuoi obiettivi, con insegnanti che lavorano ancora oggi nella musica, dal palco allo studio.',
        },
      ],
    },
    school: {
      kicker: 'la scuola',
      title: 'Cosa trovi alla nostra scuola.',
      titleProduzione: 'Cosa trovi nella nostra aula di produzione.',
      lede: 'Le lezioni si tengono nella sede di Creative Hub Academy, dedicata alla musica: qui studiano ogni giorno musicisti, cantanti e produttori.',
      items: [
        {
          title: 'Aule attrezzate',
          text: 'Strumenti e amplificatori professionali, e sale prova per esercitarti da solo, prenotabili anche fuori dall’orario di lezione.',
        },
        {
          title: 'Insegnanti in attività',
          text: 'Insegnanti che lavorano ancora oggi nella musica, dal palco allo studio.',
        },
        {
          title: 'Una roadmap chiara',
          text: 'Dalla prima nota al primo brano completo, con obiettivi concreti lezione dopo lezione. Niente più tutorial a caso.',
        },
        {
          title: 'Jam session ed eventi',
          text: 'Occasioni per suonare con altri musicisti e portare quello che impari fuori dall’aula.',
        },
        {
          title: 'Orari anche serali',
          text: 'Pensati per chi lavora: lezioni la sera e pacchetti che puoi mettere in pausa.',
        },
        {
          title: 'Anche per bambini',
          text: 'Dai 6 anni, con un repertorio pop, rock e colonne sonore: non serve comprare lo strumento, l’aula è attrezzata. Ragazzi e adulti studiano nella stessa sede dei corsi universitari.',
        },
      ],
      itemsProduzione: [
        {
          title: 'Un’aula dedicata ad Ableton',
          text: 'Ableton Live Suite completa, con tutti i plugin e gli strumenti, e monitor da studio calibrati.',
        },
        {
          title: 'Strumentazione professionale',
          text: 'Controller MIDI e launchpad, interfacce audio di alto livello, tastiere MIDI da 49 e 61 tasti, microfoni professionali.',
        },
        {
          title: 'Produttori in attività',
          text: 'Insegnanti che lavorano su dischi, colonne sonore e live.',
        },
        {
          title: 'Una roadmap chiara',
          text: 'Dal primo beat al primo brano completo. Niente più plugin e tutorial a caso.',
        },
        {
          title: 'Studio prenotabile',
          text: 'Puoi prenotare l’aula e lavorare ai tuoi brani anche fuori dall’orario di lezione.',
        },
        {
          title: 'Orari anche serali',
          text: 'Molti allievi iniziano a 30, 40 o 50 anni: lezioni la sera e pacchetti che puoi mettere in pausa.',
        },
      ],
    },
    sede: {
      lede: 'Creative Hub Academy insegna musica a Bologna dal 1999. Le lezioni si tengono nella stessa sede dei corsi universitari, con aule attrezzate e sale prova.',
      mapLabel: 'apri la mappa',
    },
    ctaSteps: {
      lede: 'Ci vogliono 30 secondi. Ecco cosa succede dopo:',
      items: [
        'Un tutor ti contatta entro 24 ore nei giorni feriali per una breve chiamata conoscitiva.',
        'Scegliete insieme giorno, orario e insegnante.',
        'Fai la lezione, in sede o online. Poi decidi se continuare.',
      ],
    },
    uniSectionKicker: 'dopo le lezioni',
    uniSectionTitle: 'Vuoi farne una professione?',
    uniExit: {
      'corso-custom-basso': {
        question:
          'Esiste anche il corso universitario: un Bachelor of Arts triennale in Creative Musicianship, indirizzo Strumento.',
        label: 'Scopri il corso universitario di strumento',
      },
      'corso-custom-chitarra': {
        question:
          'Esiste anche il corso universitario: un Bachelor of Arts triennale in Creative Musicianship, indirizzo Strumento.',
        label: 'Scopri il corso universitario di strumento',
      },
      'corso-custom-pianoforte-tastiere': {
        question:
          'Esiste anche il corso universitario: un Bachelor of Arts triennale in Creative Musicianship, indirizzo Strumento.',
        label: 'Scopri il corso universitario di strumento',
      },
    },
    seo: {
      'corso-custom-basso': {
        h1: 'Lezioni di basso elettrico a Bologna.',
        title: 'Lezioni di basso elettrico a Bologna | Creative Hub Academy',
        description:
          'Lezioni di basso elettrico a Bologna e online, individuali e di gruppo, da zero al primo brano completo. Per adulti, ragazzi e bambini dai 6 anni. Lezioni anche serali. Prima lezione gratuita.',
      },
      'corso-custom-chitarra': {
        h1: '',
        title:
          'Lezioni di chitarra a Bologna, individuali e di gruppo | Creative Hub Academy',
        description:
          'Lezioni di chitarra a Bologna, individuali e di gruppo, da zero al primo brano completo. Insegnanti che suonano con artisti italiani e internazionali. Lezioni anche serali. Prima lezione gratuita.',
      },
      'corso-custom-pianoforte-tastiere': {
        h1: '',
        title: 'Lezioni di pianoforte e tastiere a Bologna | Creative Hub Academy',
        description:
          'Lezioni di pianoforte e tastiere a Bologna e online, individuali e di gruppo: pianoforte, synth e DAW. Per adulti, ragazzi e bambini dai 6 anni. Lezioni anche serali. Prima lezione gratuita.',
      },
      'corso-custom-produzione-musicale': {
        h1: 'Lezioni di produzione musicale e Ableton a Bologna.',
        title:
          'Lezioni di produzione musicale e Ableton a Bologna | Creative Hub Academy',
        description:
          'Lezioni di produzione musicale a Bologna e online: produci il tuo primo brano completo, anche partendo da zero, in un’aula dedicata ad Ableton. Lezioni anche serali. Prima lezione gratuita.',
      },
    },
  },
}

const EN = {
  lesson: {
    audience: {
      kicker: 'who it’s for',
      title: 'Who the lessons are for.',
      lede: 'Students, working adults, children from the age of 6 and musicians who want to grow: every lesson is built around the person.',
      items: [
        {
          v: 'studente',
          kicker: 'if you’re a student',
          title: 'Start without spending much.',
          text: 'You try with just a few lessons and find a young environment, with jam sessions and events. And if it clicks, the path to making it your job is already here: after the lessons you can move on to the Academy degree programmes.',
        },
        {
          v: 'lavoro',
          kicker: 'if you work',
          title: 'Evening lessons too.',
          text: 'Made for people with a job: evening slots and lesson packs you can pause when work takes over. You can start from scratch, at any age.',
        },
        {
          v: 'genitore',
          kicker: 'if you’re a parent',
          title: 'From the age of 6.',
          text: 'Children play the music they love from day one, with a pop, rock and soundtrack repertoire. No need to buy an instrument: the room is fully equipped.',
        },
        {
          v: 'musicista',
          kicker: 'if you’re a musician',
          title: 'To get unstuck and grow.',
          text: 'You work on your own tracks and your own goals, with teachers who still work in music today, on stage and in the studio.',
        },
      ],
    },
    school: {
      kicker: 'the school',
      title: 'What you find at our school.',
      titleProduzione: 'What you find in our production room.',
      lede: 'Lessons take place at Creative Hub Academy, a venue dedicated to music: musicians, singers and producers study here every day.',
      items: [
        {
          title: 'Equipped rooms',
          text: 'Professional instruments and amps, plus rehearsal rooms you can book to practise on your own, also outside lesson hours.',
        },
        {
          title: 'Working teachers',
          text: 'Teachers who still work in music today, from the stage to the studio.',
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
          text: 'Made for people with a job: evening lessons and packs you can pause.',
        },
        {
          title: 'Children welcome',
          text: 'From the age of 6, with a pop, rock and soundtrack repertoire: no need to buy an instrument, the room is equipped. Teenagers and adults study in the same venue as the degree programmes.',
        },
      ],
      itemsProduzione: [
        {
          title: 'A room dedicated to Ableton',
          text: 'The full Ableton Live Suite, with every plugin and instrument, and calibrated studio monitors.',
        },
        {
          title: 'Professional gear',
          text: 'MIDI controllers and launchpads, high-end audio interfaces, 49 and 61-key MIDI keyboards, professional microphones.',
        },
        {
          title: 'Working producers',
          text: 'Teachers who work on records, soundtracks and live shows.',
        },
        {
          title: 'A clear roadmap',
          text: 'From your first beat to your first complete track. No more random plugins and tutorials.',
        },
        {
          title: 'A bookable studio',
          text: 'You can book the room and work on your own tracks outside lesson hours.',
        },
        {
          title: 'Evening slots too',
          text: 'Plenty of students start at 30, 40 or 50: evening lessons and packs you can pause.',
        },
      ],
    },
    sede: {
      lede: 'Creative Hub Academy has been teaching music in Bologna since 1999. Lessons take place in the same venue as the degree programmes, with equipped rooms and rehearsal spaces.',
      mapLabel: 'open the map',
    },
    ctaSteps: {
      lede: 'It takes 30 seconds. Here’s what happens next:',
      items: [
        'A tutor gets back to you within 24 hours on working days for a short introductory call.',
        'Together you pick the day, the time and the teacher.',
        'You take the lesson, in person or online. Then you decide whether to carry on.',
      ],
    },
    uniSectionKicker: 'after the lessons',
    uniSectionTitle: 'Want to make it your profession?',
    uniExit: {
      'corso-custom-basso': {
        question:
          'There is a degree programme too: a three-year Bachelor of Arts in Creative Musicianship, instrument pathway.',
        label: 'Discover the instrument degree programme',
      },
      'corso-custom-chitarra': {
        question:
          'There is a degree programme too: a three-year Bachelor of Arts in Creative Musicianship, instrument pathway.',
        label: 'Discover the instrument degree programme',
      },
      'corso-custom-pianoforte-tastiere': {
        question:
          'There is a degree programme too: a three-year Bachelor of Arts in Creative Musicianship, instrument pathway.',
        label: 'Discover the instrument degree programme',
      },
    },
    seo: {
      'corso-custom-basso': {
        h1: 'Electric bass lessons in Bologna.',
        title: 'Electric bass lessons in Bologna | Creative Hub Academy',
        description:
          'Electric bass lessons in Bologna and online, one to one and in groups, from scratch to your first complete song. For adults, teenagers and children from the age of 6. Evening slots too. First lesson free.',
      },
      'corso-custom-chitarra': {
        h1: '',
        title:
          'Guitar lessons in Bologna, one to one and in groups | Creative Hub Academy',
        description:
          'Guitar lessons in Bologna, one to one and in groups, from scratch to your first complete song. Teachers who play with Italian and international artists. Evening slots too. First lesson free.',
      },
      'corso-custom-pianoforte-tastiere': {
        h1: '',
        title: 'Piano and keyboard lessons in Bologna | Creative Hub Academy',
        description:
          'Piano and keyboard lessons in Bologna and online, one to one and in groups: piano, synths and DAW. For adults, teenagers and children from the age of 6. Evening slots too. First lesson free.',
      },
      'corso-custom-produzione-musicale': {
        h1: 'Music production and Ableton lessons in Bologna.',
        title:
          'Music production and Ableton lessons in Bologna | Creative Hub Academy',
        description:
          'Music production lessons in Bologna and online: finish your first complete track, even starting from scratch, in a room dedicated to Ableton. Evening slots too. First lesson free.',
      },
    },
  },
}

const isPlain = (v) =>
  typeof v === 'object' && v !== null && !Array.isArray(v)

/* scrive solo le chiavi assenti: mai una sovrascrittura */
function addMissing(target, patch, path, added) {
  for (const [key, value] of Object.entries(patch)) {
    const here = path ? `${path}.${key}` : key
    if (!(key in target)) {
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
