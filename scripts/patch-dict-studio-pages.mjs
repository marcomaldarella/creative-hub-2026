/* Aggiunge a lib/i18n/{it,en}.json le chiavi delle tre pagine studio
   (studioSub.atmos / soundDesign / podcast). IDEMPOTENTE e sicuro in
   concorrenza: rilegge i file al momento dell'esecuzione e aggiunge SOLO
   le chiavi mancanti, senza toccare nulla d'altro.

   Uso: node scripts/patch-dict-studio-pages.mjs */

import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

const IT = {
  atmos: {
    metaTitle: 'Studio Dolby Atmos 7.1.4 a Bologna | Creative Hub Studio',
    metaDesc:
      'Mix, remix e post-produzione in audio immersivo in una regia certificata Dolby, con monitor Genelec.',
    kicker: 'Studio · Dolby Atmos',
    title: 'Studio Dolby Atmos 7.1.4 a Bologna.',
    lede: 'Una regia certificata Dolby per mixare musica, colonne sonore e contenuti in audio immersivo: i suoni non stanno più solo a destra e a sinistra, ma tutto intorno e sopra chi ascolta.',
    facts: [
      { t: '7.1.4', s: "sette diffusori, un subwoofer, quattro dall'alto" },
      { t: 'Genelec', s: 'monitoraggio in tutta la regia' },
      { t: 'Certificazione Dolby', s: 'per consegne a etichette e piattaforme' },
    ],
    book: 'Prenota una sessione in Atmos',
    talk: 'Parliamone',
    marquee: 'Musica, cinema, media: in audio immersivo',
    manifestoKicker: 'audio immersivo',
    manifestoA:
      "Nell'audio immersivo il suono si posiziona e si muove nello spazio.",
    manifestoB: 'Chi ascolta non sente un brano: ci sta dentro.',
    roomKicker: 'la regia atmos',
    room: [
      { t: '7.1.4', s: 'configurazione dei diffusori' },
      { t: 'Genelec', s: 'monitor in tutta la regia' },
      { t: 'Avid MTRX', s: 'interfaccia e routing' },
      { t: 'Dolby', s: 'certificazione ufficiale' },
    ],
    usesTitle: 'Per cosa si usa.',
    usesLede: 'Dalla discografia alle installazioni.',
    uses: [
      {
        title: 'Musica',
        text: 'Mix e remix in Atmos di brani nuovi o già usciti',
      },
      {
        title: 'Cinema e serie',
        text: 'Consegna finale di colonne sonore in audio immersivo',
      },
      {
        title: 'Media e installazioni',
        text: 'Post-produzione e sound design per musei, mostre, esperienze',
      },
      {
        title: 'Gaming',
        text: 'Audio immersivo per videogiochi e contenuti interattivi',
      },
    ],
    remixKicker: 'remix in atmos',
    remixTitle: 'Il tuo brano è già uscito?',
    remixText:
      "Possiamo rimixarlo in Dolby Atmos partendo dalle tracce originali, per le piattaforme che supportano l'audio immersivo.",
    remixCta: 'Chiedi un remix',
    labKicker: 'ricerca',
    labTitle: "Un laboratorio permanente sull'Atmos.",
    labText:
      "La regia è anche il centro della ricerca di Creative Hub sull'audio immersivo, con progetti pilota insieme ad aziende e istituzioni.",
    labCta: 'Vai a Innovazione',
    faqTitle: "Domande sull'Atmos.",
    ctaTitle: 'Raccontaci il tuo progetto.',
    ctaText:
      'Scrivici cosa vuoi mixare o consegnare in Atmos. Ti ricontattiamo dal lunedì al venerdì per una consulenza e per fissare la sessione.',
  },
  soundDesign: {
    metaTitle:
      'Sound design e post-produzione audio a Bologna | Creative Hub Studio',
    metaDesc:
      'Sound design, foley, colonne sonore e mix in Dolby Atmos per cinema, serie, pubblicità, videogiochi e installazioni.',
    kicker: 'Studio · Sound design',
    title: 'Sound design e post-produzione audio per video e cinema.',
    lede: 'Dal montaggio al master: suoni, foley, colonne sonore e mix finale, anche in Dolby Atmos. Per film, serie, pubblicità, videogiochi e installazioni.',
    facts: [
      { t: 'Post-produzione', s: 'dialoghi, effetti, ambienti' },
      { t: 'Foley e colonne sonore', s: 'suoni registrati e musica originale' },
      { t: 'Consegna in Atmos', s: 'o in stereo, nei formati richiesti' },
    ],
    book: 'Parlaci del tuo video',
    talk: 'Parliamone',
    forTitle: 'Per chi lavoriamo.',
    forLede: 'Ogni formato ha le sue regole di consegna. Le conosciamo.',
    clients: [
      {
        title: 'Cinema e serie',
        text: 'Post-produzione audio e mix per la consegna',
      },
      {
        title: 'Pubblicità e video',
        text: 'Sound design e mix per spot, brand e social',
      },
      {
        title: 'Videogiochi',
        text: 'Effetti, ambienti e audio immersivo',
      },
      {
        title: 'Installazioni',
        text: 'Suono per musei, mostre, esperienze',
      },
    ],
    whatTitle: 'Cosa facciamo.',
    what: [
      'Sound design: creazione di suoni ed effetti su misura',
      'Foley: rumori registrati in studio in sincrono con le immagini',
      'Montaggio e pulizia dei dialoghi',
      'Colonne sonore originali, registrate con musicisti veri',
      'Mix finale in stereo o Dolby Atmos',
      'Mastering e consegna nei formati richiesti',
    ],
    stepsTitle: 'Dal montaggio al master.',
    steps: [
      {
        title: 'Spotting',
        text: 'Guardiamo il montato insieme e decidiamo dove servono suoni, musica e silenzi.',
      },
      {
        title: 'Sound design e foley',
        text: 'Creiamo e registriamo effetti, ambienti e rumori in sincrono.',
      },
      {
        title: 'Musica',
        text: 'Colonna sonora originale, registrata in studio, o adattamento della musica scelta.',
      },
      {
        title: 'Mix',
        text: 'Dialoghi, effetti e musica in equilibrio, in stereo o in Dolby Atmos.',
      },
      {
        title: 'Consegna',
        text: 'Master e stem nei formati richiesti dalla piattaforma o dal distributore.',
      },
    ],
    scoreKicker: 'colonne sonore',
    scoreTitle: 'Musica scritta per le tue immagini.',
    scoreText:
      'La sala di ripresa ospita archi e piccole orchestre: la colonna sonora si registra con musicisti veri, nello stesso studio in cui si mixa.',
    scoreCta: 'Vedi la registrazione',
    faqTitle: 'Domande frequenti.',
    masterKicker: 'academy',
    masterTitle: 'Vuoi imparare il sound design?',
    masterText:
      "Questa pagina è il servizio dello studio. Per studiarlo c'è il Master in Professional Production & Sound Design dell'Academy.",
    masterCta: 'Vai al Master',
    ctaTitle: 'Parlaci del tuo video.',
    ctaText:
      'Formato, durata, scadenza e dove andrà in onda. Aggiungi un link al montato, se puoi.',
  },
  podcast: {
    metaTitle:
      'Registrazione podcast e voice over a Bologna | Creative Hub Studio',
    metaDesc:
      'Cabina isolata con Neumann U87, fonico in regia, montaggio e master pronti da pubblicare.',
    kicker: 'Studio · Podcast & voice over',
    title: 'Registrare podcast e voice over a Bologna.',
    lede: 'Una cabina isolata con Neumann U87 e catena analogica, un fonico in regia, e il file pronto da pubblicare.',
    facts: [
      { t: 'Cabina isolata', s: 'nessun rumore, nessun riverbero' },
      { t: 'Neumann U87', s: 'il microfono da voce di riferimento' },
      { t: 'File pronto', s: 'montato, pulito e masterizzato' },
    ],
    book: 'Prenota la cabina',
    typesKicker: 'cosa registri',
    typesTitle: 'Podcast. Voice over. Audiolibri.',
    types: [
      {
        n: 'vo.01',
        title: 'Podcast',
        text: "Una o più voci, in studio o con ospiti collegati a distanza. Registriamo, montiamo e consegniamo l'episodio.",
      },
      {
        n: 'vo.02',
        title: 'Voice over',
        text: 'Speakeraggio per spot, video aziendali, documentari e social, in sincrono con le immagini.',
      },
      {
        n: 'vo.03',
        title: 'Audiolibri e doppiaggio',
        text: 'Sessioni lunghe di lettura e sincronizzazione delle voci su video.',
      },
    ],
    boothTitle: 'La cabina.',
    boothText1:
      'Isolata dal resto dello studio, con un Neumann U87 e una catena analogica vintage: la voce arriva pulita, piena, senza bisogno di correzioni.',
    boothText2:
      'Il fonico in regia ti segue in cuffia e ti vede dal vetro: se una frase non convince, la rifai subito.',
    prepTitle: 'Prima di venire.',
    prepLede: 'Una sessione va più veloce se arrivi con questo.',
    prep: [
      'Testo o scaletta stampati o su tablet',
      'Video di riferimento, se è un voice over',
      'Durata e formato che ti servono',
      "Una bottiglia d'acqua, niente latte prima",
      'Gli ospiti collegati avvisati per tempo',
      'Musica e sigla, se le hai già',
    ],
    faqTitle: 'Domande frequenti.',
    ctaTitle: 'Prenota la cabina.',
    ctaText: 'Dicci cosa registri, quante voci e per quando ti serve.',
  },
}

const EN = {
  atmos: {
    metaTitle: 'Dolby Atmos 7.1.4 studio in Bologna | Creative Hub Studio',
    metaDesc:
      'Immersive-audio mixing, remixing and post-production in a Dolby-certified control room with Genelec monitoring.',
    kicker: 'Studio · Dolby Atmos',
    title: 'A Dolby Atmos 7.1.4 studio in Bologna.',
    lede: 'A Dolby-certified control room for mixing music, film scores and immersive content: sounds no longer sit just left and right, but all around and above the listener.',
    facts: [
      { t: '7.1.4', s: 'seven speakers, one subwoofer, four overhead' },
      { t: 'Genelec', s: 'monitoring across the whole room' },
      { t: 'Dolby certification', s: 'for deliveries to labels and platforms' },
    ],
    book: 'Book an Atmos session',
    talk: "Let's talk",
    marquee: 'Music, film, media: in immersive audio',
    manifestoKicker: 'immersive audio',
    manifestoA: 'In immersive audio, sound is placed and moves through space.',
    manifestoB: "Listeners don't just hear a track: they're inside it.",
    roomKicker: 'the atmos room',
    room: [
      { t: '7.1.4', s: 'speaker configuration' },
      { t: 'Genelec', s: 'monitoring across the room' },
      { t: 'Avid MTRX', s: 'interface and routing' },
      { t: 'Dolby', s: 'official certification' },
    ],
    usesTitle: "What it's for.",
    usesLede: 'From records to installations.',
    uses: [
      {
        title: 'Music',
        text: 'Atmos mixes and remixes of new or released tracks',
      },
      {
        title: 'Film and series',
        text: 'Final delivery of scores in immersive audio',
      },
      {
        title: 'Media and installations',
        text: 'Post-production and sound design for museums, exhibitions, experiences',
      },
      {
        title: 'Gaming',
        text: 'Immersive audio for games and interactive content',
      },
    ],
    remixKicker: 'atmos remix',
    remixTitle: 'Is your track already out?',
    remixText:
      'We can remix it in Dolby Atmos from the original stems, for the platforms that support immersive audio.',
    remixCta: 'Ask for a remix',
    labKicker: 'research',
    labTitle: 'A permanent lab for Atmos.',
    labText:
      "The room is also the centre of Creative Hub's research on immersive audio, with pilot projects alongside companies and institutions.",
    labCta: 'Go to Innovation',
    faqTitle: 'Questions about Atmos.',
    ctaTitle: 'Tell us about your project.',
    ctaText:
      'Write to us about what you want to mix or deliver in Atmos. We get back to you Monday to Friday to talk it through and book the session.',
  },
  soundDesign: {
    metaTitle:
      'Sound design and audio post-production in Bologna | Creative Hub Studio',
    metaDesc:
      'Sound design, foley, original scores and Dolby Atmos mixing for film, series, advertising, games and installations.',
    kicker: 'Studio · Sound design',
    title: 'Sound design and audio post-production for video and film.',
    lede: 'From edit to master: sounds, foley, original scores and the final mix, in Dolby Atmos too. For film, series, advertising, games and installations.',
    facts: [
      { t: 'Post-production', s: 'dialogue, effects, ambiences' },
      { t: 'Foley and scores', s: 'recorded sounds and original music' },
      { t: 'Atmos delivery', s: 'or stereo, in the formats you need' },
    ],
    book: 'Tell us about your video',
    talk: "Let's talk",
    forTitle: 'Who we work for.',
    forLede: 'Every format has its own delivery rules. We know them.',
    clients: [
      {
        title: 'Film and series',
        text: 'Audio post-production and mixing for delivery',
      },
      {
        title: 'Advertising and video',
        text: 'Sound design and mixing for ads, brands and social',
      },
      {
        title: 'Games',
        text: 'Effects, ambiences and immersive audio',
      },
      {
        title: 'Installations',
        text: 'Sound for museums, exhibitions, experiences',
      },
    ],
    whatTitle: 'What we do.',
    what: [
      'Sound design: custom-made sounds and effects',
      'Foley: noises recorded in the studio in sync with the images',
      'Dialogue editing and clean-up',
      'Original scores, recorded with real musicians',
      'Final mix in stereo or Dolby Atmos',
      'Mastering and delivery in the required formats',
    ],
    stepsTitle: 'From edit to master.',
    steps: [
      {
        title: 'Spotting',
        text: 'We watch the edit together and decide where sounds, music and silences belong.',
      },
      {
        title: 'Sound design and foley',
        text: 'We create and record effects, ambiences and noises in sync.',
      },
      {
        title: 'Music',
        text: 'An original score, recorded in the studio, or an adaptation of the music you chose.',
      },
      {
        title: 'Mix',
        text: 'Dialogue, effects and music in balance, in stereo or in Dolby Atmos.',
      },
      {
        title: 'Delivery',
        text: 'Master and stems in the formats the platform or distributor requires.',
      },
    ],
    scoreKicker: 'scores',
    scoreTitle: 'Music written for your images.',
    scoreText:
      'The live room hosts strings and small orchestras: the score is recorded with real musicians, in the same studio where it gets mixed.',
    scoreCta: 'See recording',
    faqTitle: 'Frequently asked questions.',
    masterKicker: 'academy',
    masterTitle: 'Want to learn sound design?',
    masterText:
      "This page is the studio service. To study it, there's the Academy's Master in Professional Production & Sound Design.",
    masterCta: 'Go to the Master',
    ctaTitle: 'Tell us about your video.',
    ctaText:
      'Format, length, deadline and where it will air. Add a link to the edit, if you can.',
  },
  podcast: {
    metaTitle:
      'Podcast and voice-over recording in Bologna | Creative Hub Studio',
    metaDesc:
      'Isolated booth with a Neumann U87, an engineer in the control room, edit and master ready to publish.',
    kicker: 'Studio · Podcast & voice over',
    title: 'Recording podcasts and voice overs in Bologna.',
    lede: 'An isolated booth with a Neumann U87 and an analogue chain, an engineer in the control room, and a file ready to publish.',
    facts: [
      { t: 'Isolated booth', s: 'no noise, no reverb' },
      { t: 'Neumann U87', s: 'the reference vocal microphone' },
      { t: 'Ready file', s: 'edited, cleaned and mastered' },
    ],
    book: 'Book the booth',
    typesKicker: 'what you record',
    typesTitle: 'Podcasts. Voice overs. Audiobooks.',
    types: [
      {
        n: 'vo.01',
        title: 'Podcasts',
        text: 'One or more voices, in the studio or with remote guests. We record, edit and deliver the episode.',
      },
      {
        n: 'vo.02',
        title: 'Voice over',
        text: 'Voicing for ads, corporate videos, documentaries and social, in sync with the images.',
      },
      {
        n: 'vo.03',
        title: 'Audiobooks and dubbing',
        text: 'Long reading sessions and voice sync to picture.',
      },
    ],
    boothTitle: 'The booth.',
    boothText1:
      'Isolated from the rest of the studio, with a Neumann U87 and a vintage analogue chain: the voice comes through clean and full, with no fixing needed.',
    boothText2:
      "The engineer follows you in your headphones and sees you through the glass: if a line doesn't convince you, you redo it right away.",
    prepTitle: 'Before you come.',
    prepLede: 'A session goes faster if you arrive with this.',
    prep: [
      'Script or outline, printed or on a tablet',
      "A reference video, if it's a voice over",
      'The length and format you need',
      'A bottle of water, no milk beforehand',
      'Remote guests briefed in time',
      'Music and jingle, if you already have them',
    ],
    faqTitle: 'Frequently asked questions.',
    ctaTitle: 'Book the booth.',
    ctaText: "Tell us what you're recording, how many voices and when you need it.",
  },
}

function patch(file, additions) {
  const path = join(root, 'lib/i18n', file)
  const data = JSON.parse(readFileSync(path, 'utf8'))
  if (!data.studioSub) {
    throw new Error(`${file}: blocco studioSub mancante, non tocco niente`)
  }
  let added = 0
  for (const [key, value] of Object.entries(additions)) {
    if (data.studioSub[key] == null) {
      data.studioSub[key] = value
      added += 1
    }
  }
  if (added > 0) {
    writeFileSync(path, JSON.stringify(data, null, 2) + '\n')
  }
  console.log(`${file}: ${added} chiavi aggiunte${added === 0 ? ' (già a posto)' : ''}`)
}

patch('it.json', IT)
patch('en.json', EN)
