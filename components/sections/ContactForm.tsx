'use client'

import { useState, type FormEvent } from 'react'
import { usePathname } from 'next/navigation'
import styles from './ContactForm.module.css'

export type ContactFormLabels = {
  name: string
  phone: string
  email: string
  company: string
  companyNote: string
  topic: string
  message: string
  messagePlaceholder: string
  send: string
  privacyBefore: string
  privacyLink: string
  missing: string
  sent: string
  sendError: string
}

/**
 * Il form di contatto dei mockup (ott 2026): campi a due colonne,
 * tema a tendina preselezionabile. Da ott 2026 l'invio è vero: POST a
 * /api/contact (che inoltra a Contact Form 7 o logga in test), con
 * honeypot nascosto, stato pending sul bottone e messaggi di esito.
 * Vive dentro le chiusure scure: tutti i colori passano dai token
 * (--fg/--bg/--line), quindi la stessa UI regge su nero, arancio e bianco.
 */
export function ContactForm({
  subject,
  topics,
  defaultTopic,
  labels,
  privacyHref,
  company = true,
  sendLabel,
}: {
  /** indirizzo mostrato nelle colonne recapiti delle pagine: qui non serve
      più (l'invio passa da /api/contact), resta accettato per i call site */
  to?: string
  /** subject fisso; il tema scelto viene accodato */
  subject: string
  /** opzioni di "Di cosa vuoi parlare?" */
  topics: string[]
  defaultTopic?: string
  labels: ContactFormLabels
  privacyHref: string
  /** false per nascondere il campo azienda (es. open day) */
  company?: boolean
  /** override del testo del bottone (es. "Avvisami") */
  sendLabel?: string
}) {
  const pathname = usePathname()
  const [topic, setTopic] = useState(defaultTopic ?? topics[0] ?? '')
  const [status, setStatus] = useState<
    'idle' | 'pending' | 'sent' | 'error'
  >('idle')
  const [missing, setMissing] = useState(false)

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (status === 'pending') return
    const f = new FormData(e.currentTarget)
    const name = String(f.get('name') ?? '').trim()
    const phone = String(f.get('phone') ?? '').trim()
    const email = String(f.get('email') ?? '').trim()
    /* come nei mockup: servono nome ed email — il telefono è un di più.
       L'email va anche controllata qui, o parte un POST che il server
       rifiuta e l'utente legge un errore di invio invece che di campo */
    if (!name || !email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setMissing(true)
      return
    }
    setMissing(false)
    setStatus('pending')
    const fields: Record<string, string> = {
      nome: name,
      telefono: phone,
      email,
      tema: topic,
      messaggio: String(f.get('message') ?? '').trim(),
      pagina: pathname,
      _hp: String(f.get('_hp') ?? ''),
    }
    if (company) {
      fields.azienda = String(f.get('company') ?? '').trim()
    }
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          form: 'contact',
          subject: `${subject} — ${topic}`,
          fields,
        }),
      })
      const data = (await res.json()) as { ok?: boolean }
      setStatus(data.ok ? 'sent' : 'error')
    } catch {
      setStatus('error')
    }
  }

  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate>
      <div className={styles.grid}>
        <label className={styles.field}>
          <span className={styles.label}>{labels.name}</span>
          <input className={styles.input} type="text" name="name" required />
        </label>
        <label className={styles.field}>
          <span className={styles.label}>{labels.phone}</span>
          <input className={styles.input} type="tel" name="phone" />
        </label>
        <label className={styles.field}>
          <span className={styles.label}>{labels.email}</span>
          <input className={styles.input} type="email" name="email" required />
        </label>
        {company && (
          <label className={styles.field}>
            <span className={styles.label}>
              {labels.company}{' '}
              <span className={styles.note}>{labels.companyNote}</span>
            </span>
            <input className={styles.input} type="text" name="company" />
          </label>
        )}
      </div>

      <label className={styles.field}>
        <span className={styles.label}>{labels.topic}</span>
        <span className={styles.selectBox}>
          <select
            className={styles.select}
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          >
            {topics.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
          {/* chevron disegnato: mai glifi */}
          <svg
            viewBox="0 0 16 16"
            width="12"
            height="12"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="M3 6l5 5 5-5" />
          </svg>
        </span>
      </label>

      <label className={styles.field}>
        <span className={styles.label}>{labels.message}</span>
        <textarea
          className={styles.area}
          name="message"
          rows={4}
          placeholder={labels.messagePlaceholder}
        />
      </label>

      {/* honeypot: invisibile alle persone, compilato dai bot */}
      <label className={styles.hp} aria-hidden="true">
        <span>Lascia vuoto questo campo</span>
        <input type="text" name="_hp" tabIndex={-1} autoComplete="off" />
      </label>

      {missing && <p className={styles.error}>{labels.missing}</p>}

      <button
        type="submit"
        className={styles.send}
        disabled={status === 'pending'}
      >
        {sendLabel ?? labels.send}
      </button>

      {status === 'error' && (
        <p className={styles.error} role="alert">
          {labels.sendError}
        </p>
      )}

      <p className={styles.privacy}>
        {status === 'sent' ? (
          <span role="status">{labels.sent}</span>
        ) : (
          <>
            {labels.privacyBefore}{' '}
            <a href={privacyHref}>{labels.privacyLink}</a>.
          </>
        )}
      </p>
    </form>
  )
}
