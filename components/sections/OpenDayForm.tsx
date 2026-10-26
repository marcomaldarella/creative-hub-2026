'use client'

import { useEffect, useState, type FormEvent } from 'react'
import Link from 'next/link'
import type { Dictionary } from '@/lib/i18n/dictionaries'
import styles from './OpenDayForm.module.css'

export type OpenDayFormLabels = Dictionary['openDay']['book']['form']

type OpenDayPick = 'uni' | 'custom'

/**
 * Prenotazione open day — da ott 2026 l'invio è vero: POST a /api/contact
 * (che inoltra a Contact Form 7 o logga in test), con honeypot nascosto e
 * stati pending/inviato/errore. La scelta dell'open day arriva
 * preselezionata dalle CTA di sezione via hash (#prenota-uni /
 * #prenota-lezioni): lo scroll lo fanno gli span-ancora della pagina,
 * qui si legge solo l'hash e si accende la radio giusta.
 */
export function OpenDayForm({
  labels,
  privacyHref,
}: {
  labels: OpenDayFormLabels
  /** ex destinatario del mailto: non serve più, resta accettato */
  to?: string
  privacyHref: string
}) {
  const [pick, setPick] = useState<OpenDayPick | null>(null)
  /* nel mockup nessun gruppo parte scelto: modalità e numero di
     persone sono domande, non valori di default da far passare */
  const [mode, setMode] = useState<'sede' | 'online' | null>(null)
  const [people, setPeople] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [hp, setHp] = useState('')
  /* la validazione parte solo dopo il primo tentativo di invio:
     niente rosso su un form ancora vuoto */
  const [tried, setTried] = useState(false)
  const [status, setStatus] = useState<
    'idle' | 'pending' | 'sent' | 'error'
  >('idle')

  useEffect(() => {
    const read = () => {
      if (location.hash === '#prenota-uni') setPick('uni')
      else if (location.hash === '#prenota-lezioni') setPick('custom')
    }
    read()
    addEventListener('hashchange', read)
    return () => removeEventListener('hashchange', read)
  }, [])

  const errPick = tried && !pick
  const errMode = tried && !mode
  const errPeople = tried && !people
  const errName = tried && !name.trim()
  const errPhone = tried && !phone.trim()

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setTried(true)
    if (status === 'pending') return
    if (!pick || !mode || !people || !name.trim() || !phone.trim()) return

    const pickLabel = pick === 'uni' ? labels.optionUni : labels.optionCustom
    setStatus('pending')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          form: 'openday',
          subject: `${labels.subject} — ${pickLabel}`,
          /* chiavi fisse in italiano: diventano le righe dell'email */
          fields: {
            'open day': pickLabel,
            modalità: mode === 'sede' ? labels.inPerson : labels.online,
            persone: people ?? '',
            nome: name.trim(),
            cellulare: phone.trim(),
            email: email.trim(),
            _hp: hp,
          },
        }),
      })
      const data = (await res.json()) as { ok?: boolean }
      setStatus(data.ok ? 'sent' : 'error')
    } catch {
      setStatus('error')
    }
  }

  /* radio custom: input vero ma invisibile (sr-only) + riga stilizzata,
     lo stato selezionato lo porta la classe (componente controllato) */
  const radio = (
    group: string,
    value: string,
    checked: boolean,
    onPick: () => void,
    label: string,
    error?: boolean
  ) => (
    <label
      key={value}
      className={[
        styles.opt,
        checked ? styles.on : '',
        error ? styles.errLine : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <input
        type="radio"
        name={group}
        value={value}
        checked={checked}
        onChange={onPick}
        className={styles.srIn}
        required
      />
      <span className={styles.dot} aria-hidden="true" />
      <span>{label}</span>
    </label>
  )

  return (
    <form className={styles.card} onSubmit={onSubmit} noValidate>
      <fieldset className={styles.set}>
        <legend className={styles.legend}>{labels.whichLegend}</legend>
        <div className={styles.col}>
          {radio('od-pick', 'uni', pick === 'uni', () => setPick('uni'), labels.optionUni, errPick)}
          {radio('od-pick', 'custom', pick === 'custom', () => setPick('custom'), labels.optionCustom, errPick)}
        </div>
      </fieldset>

      <fieldset className={styles.set}>
        <legend className={styles.legend}>{labels.howLegend}</legend>
        <div className={styles.row2}>
          {radio('od-mode', 'sede', mode === 'sede', () => setMode('sede'), labels.inPerson, errMode)}
          {radio('od-mode', 'online', mode === 'online', () => setMode('online'), labels.online, errMode)}
        </div>
      </fieldset>

      <fieldset className={styles.set}>
        <legend className={styles.legend}>{labels.peopleLegend}</legend>
        <div className={styles.row3}>
          {labels.people.map((p) =>
            radio('od-people', p, people === p, () => setPeople(p), p, errPeople)
          )}
        </div>
      </fieldset>

      <div className={styles.fields}>
        <label className={styles.field}>
          <span className={styles.fieldLabel}>{labels.nameLabel}</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            required
            className={errName ? styles.errIn : undefined}
          />
        </label>
        <label className={styles.field}>
          <span className={styles.fieldLabel}>{labels.phoneLabel}</span>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            autoComplete="tel"
            required
            className={errPhone ? styles.errIn : undefined}
          />
        </label>
        <label className={`${styles.field} ${styles.fieldWide}`}>
          <span className={styles.fieldLabel}>
            {labels.emailLabel}{' '}
            <span className={styles.fieldNote}>{labels.emailNote}</span>
          </span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </label>
      </div>

      {/* honeypot: invisibile alle persone, compilato dai bot */}
      <label className={styles.hp} aria-hidden="true">
        <span>Lascia vuoto questo campo</span>
        <input
          type="text"
          name="_hp"
          value={hp}
          onChange={(e) => setHp(e.target.value)}
          tabIndex={-1}
          autoComplete="off"
        />
      </label>

      {(errPick || errMode || errPeople || errName || errPhone) && (
        <p className={styles.errMsg} role="alert">
          {labels.error}
        </p>
      )}

      <button
        type="submit"
        className={styles.submit}
        disabled={status === 'pending'}
      >
        {labels.submit}
      </button>

      {status === 'error' && (
        <p className={styles.errMsg} role="alert">
          {labels.sendError}
        </p>
      )}

      <p className={styles.legal}>
        {labels.legalPrefix}
        <Link href={privacyHref}>{labels.legalLink}</Link>
        {labels.legalSuffix}
      </p>

      {status === 'sent' && (
        <p className={styles.done} role="status">
          {labels.done}
        </p>
      )}
    </form>
  )
}
