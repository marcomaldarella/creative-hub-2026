import type { Metadata } from 'next'
import type { Locale } from '@/lib/i18n/config'
import styles from './LegalPage.module.css'

type Kind = 'privacy' | 'cookie' | 'trasparenza'

type Section = { h: string; p: string[] }
type Doc = { title: string; updated: string; sections: Section[] }

/* Testi base conformi alla struttura standard GDPR/trasparenza; i punti
   segnati [da integrare] vanno completati dal titolare con i dati mancanti
   (P.IVA, eventuale DPO, elenco analitico dei cookie di terze parti). */
const DOCS: Record<Kind, Record<Locale, Doc>> = {
  privacy: {
    it: {
      title: 'Privacy policy',
      updated: 'ultimo aggiornamento: luglio 2026',
      sections: [
        {
          h: 'Titolare del trattamento',
          p: [
            'Creative Hub Bologna — via del Tappezziere 4, 40138 Bologna. Email: hello@bologna-creativehub.it · PEC: creatibo@pec.it · Tel: +39 051 6313706. [da integrare: ragione sociale completa e P.IVA]',
          ],
        },
        {
          h: 'Dati trattati e finalità',
          p: [
            'Trattiamo i dati che ci fornisci volontariamente (richieste via email o telefono, iscrizioni a corsi ed eventi, prenotazioni degli spazi) per rispondere alle richieste, erogare i servizi e adempiere agli obblighi di legge e contabili.',
            'I dati di navigazione (indirizzi IP, log tecnici) sono trattati per il funzionamento e la sicurezza del sito, sulla base del legittimo interesse del titolare.',
          ],
        },
        {
          h: 'Base giuridica e conservazione',
          p: [
            "Le basi giuridiche sono l'esecuzione di misure contrattuali o precontrattuali, gli obblighi di legge e, dove richiesto, il consenso. I dati sono conservati per il tempo necessario alle finalità indicate e nei termini previsti dalla normativa fiscale e civilistica.",
          ],
        },
        {
          h: 'Diritti degli interessati',
          p: [
            'Puoi esercitare in ogni momento i diritti previsti dagli artt. 15-22 del GDPR (accesso, rettifica, cancellazione, limitazione, portabilità, opposizione) scrivendo a hello@bologna-creativehub.it. Hai inoltre diritto di reclamo al Garante per la protezione dei dati personali.',
          ],
        },
        {
          h: 'Destinatari',
          p: [
            'I dati possono essere trattati da fornitori tecnici che agiscono come responsabili del trattamento (hosting, piattaforma e-commerce per prenotazioni e acquisti, servizi email). Non vendiamo dati a terzi.',
          ],
        },
      ],
    },
    en: {
      title: 'Privacy policy',
      updated: 'last updated: July 2026',
      sections: [
        {
          h: 'Data controller',
          p: [
            'Creative Hub Bologna — via del Tappezziere 4, 40138 Bologna, Italy. Email: hello@bologna-creativehub.it · Certified email: creatibo@pec.it · Phone: +39 051 6313706. [to be completed: full company name and VAT number]',
          ],
        },
        {
          h: 'Data we process and purposes',
          p: [
            'We process the data you provide voluntarily (email or phone enquiries, course and event registrations, space bookings) to answer requests, deliver services and comply with legal and accounting obligations.',
            'Browsing data (IP addresses, technical logs) is processed for the operation and security of the site, based on the legitimate interest of the controller.',
          ],
        },
        {
          h: 'Legal basis and retention',
          p: [
            'Legal bases are the performance of contractual or pre-contractual measures, legal obligations and, where required, consent. Data is kept for the time necessary for the stated purposes and within the terms required by tax and civil law.',
          ],
        },
        {
          h: 'Your rights',
          p: [
            'You can exercise the rights under articles 15-22 GDPR (access, rectification, erasure, restriction, portability, objection) at any time by writing to hello@bologna-creativehub.it. You also have the right to lodge a complaint with the Italian supervisory authority (Garante).',
          ],
        },
        {
          h: 'Recipients',
          p: [
            'Data may be processed by technical providers acting as processors (hosting, e-commerce platform for bookings and purchases, email services). We do not sell data to third parties.',
          ],
        },
      ],
    },
  },
  cookie: {
    it: {
      title: 'Cookie policy',
      updated: 'ultimo aggiornamento: luglio 2026',
      sections: [
        {
          h: 'Cosa sono i cookie',
          p: [
            'I cookie sono piccoli file di testo che i siti salvano sul tuo dispositivo. Questo sito utilizza esclusivamente cookie e tecnologie assimilate di tipo tecnico, necessari al funzionamento.',
          ],
        },
        {
          h: 'Cookie utilizzati da questo sito',
          p: [
            'Preferenza tema (localStorage "theme"): ricorda la scelta light/dark. Chiusura avvisi (sessionStorage "topbar"): ricorda la chiusura della barra annunci per la sessione. Nessuno di questi identifica la persona né viene condiviso con terzi.',
            'Il sito non utilizza cookie di profilazione né strumenti di analytics di terze parti. [da integrare se in futuro si aggiungono: elenco analitico, durata e finalità di ciascun cookie di terze parti]',
          ],
        },
        {
          h: 'Servizi esterni collegati',
          p: [
            "I link verso lo shop (WooCommerce), Bandcamp, Instagram, Facebook, LinkedIn e YouTube portano a siti di terzi con proprie informative: ti invitiamo a consultarle. L'apertura di quei siti può comportare l'installazione di cookie da parte loro.",
          ],
        },
        {
          h: 'Gestione',
          p: [
            'Puoi eliminare i dati salvati in qualunque momento dalle impostazioni del browser (cancellazione dati di navigazione del sito).',
          ],
        },
      ],
    },
    en: {
      title: 'Cookie policy',
      updated: 'last updated: July 2026',
      sections: [
        {
          h: 'What cookies are',
          p: [
            'Cookies are small text files that websites store on your device. This site only uses technical cookies and similar technologies, which are necessary for it to work.',
          ],
        },
        {
          h: 'Cookies used by this site',
          p: [
            'Theme preference (localStorage "theme"): remembers your light/dark choice. Notice dismissal (sessionStorage "topbar"): remembers that you closed the announcement bar for the session. Neither identifies you nor is shared with third parties.',
            'The site uses no profiling cookies and no third-party analytics. [to be completed if added in the future: analytical list, duration and purpose of each third-party cookie]',
          ],
        },
        {
          h: 'Linked external services',
          p: [
            'Links to the shop (WooCommerce), Bandcamp, Instagram, Facebook, LinkedIn and YouTube lead to third-party sites with their own policies: please review them. Opening those sites may result in cookies being set by them.',
          ],
        },
        {
          h: 'Management',
          p: [
            'You can delete stored data at any time from your browser settings (clear site data).',
          ],
        },
      ],
    },
  },
  trasparenza: {
    it: {
      title: 'Trasparenza',
      updated: 'ultimo aggiornamento: luglio 2026',
      sections: [
        {
          h: 'Finanziamenti pubblici',
          p: [
            'Il progetto Creative Hub è cofinanziato dalla Regione Emilia-Romagna nell’ambito del Programma Regionale Attività Produttive (DGR n. 1357/2020 e DGR n. 1726/2020), come Centro Polifunzionale della filiera Cultura e Creatività in Emilia-Romagna.',
          ],
        },
        {
          h: 'Partner istituzionali',
          p: [
            'Regione Emilia-Romagna, Comune di Bologna, Università di Bologna (CRICC), CNR Tecnopolo Bologna, CREATE (cluster regionale).',
          ],
        },
        {
          h: 'Obblighi di pubblicazione',
          p: [
            'Ai sensi della L. 124/2017 (obblighi di trasparenza sulle erogazioni pubbliche), gli importi ricevuti sono pubblicati nella Nota integrativa del bilancio depositato e/o sul Registro Nazionale degli Aiuti di Stato. [da integrare: dettaglio importi ed esercizi]',
          ],
        },
      ],
    },
    en: {
      title: 'Transparency',
      updated: 'last updated: July 2026',
      sections: [
        {
          h: 'Public funding',
          p: [
            'The Creative Hub project is co-financed by the Emilia-Romagna Region under the Regional Programme for Productive Activities (DGR no. 1357/2020 and DGR no. 1726/2020), as a multifunctional centre for the culture and creativity sector in Emilia-Romagna.',
          ],
        },
        {
          h: 'Institutional partners',
          p: [
            'Emilia-Romagna Region, Municipality of Bologna, University of Bologna (CRICC), CNR Tecnopolo Bologna, CREATE (regional cluster).',
          ],
        },
        {
          h: 'Publication obligations',
          p: [
            'Pursuant to Italian Law 124/2017 (transparency obligations on public grants), the amounts received are published in the notes to the filed financial statements and/or in the National State Aid Register. [to be completed: amounts and financial years]',
          ],
        },
      ],
    },
  },
}

export function legalMeta(locale: string, kind: Kind): Metadata {
  const doc = DOCS[kind][(locale === 'en' ? 'en' : 'it') as Locale]
  return { title: doc.title.toLowerCase(), robots: { index: true } }
}

export function LegalPage({ locale, kind }: { locale: Locale; kind: Kind }) {
  const doc = DOCS[kind][locale]
  return (
    <main className={`wrap ${styles.main}`}>
      <span className={`mono ${styles.updated}`}>{doc.updated}</span>
      <h1 className={`display-thin ${styles.title}`}>{doc.title}</h1>
      {doc.sections.map((s) => (
        <section key={s.h} className={styles.sez}>
          <h2 className={styles.h}>{s.h}</h2>
          {s.p.map((par, i) => (
            <p key={i} className={styles.p}>
              {par}
            </p>
          ))}
        </section>
      ))}
    </main>
  )
}
