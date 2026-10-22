import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

/**
 * Backend unico dei form del sito (contatti, studio, open day).
 *
 * Contratto: POST JSON { form: string, subject?: string, fields: Record<string,string> }
 * Risposta:  { ok: boolean, error?: string, test?: boolean } — mai 500 non gestiti.
 *
 * Transport A — WP_FORMS_ENDPOINT settato: inoltro all'endpoint REST di
 *   Contact Form 7 (…/wp-json/contact-form-7/v1/contact-forms/{id}/feedback)
 *   come multipart/form-data, mappando i campi standard your-*.
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
