'use client'

import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui'
import type { Locale } from '@/lib/i18n/config'
import type { Dictionary } from '@/lib/i18n/dictionaries'
import flow from './BookingFlow.module.css'
import styles from './EventBuilder.module.css'

type Labels = Dictionary['saleEventiPage']['builder']

/**
 * "Componi il tuo evento" (mockup sale & eventi, ott 2026): quattro
 * domande — che evento è, quante persone, quando, cosa serve in più — e
 * un riepilogo a lato che si aggiorna a ogni scelta e propone la sala
 * adatta. Chi scrive arriva con una richiesta completa, così non si
 * rimbalzano email. L'invio è vero: POST /api/contact, come gli altri
 * form del sito. La UI riusa per intero le classi della prenotazione
 * guidata: la grammatica dei form resta UNA.
 */
export function EventBuilder({
  locale,
  labels,
  lede,
  privacyHref,
}: {
  locale: Locale
  labels: Labels
  lede: string
  privacyHref: string
}) {
  const [typeId, setTypeId] = useState(labels.types[0].id)
  const [size, setSize] = useState(labels.sizes[0])
  const [date, setDate] = useState('')
  const [extras, setExtras] = useState<string[]>([])
  const [name, setName] = useState('')
  const [contact, setContact] = useState('')
  const [tried, setTried] = useState(false)
  const [sending, setSending] = useState(false)
  const [failed, setFailed] = useState(false)
  const [sent, setSent] = useState(false)

  const type = labels.types.find((t) => t.id === typeId) ?? labels.types[0]
  /* la sala proposta viene dal tipo di evento; una riunione che non sta
     nella sala riunioni passa a uno spazio più grande (come nel mockup) */
  const room =
    type.id === 'riunione' && size !== labels.sizes[0] ? labels.roomBig : type.room

  const toggleExtra = (x: string) =>
    setExtras((prev) =>
      prev.includes(x) ? prev.filter((e) => e !== x) : [...prev, x]
    )

  const shownDate = date
    ? new Date(`${date}T00:00:00`).toLocaleDateString(
        locale === 'it' ? 'it-IT' : 'en-GB'
      )
    : labels.noDate

  const errName = tried && !name.trim()
  const errContact = tried && !contact.trim()

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setTried(true)
    if (!name.trim() || !contact.trim()) return
    setSending(true)
    setFailed(false)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          form: 'evento',
          subject: labels.subject,
          fields: {
            tipo: type.label,
            persone: size,
            data: date,
            sala: room,
            extra: extras.join(', '),
            nome: name.trim(),
            contatto: contact.trim(),
          },
        }),
      })
      if (!res.ok) throw new Error(String(res.status))
      setSent(true)
    } catch {
      setFailed(true)
    } finally {
      setSending(false)
    }
  }

  return (
    <form className={flow.flow} onSubmit={onSubmit} noValidate>
      <div>
        <p className={styles.lede}>{lede}</p>

        {/* 1. che evento è */}
        <div className={styles.group}>
          <h3 className={flow.q}>{labels.q1}</h3>
          <div className={flow.items}>
            {labels.types.map((t) => (
              <label
                key={t.id}
                className={
                  typeId === t.id ? `${flow.item} ${flow.itemOn}` : flow.item
                }
              >
                <input
                  className="sr-only"
                  type="radio"
                  name="tipo"
                  value={t.id}
                  checked={typeId === t.id}
                  onChange={() => setTypeId(t.id)}
                />
                <span className={flow.itemName}>{t.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* 2. quante persone · 3. quando: due campi, la domanda è
            l'etichetta del campo come nel mockup */}
        <div className={styles.group}>
          <div className={styles.when}>
            <label className={flow.field}>
              {/* le quattro domande hanno tutte lo stesso peso: qui la
                  domanda è anche l'etichetta del campo */}
              <span className={`${flow.q} ${styles.qField}`}>{labels.q2}</span>
              <span className={flow.selectBox}>
                <select
                  className={flow.select}
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                >
                  {labels.sizes.map((s) => (
                    <option key={s} value={s}>
                      {s}
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
            <label className={flow.field}>
              <span className={`${flow.q} ${styles.qField}`}>{labels.q3}</span>
              <input
                className={flow.input}
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </label>
          </div>
        </div>

        {/* 4. cosa serve in più */}
        <div className={styles.group}>
          <h3 className={flow.q}>{labels.q4}</h3>
          <div className={styles.extras}>
            {labels.extras.map((x) => {
              const on = extras.includes(x)
              return (
                <label
                  key={x}
                  className={on ? `${flow.xtra} ${flow.xtraOn}` : flow.xtra}
                >
                  <input
                    className="sr-only"
                    type="checkbox"
                    checked={on}
                    onChange={() => toggleExtra(x)}
                  />
                  <span
                    className={on ? `${flow.box} ${flow.boxOn}` : flow.box}
                    aria-hidden="true"
                  />
                  {x}
                </label>
              )
            })}
          </div>
        </div>
      </div>

      {/* riepilogo: si aggiorna a ogni scelta e chiude sulla richiesta */}
      <aside className={`scheme-dark ${flow.summary}`} aria-live="polite">
        <h3 className={flow.summaryTitle}>{labels.summaryTitle}</h3>
        <dl className={flow.summaryList}>
          <dt>{labels.sType}</dt>
          <dd>{type.label}</dd>
          <dt>{labels.sSize}</dt>
          <dd>{size}</dd>
          <dt>{labels.sDate}</dt>
          <dd>{shownDate}</dd>
          <dt>{labels.sRoom}</dt>
          <dd>{room}</dd>
          <dt>{labels.sExtra}</dt>
          <dd>{extras.length ? extras.join(', ') : labels.noExtra}</dd>
        </dl>

        {sent ? (
          <div className={styles.ask} role="status">
            <strong className={flow.summaryTitle}>{labels.doneTitle}</strong>
            <p className={flow.summaryNote}>{labels.doneText}</p>
          </div>
        ) : (
          <div className={styles.ask}>
            <label className={flow.field}>
              <span className={flow.label}>{labels.name}</span>
              <input
                className={
                  errName ? `${flow.input} ${flow.inputErr}` : flow.input
                }
                type="text"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                aria-invalid={errName}
              />
            </label>
            <label className={flow.field}>
              <span className={flow.label}>{labels.contact}</span>
              <input
                className={
                  errContact ? `${flow.input} ${flow.inputErr}` : flow.input
                }
                type="text"
                autoComplete="tel"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                aria-invalid={errContact}
              />
            </label>
            <Button type="submit" disabled={sending}>
              {sending ? labels.sending : labels.send}
            </Button>
            {(errName || errContact) && (
              <p className={flow.err} role="alert">
                {labels.missing}
              </p>
            )}
            {failed && (
              <p className={flow.err} role="alert">
                {labels.sendError}
              </p>
            )}
            <p className={flow.privacy}>
              {labels.privacyBefore}
              <a href={privacyHref}>{labels.privacyLink}</a>.
            </p>
          </div>
        )}
      </aside>
    </form>
  )
}
