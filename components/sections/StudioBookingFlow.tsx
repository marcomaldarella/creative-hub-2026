'use client'

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type FormEvent,
} from 'react'
import Image, { type StaticImageData } from 'next/image'
import { useSearchParams } from 'next/navigation'
import { Arrow, Button } from '@/components/ui'
import type { Locale } from '@/lib/i18n/config'
import type { Dictionary } from '@/lib/i18n/dictionaries'
import styles from './BookingFlow.module.css'

type Affitto = Dictionary['studioSub']['affitto']
type Labels = Affitto['flow']
type Formula = Affitto['formule'][number]

/**
 * Prenotazione guidata dell'affitto studio (mockup "affitto-studio"):
 * stessa grammatica del flusso coworking, con le regole sue —
 * 1. formula (af.01–03; "allestimento tour" preseleziona "più giorni")
 * 2. durata + fonico dello studio a scelta (default: il tuo)
 * 3. dal giorno + numero di giorni (2 se "più giorni") + contatti
 *    (nome e email obbligatori) → POST /api/contact
 * Deep-link ?formula=produzione|prove|tour dalle card e dalla hero.
 */
export function StudioBookingFlow({
  locale,
  labels,
  formule,
  privacyHref,
  email: contactEmail,
  catImages,
  shopLinks,
}: {
  locale: Locale
  labels: Labels
  /** le tre formule af.01–03 del dizionario (codice, titolo, sintesi) */
  formule: Formula[]
  privacyHref: string
  /** recapito email mostrato nel riepilogo */
  email: string
  /** foto delle card formula, per id; senza foto la card resta scura */
  catImages?: Partial<Record<string, { src: StaticImageData; alt: string }>>
  /** pagina prodotto WooCommerce per formula: dove si prenota davvero.
      Le formule senza prodotto a catalogo restano sulla richiesta. */
  shopLinks?: Partial<Record<string, string>>
}) {
  const [step, setStep] = useState(1)
  const [cat, setCat] = useState<string | null>(null)
  const [itemId, setItemId] = useState<string | null>(null)
  const [engineer, setEngineer] = useState(false)
  const [date, setDate] = useState('')
  const [days, setDays] = useState(labels.dayOptions[0])
  const [whenTouched, setWhenTouched] = useState(false)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [project, setProject] = useState('')
  const [tried, setTried] = useState(false)
  const [sending, setSending] = useState(false)
  const [failed, setFailed] = useState(false)
  const rootRef = useRef<HTMLFormElement>(null)
  const search = useSearchParams()

  const scrollToFlow = () => {
    const el = rootRef.current
    if (!el) return
    window.scrollTo({
      top: el.getBoundingClientRect().top + window.scrollY - 110,
      behavior: 'smooth',
    })
  }

  const go = (n: number, scroll = true) => {
    setStep(n)
    if (scroll) requestAnimationFrame(scrollToFlow)
  }

  const pickItem = (id: string) => {
    setItemId(id)
    /* "più giorni" porta il contatore a 2, le altre durate a 1 */
    setDays(id === 'piu-giorni' ? labels.dayOptions[1] : labels.dayOptions[0])
  }

  const pickCat = (id: string, scroll = true) => {
    setCat(id)
    /* l'allestimento tour è per definizione su più giorni */
    if (id === 'tour') pickItem('piu-giorni')
    go(2, scroll)
  }

  /* deep-link ?formula=…: preseleziona e salta al passo 2 — lo scroll
     lo fa già l'ancora #prenota delle CTA, qui non si aggiunge.
     Sincronizzazione URL → stato (sistema esterno): il setState è voluto
     e gira solo al cambio di query */
  useEffect(() => {
    const q = search.get('formula')
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (q && formule.some((f) => f.id === q)) pickCat(q, false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search])

  const selCat = formule.find((f) => f.id === cat)
  const selItem = labels.items.find((i) => i.id === itemId)
  /* la prenotazione vera si chiude sulla scheda prodotto dello shop:
     se la formula scelta ne ha una, il passo finale ci porta lì */
  const shopUrl = cat ? shopLinks?.[cat] : undefined

  const dash = '—'
  const daysLabel = `${days} ${
    days === labels.dayOptions[0] ? labels.dayWord : labels.daysWord
  }`
  const when = whenTouched
    ? `${
        date
          ? new Date(`${date}T00:00:00`).toLocaleDateString(
              locale === 'it' ? 'it-IT' : 'en-GB'
            )
          : labels.noDate
      } · ${daysLabel}`
    : dash

  const errName = tried && !name.trim()
  const errEmail = tried && !email.trim()

  const stepN =
    step < 4 ? labels.stepOf.replace('{n}', String(step)) : labels.stepDone

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setTried(true)
    if (!selCat || !selItem) return
    if (!name.trim() || !email.trim()) return
    setSending(true)
    setFailed(false)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          form: 'booking-studio',
          subject: labels.subject,
          fields: {
            formula: selCat.title,
            durata: selItem.label,
            fonico: engineer ? labels.engineerOurs : labels.engineerYours,
            prezzo: selItem.price,
            giorno: date,
            giorni: days,
            nome: name.trim(),
            cellulare: phone.trim(),
            email: email.trim(),
            progetto: project.trim(),
          },
        }),
      })
      if (!res.ok) throw new Error(String(res.status))
      go(4)
    } catch {
      setFailed(true)
    } finally {
      setSending(false)
    }
  }

  return (
    <form
      className={styles.flow}
      style={{ '--cats-cols': 3, '--cat-ratio': '4 / 5' } as CSSProperties}
      ref={rootRef}
      onSubmit={onSubmit}
      noValidate
    >
      <div>
        <div className={styles.stepsBar} aria-hidden="true">
          {[1, 2, 3].map((n) => (
            <span
              key={n}
              className={
                n <= Math.min(step, 3)
                  ? `${styles.seg} ${styles.segOn}`
                  : styles.seg
              }
            />
          ))}
        </div>
        <span className={`mono ${styles.stepN}`} aria-live="polite">
          {stepN}
        </span>

        {step === 1 && (
          <div className={styles.panel}>
            <h3 className={styles.q}>{labels.step1Title}</h3>
            <div className={styles.cats} role="radiogroup">
              {formule.map((f) => {
                const img = catImages?.[f.id]
                return (
                  <label
                    key={f.id}
                    className={
                      cat === f.id
                        ? `${styles.cat} ${styles.catOn}`
                        : styles.cat
                    }
                  >
                    <input
                      className="sr-only"
                      type="radio"
                      name="formula"
                      value={f.id}
                      checked={cat === f.id}
                      onChange={() => pickCat(f.id)}
                    />
                    {img && (
                      <Image
                        src={img.src}
                        alt={img.alt}
                        className={styles.catImg}
                        sizes="(max-width: 900px) 100vw, 26vw"
                      />
                    )}
                    <span className={styles.catShade} aria-hidden="true" />
                    <span className={styles.catText}>
                      <span className={`mono ${styles.catCode}`}>{f.n}</span>
                      <span className={styles.catTitle}>{f.title}</span>
                      <span className={styles.catSub}>{f.text}</span>
                    </span>
                  </label>
                )
              })}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className={styles.panel}>
            <h3 className={styles.q}>{labels.step2Title}</h3>
            <div className={styles.items}>
              {labels.items.map((i) => (
                <label
                  key={i.id}
                  className={
                    itemId === i.id
                      ? `${styles.item} ${styles.itemOn}`
                      : styles.item
                  }
                >
                  <input
                    className="sr-only"
                    type="radio"
                    name="durata"
                    value={i.id}
                    checked={itemId === i.id}
                    onChange={() => pickItem(i.id)}
                  />
                  <span>
                    <span className={styles.itemName}>{i.label}</span>
                    <span className={styles.itemSub}>{i.sub}</span>
                  </span>
                  <span className={styles.itemPrice}>{i.price}</span>
                </label>
              ))}
            </div>
            <label
              className={
                engineer ? `${styles.xtra} ${styles.xtraOn}` : styles.xtra
              }
            >
              <input
                className="sr-only"
                type="checkbox"
                checked={engineer}
                onChange={(e) => setEngineer(e.target.checked)}
              />
              <span
                className={engineer ? `${styles.box} ${styles.boxOn}` : styles.box}
                aria-hidden="true"
              />
              <span>
                {labels.engineer}{' '}
                <span className={styles.xtraNote}>· {labels.engineerNote}</span>
              </span>
            </label>
            <div className={styles.navrow}>
              <Button variant="ghost" type="button" onClick={() => go(1)}>
                <span className={styles.btnIn}>
                  <Arrow dir="w" size={13} />
                  {labels.back}
                </span>
              </Button>
              <Button type="button" disabled={!itemId} onClick={() => go(3)}>
                <span className={styles.btnIn}>
                  {labels.next}
                  <Arrow dir="e" size={13} />
                </span>
              </Button>
            </div>
          </div>
        )}

        {/* passo 3 — formula a catalogo: si va a prenotare sullo shop,
            dove stanno tariffe e disponibilità (niente form doppio) */}
        {step === 3 && shopUrl && (
          <div className={styles.panel}>
            <h3 className={styles.q}>{labels.shopTitle}</h3>
            <p className={styles.shopText}>{labels.shopText}</p>
            <div className={styles.nav}>
              <Button variant="ghost" type="button" onClick={() => go(2)}>
                <span className={styles.navBack}>
                  <Arrow dir="w" size={13} />
                  {labels.back}
                </span>
              </Button>
              <Button href={shopUrl} external>
                {labels.shopCta}
              </Button>
            </div>
          </div>
        )}

        {step === 3 && !shopUrl && (
          <div className={styles.panel}>
            <h3 className={styles.q}>{labels.step3Title}</h3>
            <div className={styles.fields}>
              <label className={styles.field}>
                <span className={styles.label}>{labels.fromDay}</span>
                <input
                  className={styles.input}
                  type="date"
                  value={date}
                  onChange={(e) => {
                    setDate(e.target.value)
                    setWhenTouched(true)
                  }}
                />
              </label>
              <label className={styles.field}>
                <span className={styles.label}>{labels.days}</span>
                <span className={styles.selectBox}>
                  <select
                    className={styles.select}
                    value={days}
                    onChange={(e) => {
                      setDays(e.target.value)
                      setWhenTouched(true)
                    }}
                  >
                    {labels.dayOptions.map((o) => (
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
                <span className={styles.label}>{labels.name}</span>
                <input
                  className={
                    errName ? `${styles.input} ${styles.inputErr}` : styles.input
                  }
                  type="text"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  aria-invalid={errName}
                />
              </label>
              <label className={styles.field}>
                <span className={styles.label}>{labels.phone}</span>
                <input
                  className={styles.input}
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </label>
              <label className={`${styles.field} ${styles.full}`}>
                <span className={styles.label}>{labels.email}</span>
                <input
                  className={
                    errEmail
                      ? `${styles.input} ${styles.inputErr}`
                      : styles.input
                  }
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-invalid={errEmail}
                />
              </label>
              <label className={`${styles.field} ${styles.full}`}>
                <span className={styles.label}>
                  {labels.project}{' '}
                  <span className={styles.labelNote}>{labels.projectNote}</span>
                </span>
                <textarea
                  className={styles.area}
                  maxLength={1000}
                  placeholder={labels.projectPlaceholder}
                  value={project}
                  onChange={(e) => setProject(e.target.value)}
                />
              </label>
            </div>
            <div className={styles.navrow}>
              <Button variant="ghost" type="button" onClick={() => go(2)}>
                <span className={styles.btnIn}>
                  <Arrow dir="w" size={13} />
                  {labels.back}
                </span>
              </Button>
              <Button type="submit" disabled={sending}>
                {sending ? labels.sending : labels.send}
              </Button>
            </div>
            {(errName || errEmail) && (
              <p className={styles.err} role="alert">
                {labels.missing}
              </p>
            )}
            {failed && (
              <p className={styles.err} role="alert">
                {labels.sendError}
              </p>
            )}
            <p className={styles.privacy}>
              {labels.privacyBefore}
              <a href={privacyHref}>{labels.privacyLink}</a>.
            </p>
          </div>
        )}

        {step === 4 && (
          <div className={`${styles.panel} ${styles.done}`} role="status">
            <h3 className={`display-thin ${styles.doneTitle}`}>
              {labels.doneTitle}
            </h3>
            <p className={styles.doneText}>{labels.doneText}</p>
          </div>
        )}
      </div>

      <aside className={`scheme-dark ${styles.summary}`} aria-live="polite">
        <h3 className={styles.summaryTitle}>{labels.summaryTitle}</h3>
        <dl className={styles.summaryList}>
          <dt>{labels.summaryFormula}</dt>
          <dd>{selCat?.title ?? dash}</dd>
          <dt>{labels.summaryDuration}</dt>
          <dd>{selItem?.label ?? dash}</dd>
          <dt>{labels.summaryEngineer}</dt>
          <dd>{engineer ? labels.engineerOurs : labels.engineerYours}</dd>
          <dt>{labels.summaryPrice}</dt>
          <dd>{selItem?.price ?? dash}</dd>
          <dt>{labels.summaryWhen}</dt>
          <dd>{when}</dd>
        </dl>
        <p className={styles.summaryFoot}>
          {labels.questions}
          <a className={styles.summaryTel} href={`tel:${labels.phoneHref}`}>
            {labels.phoneLabel}
          </a>
          <a className={styles.summaryMail} href={`mailto:${contactEmail}`}>
            {contactEmail}
          </a>
        </p>
      </aside>
    </form>
  )
}
