import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

/**
 * Backend unico dei form del sito (contatti, studio, open day).
 *
 * Contratto: POST JSON { form: string, subject?: string, fields: Record<string,string> }
 * Risposta:  { ok: boolean, error?: string, test?: boolean } — mai 500 non gestiti.
 *
 * Transport SS — SS_API_HOST/USER/PASS settati: lead nel gestionale
 *   ScuolaSemplice via POST {host}/api/createlead (Basic auth, body JSON
 *   [{type:'standard'|'custom', name|id, value}] — stesso contratto del
 *   plugin ufficiale scuolasemplice-contacts). Il gestionale fa upsert
 *   sull'email: stesso indirizzo → stesso lead aggiornato, mai duplicati.
 *   I multiselect vogliono la stringa dell'id opzione (l'array dà 500).
 * Transport A — WP_FORMS_ENDPOINT settato: inoltro all'endpoint REST di
 *   Contact Form 7 (…/wp-json/contact-form-7/v1/contact-forms/{id}/feedback)
 *   come multipart/form-data, mappando i campi standard your-*.
 *   Usato come fallback se ScuolaSemplice fallisce o non è configurato.
 * Transport B — senza env: log su console con prefisso [contact] e
 *   { ok: true, test: true } — ambiente di test, nessun invio reale.
 */

type ContactPayload = {
  form?: unknown
  subject?: unknown
  fields?: unknown
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

/* corpo leggibile: una riga "etichetta: valore" per campo */
function composeBody(
  form: string,
  subject: string | undefined,
  fields: Record<string, string>
): string {
  const rows = Object.entries(fields)
    .filter(([k, v]) => k !== '_hp' && v.trim() !== '')
    .map(([k, v]) => `${k}: ${v.trim()}`)
  const when = new Date().toLocaleString('it-IT', {
    timeZone: 'Europe/Rome',
    dateStyle: 'short',
    timeStyle: 'short',
  })
  const meta = [
    '—',
    `form: ${form}`,
    subject ? `oggetto: ${subject}` : '',
    fields.pagina ? `pagina: ${fields.pagina}` : '',
    `data: ${when}`,
  ].filter(Boolean)
  return [...rows, '', ...meta].join('\n')
}

/* ————— ScuolaSemplice: mappatura form → lead ————— */

type SSField =
  | { type: 'standard'; name: string; value: string }
  | { type: 'custom'; id: string; value: string }

/* id dei campi custom del gestionale (da /api/fetchcustomfields/students) */
const SS = {
  LEADTYPE: '9997', // 'lead' | 'student'
  CANALE: '524', // select — 159245 = "Sito/form"
  FONTE: '525', // testo libero
  INTERESSE: '420', // multiselect "Che cosa ti interessa?"
  OPENDAY: '380', // select — 159052 = "Iscritto"
} as const

const SS_CANALE_SITO = '159245'
const SS_INTERESSE = {
  uni: '159093', // Corsi Universitari
  hobby: '159092', // Corsi hobbistici
  rer: '159094', // Corsi RER (finanziati)
} as const
const SS_OPENDAY_ISCRITTO = '159052'

/* "Mario Rossi Verdi" → name/surname (surname è obbligatorio lato API) */
function splitName(full: string): { name: string; surname: string } {
  const parts = full.trim().split(/\s+/)
  if (parts.length < 2) return { name: full.trim() || '-', surname: '-' }
  return { name: parts[0], surname: parts.slice(1).join(' ') }
}

function buildLead(
  form: string,
  fields: Record<string, string>,
  email: string,
  body: string
): SSField[] {
  const { name, surname } = splitName(fields.nome ?? fields.name ?? '')
  const phone = (fields.cellulare ?? fields.telefono ?? '').trim()
  /* EventBuilder ha un campo "contatto" libero: email o telefono */
  const contatto = (fields.contatto ?? '').trim()
  const leadEmail = email || (EMAIL_RE.test(contatto) ? contatto : '')
  const leadPhone = phone || (EMAIL_RE.test(contatto) ? '' : contatto)

  const lead: SSField[] = [
    { type: 'standard', name: 'name', value: name },
    { type: 'standard', name: 'surname', value: surname },
    { type: 'standard', name: 'notes', value: body },
    { type: 'custom', id: SS.LEADTYPE, value: 'lead' },
    { type: 'custom', id: SS.CANALE, value: SS_CANALE_SITO },
    { type: 'custom', id: SS.FONTE, value: `sito — ${form}` },
  ]
  if (leadEmail) lead.push({ type: 'standard', name: 'email', value: leadEmail })
  if (leadPhone) lead.push({ type: 'standard', name: 'mobile', value: leadPhone })

  /* interesse/stato per i form che lo implicano */
  if (form === 'avvisami') {
    lead.push({ type: 'custom', id: SS.INTERESSE, value: SS_INTERESSE.rer })
  } else if (form === 'lezione') {
    lead.push({ type: 'custom', id: SS.INTERESSE, value: SS_INTERESSE.hobby })
  } else if (form === 'openday') {
    lead.push({ type: 'custom', id: SS.OPENDAY, value: SS_OPENDAY_ISCRITTO })
    const uni = /universitar/i.test(fields['open day'] ?? '')
    lead.push({
      type: 'custom',
      id: SS.INTERESSE,
      value: uni ? SS_INTERESSE.uni : SS_INTERESSE.hobby,
    })
  }
  return lead
}

/* ————— copia di consultazione in Sanity ("Richieste dai form") ————— */

async function saveToSanity(
  form: string,
  fields: Record<string, string>,
  email: string,
  body: string,
  syncedToCrm: boolean
): Promise<void> {
  const token = process.env.SANITY_WRITE_TOKEN
  if (!token) return
  const doc = {
    _type: 'formSubmission',
    form,
    name: (fields.nome ?? fields.name ?? '').trim(),
    email: email || (fields.contatto ?? '').trim(),
    phone: (fields.cellulare ?? fields.telefono ?? '').trim(),
    body,
    date: new Date().toISOString(),
    syncedToCrm,
  }
  try {
    const res = await fetch(
      'https://if3942oc.api.sanity.io/v2024-01-01/data/mutate/production',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mutations: [{ create: doc }] }),
        signal: AbortSignal.timeout(8_000),
      }
    )
    if (!res.ok) console.error('[contact] archivio Sanity HTTP', res.status)
  } catch (err) {
    /* l'archivio è una copia: un suo errore non deve mai bloccare l'invio */
    console.error('[contact] archivio Sanity fallito:', err)
  }
}

async function sendToScuolaSemplice(lead: SSField[]): Promise<boolean> {
  const host = process.env.SS_API_HOST
  const user = process.env.SS_API_USER
  const pass = process.env.SS_API_PASS
  if (!host || !user || !pass) return false
  try {
    const res = await fetch(`${host.replace(/\/$/, '')}/api/createlead`, {
      method: 'POST',
      headers: {
        /* la password può contenere non-ASCII (es. £): btoa non basta */
        authorization:
          'Basic ' + Buffer.from(`${user}:${pass}`, 'utf8').toString('base64'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(lead),
      signal: AbortSignal.timeout(10_000),
    })
    if (!res.ok) {
      console.error('[contact] ScuolaSemplice HTTP', res.status)
      return false
    }
    const data = (await res.json()) as { success?: number; id?: number; error?: string }
    if (data.success === 1) return true
    console.error('[contact] ScuolaSemplice ha rifiutato il lead:', data.error)
    return false
  } catch (err) {
    console.error('[contact] invio ScuolaSemplice fallito:', err)
    return false
  }
}

export async function POST(req: Request) {
  try {
    let payload: ContactPayload
    try {
      payload = (await req.json()) as ContactPayload
    } catch {
      return NextResponse.json(
        { ok: false, error: 'JSON non valido.' },
        { status: 400 }
      )
    }

    const form = typeof payload.form === 'string' ? payload.form.trim() : ''
    const subject =
      typeof payload.subject === 'string' && payload.subject.trim()
        ? payload.subject.trim()
        : undefined

    /* fields: oggetto non vuoto di stringhe */
    const raw = payload.fields
    if (!form || !raw || typeof raw !== 'object' || Array.isArray(raw)) {
      return NextResponse.json(
        { ok: false, error: 'Richiesta incompleta.' },
        { status: 400 }
      )
    }
    const fields: Record<string, string> = {}
    for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
      if (typeof v === 'string') fields[k] = v
    }
    const hasContent = Object.entries(fields).some(
      ([k, v]) => k !== '_hp' && v.trim() !== ''
    )
    if (!hasContent) {
      return NextResponse.json(
        { ok: false, error: 'Nessun campo compilato.' },
        { status: 400 }
      )
    }

    /* honeypot: i bot lo compilano, le persone no — ok silenzioso */
    if (fields._hp && fields._hp.trim() !== '') {
      return NextResponse.json({ ok: true })
    }

    /* email, se presente, ben formata */
    const email = (fields.email ?? '').trim()
    if (email && !EMAIL_RE.test(email)) {
      return NextResponse.json(
        { ok: false, error: 'Indirizzo email non valido.' },
        { status: 400 }
      )
    }

    const body = composeBody(form, subject, fields)
    const endpoint = process.env.WP_FORMS_ENDPOINT

    /* ————— Transport SS: lead nel gestionale ScuolaSemplice ————— */
    if (process.env.SS_API_HOST) {
      const sent = await sendToScuolaSemplice(buildLead(form, fields, email, body))
      /* copia di consultazione nel CMS ("Richieste dai form"), sempre */
      await saveToSanity(form, fields, email, body, sent)
      if (sent) return NextResponse.json({ ok: true })
      /* fallisce → si tenta CF7 se configurato, altrimenti errore onesto */
      if (!endpoint) {
        return NextResponse.json(
          { ok: false, error: 'Invio non riuscito. Riprova tra poco.' },
          { status: 502 }
        )
      }
    }

    /* ————— Transport B: nessun endpoint → log di test ————— */
    if (!endpoint) {
      console.log(`[contact] form=${form}\n${body}`)
      return NextResponse.json({ ok: true, test: true })
    }

    /* ————— Transport A: inoltro a Contact Form 7 ————— */
    const name = (fields.nome ?? '').trim()
    const phone = (fields.telefono ?? fields.cellulare ?? '').trim()

    const fd = new FormData()
    fd.set('your-name', name)
    fd.set('your-email', email)
    fd.set('your-phone', phone)
    fd.set('your-subject', subject ?? form)
    fd.set('your-message', body)
    /* unit tag: CF7 lo pretende su alcune versioni — ricavato dall'id
       del form presente nell'URL dell'endpoint */
    const idMatch = endpoint.match(/contact-forms\/(\d+)\//)
    if (idMatch) fd.set('_wpcf7_unit_tag', `wpcf7-f${idMatch[1]}-o1`)

    let res: Response
    try {
      res = await fetch(endpoint, {
        method: 'POST',
        body: fd,
        signal: AbortSignal.timeout(10_000),
      })
    } catch (err) {
      const timeout = err instanceof Error && err.name === 'TimeoutError'
      console.error('[contact] inoltro CF7 fallito:', err)
      return NextResponse.json(
        {
          ok: false,
          error: timeout
            ? 'Il server di posta non risponde. Riprova tra poco.'
            : 'Invio non riuscito. Riprova tra poco.',
        },
        { status: 502 }
      )
    }

    let cf7: { status?: string; message?: string } = {}
    try {
      cf7 = (await res.json()) as { status?: string; message?: string }
    } catch {
      /* risposta non-JSON (es. HTML di errore): gestita sotto */
    }

    if (res.ok && cf7.status === 'mail_sent') {
      return NextResponse.json({ ok: true })
    }

    console.error('[contact] CF7 ha risposto', res.status, cf7)
    return NextResponse.json(
      {
        ok: false,
        error:
          cf7.message ||
          (cf7.status === 'validation_failed'
            ? 'Alcuni campi non sono validi.'
            : 'Invio non riuscito. Riprova tra poco.'),
      },
      { status: 502 }
    )
  } catch (err) {
    /* rete di sicurezza: qualunque imprevisto resta una risposta pulita */
    console.error('[contact] errore non previsto:', err)
    return NextResponse.json(
      { ok: false, error: 'Errore interno. Riprova tra poco.' },
      { status: 500 }
    )
  }
}
