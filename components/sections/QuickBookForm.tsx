'use client'

import { useState, type FormEvent } from 'react'
import Link from 'next/link'
import styles from './QuickBookForm.module.css'

export type QuickBookLabels = {
  from: string
  name: string
  phone: string
  submit: string
  sending: string
  note: string
  done: string
  missing: string
  error: string
  more: string
  hp: string
}

/* richiesta rapida del riquadro coworking (mockup index.html): tre campi
   e via. Chi vuole scegliere la formula con calma passa dal percorso
   guidato, che resta linkato sotto */
export function QuickBookForm({
  labels,
  subject,
  moreHref,
  privacyHref,
  options,
  optionsLabel,
}: {
  labels: QuickBookLabels
  subject: string
  moreHref: string
  privacyHref?: string
  /** formule scegliibili: nome, riga piccola e prezzo */
  options?: { name: string; hint?: string; price: string }[]
  optionsLabel?: string
}) {
  const [formula, setFormula] = useState(options?.[0]?.name ?? '')
  const [status, setStatus] = useState<'idle' | 'pending' | 'sent' | 'error'>(
    'idle',
  )
  const [missing, setMissing] = useState(false)

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (status === 'pending') return
    const f = new FormData(e.currentTarget)
    const nome = String(f.get('nome') ?? '').trim()
    const cellulare = String(f.get('cellulare') ?? '').trim()
    if (!nome || !cellulare) {
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
          form: 'booking',
          subject,
          fields: {
            ...(formula ? { formula } : {}),
            'da quando': String(f.get('da') ?? ''),
            nome,
            cellulare,
            _hp: String(f.get('_hp') ?? ''),
          },
        }),
      })
      const data = (await res.json()) as { ok?: boolean }
      setStatus(data.ok ? 'sent' : 'error')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'sent') {
    return (
      <p className={styles.done} role="status">
        {labels.done}
      </p>
    )
  }

  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate>
      {/* le formule si scelgono: riga cliccabile, quella attiva si
          accende (richiesta cliente) */}
      {options && options.length > 0 && (
        <fieldset className={styles.set}>
          {optionsLabel && (
            <legend className={styles.legend}>{optionsLabel}</legend>
          )}
          <div className={styles.opts}>
            {options.map((o) => (
              <label
                key={o.name}
                className={`${styles.opt} ${
                  formula === o.name ? styles.optOn : ''
                }`}
              >
                <input
                  type="radio"
                  name="formula"
                  className={styles.sr}
                  checked={formula === o.name}
                  onChange={() => setFormula(o.name)}
                />
                <span className={styles.optName}>
                  {o.name}
                  {o.hint && <em className={styles.optHint}>{o.hint}</em>}
                </span>
                <span className={`mono ${styles.optPrice}`}>{o.price}</span>
              </label>
            ))}
          </div>
        </fieldset>
      )}
      <label className={styles.field}>
        <span className={styles.label}>{labels.from}</span>
        <input className={styles.input} type="date" name="da" />
      </label>
      <label className={styles.field}>
        <span className={styles.label}>{labels.name}</span>
        <input
          className={styles.input}
          type="text"
          name="nome"
          autoComplete="name"
          required
          aria-required="true"
          aria-invalid={missing || undefined}
        />
      </label>
      <label className={styles.field}>
        <span className={styles.label}>{labels.phone}</span>
        <input
          className={styles.input}
          type="tel"
          name="cellulare"
          inputMode="tel"
          autoComplete="tel"
          required
          aria-required="true"
          aria-invalid={missing || undefined}
        />
      </label>
      <label className={styles.hp} aria-hidden="true">
        {labels.hp}
        <input type="text" name="_hp" tabIndex={-1} autoComplete="off" />
      </label>
      <button
        className={styles.submit}
        type="submit"
        disabled={status === 'pending'}
      >
        {status === 'pending' ? labels.sending : labels.submit}
      </button>
      {missing && <p className={styles.error}>{labels.missing}</p>}
      {status === 'error' && <p className={styles.error}>{labels.error}</p>}
      <p className={styles.note}>
        {labels.note}{' '}
        <Link className={styles.more} href={moreHref}>
          {labels.more}
        </Link>
        {privacyHref ? '' : ''}
      </p>
    </form>
  )
}
