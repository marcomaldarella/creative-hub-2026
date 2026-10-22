'use client'

import { useState, type FormEvent } from 'react'
import Link from 'next/link'
import type { Dictionary } from '@/lib/i18n/dictionaries'
import styles from './AvvisamiForm.module.css'

export type AvvisamiLabels = Dictionary['avvisami']

/**
 * "Avvisami al prossimo bando" (formazione finanziata): le iscrizioni ai
 * corsi finanziati aprono a bando e restano aperte poche settimane, quindi
 * la conversione è lasciare un contatto, non iscriversi. Colonna sinistra
 * con i recapiti dei corsi finanziati, a destra il form: aree di interesse,
 * contatti, residenza in Emilia-Romagna. POST a /api/contact, stati
 * pending/ok/errore gestiti qui (stessa grammatica di ContactForm).
 */
export function AvvisamiForm({
  labels,
  privacyHref,
  title,
  lede,
}: {
  labels: AvvisamiLabels
  privacyHref: string
  /** override del titolo (es. "Avvisami alla prossima edizione.") */
  title?: string
  lede?: string
}) {
  const [interests, setInterests] = useState<string[]>([])
  const [status, setStatus] = useState<'idle' | 'pending' | 'ok' | 'error'>(
    'idle'
  )
  const [missing, setMissing] = useState(false)

  const toggle = (v: string) =>
    setInterests((cur) =>
      cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v]
    )

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (status === 'pending' || status === 'ok') return
    const f = new FormData(e.currentTarget)
    const nome = String(f.get('nome') ?? '').trim()
    const email = String(f.get('email') ?? '').trim()
    const cellulare = String(f.get('cellulare') ?? '').trim()
    if (!nome || !email) {
      setMissing(true)
      return
    }
    setMissing(false)
    setStatus('pending')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          form: 'avvisami',
          subject: 'Avvisami corsi finanziati',
          fields: {
            interessi: interests.join(', '),
            nome,
            email,
            cellulare,
            residenzaER: f.get('residenzaER') ? 'Sì' : 'No',
          },
        }),
      })
      if (!res.ok) throw new Error(String(res.status))
      setStatus('ok')
    } catch {
      setStatus('error')
    }
  }

  return (
    <div className={styles.box}>
      <span className={`mono ${styles.kicker}`}>{labels.kicker}</span>
      <h2 className={`display-thin ${styles.title}`}>
        {title ?? labels.title}
      </h2>
      <p className={styles.lede}>{lede ?? labels.lede}</p>

      <div className={styles.grid}>
        {/* ————— recapiti dei corsi finanziati ————— */}
        <div className={styles.contacts}>
          {labels.contacts.map((c) => (
            <div key={c.value} className={styles.contact}>
              <span className={styles.contactValue}>{c.value}</span>
              {c.note && <span className={styles.contactNote}>{c.note}</span>}
            </div>
          ))}
        </div>

        {/* ————— form ————— */}
        <form className={styles.form} onSubmit={onSubmit} noValidate>
          <fieldset className={styles.set}>
            <legend className={styles.legend}>{labels.interestsLegend}</legend>
            <div className={styles.options}>
              {labels.interests.map((o) => (
                <label
                  key={o}
                  className={
                    interests.includes(o)
                      ? `${styles.opt} ${styles.on}`
                      : styles.opt
                  }
                >
                  <input
                    type="checkbox"
                    checked={interests.includes(o)}
                    onChange={() => toggle(o)}
                    className={styles.srIn}
                  />
                  <span className={styles.mark} aria-hidden="true" />
                  <span>{o}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className={styles.fields}>
            <label className={styles.field}>
              <span className={styles.label}>{labels.name}</span>
              <input className={styles.input} type="text" name="nome" required />
            </label>
            <label className={styles.field}>
              <span className={styles.label}>{labels.email}</span>
              <input className={styles.input} type="email" name="email" required />
            </label>
            <label className={styles.field}>
              <span className={styles.label}>{labels.phone}</span>
              <input className={styles.input} type="tel" name="cellulare" />
            </label>
          </div>

          <label className={styles.residence}>
            <input type="checkbox" name="residenzaER" className={styles.check} />
            <span>
              {labels.residence} <strong>{labels.residenceYes}</strong>
            </span>
          </label>

          {missing && <p className={styles.error}>{labels.missing}</p>}
          {status === 'error' && <p className={styles.error}>{labels.error}</p>}

          {status === 'ok' ? (
            <p className={styles.done} role="status">
              {labels.done}
            </p>
          ) : (
            <button
              type="submit"
              className={styles.send}
              disabled={status === 'pending'}
            >
              {status === 'pending' ? labels.sending : labels.submit}
            </button>
          )}

          <p className={styles.note}>
            {labels.notePrefix}
            <Link href={privacyHref}>{labels.noteLink}</Link>
            {labels.noteSuffix}
          </p>
        </form>
      </div>
    </div>
  )
}
