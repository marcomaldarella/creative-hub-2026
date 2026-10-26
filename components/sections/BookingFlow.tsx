'use client'

import { useEffect, useRef, useState, type FormEvent } from 'react'
import Image, { type StaticImageData } from 'next/image'
import { useSearchParams } from 'next/navigation'
import { Arrow, Button } from '@/components/ui'
import type { Locale } from '@/lib/i18n/config'
import type { Dictionary } from '@/lib/i18n/dictionaries'
import styles from './BookingFlow.module.css'

type Labels = Dictionary['prenota']['flow']
type CatId = keyof Labels['items']

/**
 * Prenotazione guidata del coworking (mockup cliente "prenota" ott 2026):
 * 1. cosa vuoi fare (due card fotografiche: lavorare / incontrarsi)
 * 2. quale spazio, con i prezzi — il cambio categoria azzera la scelta
 * 3. quando e chi sei (nome e cellulare obbligatori)
 * 4. fatto — solo a invio riuscito (POST /api/contact)
 * Il riepilogo a lato si aggiorna a ogni scelta; i tasti "prenota" del
 * sito possono aprire il flusso con la categoria già scelta (?cat=sale).
 */
export function BookingFlow({
  locale,
  labels,
  privacyHref,
  catImages,
  shopLinks,
}: {
  locale: Locale
  labels: Labels
  privacyHref: string
  /** foto delle due card del passo 1, per id categoria */
  catImages: Record<CatId, { src: StaticImageData; alt: string }>
  /** uscita secondaria: pagina prodotto WooCommerce per voce scelta */
  shopLinks?: Partial<Record<string, string>>
}) {
  const [step, setStep] = useState(1)
  const [cat, setCat] = useState<CatId | null>(null)
  const [itemId, setItemId] = useState<string | null>(null)
  const [date, setDate] = useState('')
  const [time, setTime] = useState(labels.times[0])
  const [whenTouched, setWhenTouched] = useState(false)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  /* la validazione parte solo dopo il primo tentativo di invio */
  const [tried, setTried] = useState(false)
  const [sending, setSending] = useState(false)
  const [failed, setFailed] = useState(false)
  const rootRef = useRef<HTMLFormElement>(null)
  const search = useSearchParams()

  /* scroll morbido alla testa del flusso a ogni cambio passo (il mockup
     fa lo stesso): 110px = nav fissa + margine ancore */
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

  /* deep-link ?cat=lavoro|sale: preseleziona e salta al passo 2.
     È una sincronizzazione URL → stato (sistema esterno), non uno stato
     derivabile: il setState qui è voluto e gira solo al cambio di query */
  useEffect(() => {
    const q = search.get('cat')
    if (q && labels.cats.some((c) => c.id === q)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCat(q as CatId)
      setItemId(null)
      go(2)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search])

  const cats = labels.cats
  const items = cat ? labels.items[cat] : []
  const selCat = cats.find((c) => c.id === cat)
  const selItem = items.find((i) => i.id === itemId)
  const shopUrl = selItem ? shopLinks?.[selItem.id] : undefined

  const dash = '—'
  const when = whenTouched
    ? `${
        date
          ? `${new Date(`${date}T00:00:00`).toLocaleDateString(
              locale === 'it' ? 'it-IT' : 'en-GB'
            )}, `
          : ''
      }${time}`
    : dash

  const onCat = (id: CatId) => {
    setCat(id)
    /* il cambio categoria azzera lo spazio scelto */
    setItemId(null)
    go(2)
  }

  const errName = tried && !name.trim()
  const errPhone = tried && !phone.trim()

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setTried(true)
    if (!selCat || !selItem) return
    if (!name.trim() || !phone.trim()) return
    setSending(true)
    setFailed(false)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          form: 'booking',
          subject: labels.subject,
          fields: {
            categoria: selCat.label,
            spazio: selItem.label,
            prezzo: selItem.price,
            giorno: date,
            orario: time,
            nome: name.trim(),
            cellulare: phone.trim(),
            email: email.trim(),
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
    <form className={styles.flow} ref={rootRef} onSubmit={onSubmit} noValidate>
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

        {step === 1 && (
          <div className={styles.panel}>
            <h2 className={styles.q}>{labels.step1Title}</h2>
            <div className={styles.cats}>
              {cats.map((c) => (
                <label
                  key={c.id}
                  className={
                    cat === c.id ? `${styles.cat} ${styles.catOn}` : styles.cat
                  }
                >
                  <input
                    className="sr-only"
                    type="radio"
                    name="cat"
                    value={c.id}
                    checked={cat === c.id}
                    onChange={() => onCat(c.id as CatId)}
                  />
                  <Image
                    src={catImages[c.id as CatId].src}
                    alt={catImages[c.id as CatId].alt}
                    className={styles.catImg}
                    sizes="(max-width: 900px) 100vw, 40vw"
                  />
                  <span className={styles.catShade} aria-hidden="true" />
                  <span className={styles.catText}>
                    <span className={styles.catTitle}>{c.label}</span>
                    <span className={styles.catSub}>{c.sub}</span>
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className={styles.panel}>
            <h2 className={styles.q}>{labels.step2Title}</h2>
            <div className={styles.items}>
              {items.map((i) => (
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
                    name="item"
                    value={i.id}
                    checked={itemId === i.id}
                    onChange={() => setItemId(i.id)}
                  />
                  <span>
                    <span className={styles.itemName}>{i.label}</span>
                    <span className={styles.itemSub}>{i.sub}</span>
                  </span>
                  <span className={styles.itemPrice}>{i.price}</span>
                </label>
              ))}
            </div>
            <div className={styles.navrow}>
              <Button variant="ghost" type="button" onClick={() => go(1)}>
                <span className={styles.btnIn}>
                  <Arrow dir="w" size={13} />
                  {labels.back}
                </span>
              </Button>
              <Button
                type="button"
                disabled={!itemId}
                onClick={() => go(3)}
              >
                <span className={styles.btnIn}>
                  {labels.next}
                  <Arrow dir="e" size={13} />
                </span>
              </Button>
            </div>
          </div>
        )}

        {/* passo 3 — lo spazio ha una scheda sullo shop: si prenota lì,
            dove stanno disponibilità e pagamento (niente form doppio) */}
        {step === 3 && shopUrl && (
          <div className={styles.panel}>
            <h2 className={styles.q}>{labels.shopTitle}</h2>
            <p className={styles.shopText}>{labels.shopText}</p>
            <div className={styles.navrow}>
              <Button variant="ghost" type="button" onClick={() => go(2)}>
                <span className={styles.btnIn}>
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
            <h2 className={styles.q}>{labels.step3Title}</h2>
            <div className={styles.fields}>
              <label className={styles.field}>
                <span className={styles.label}>{labels.day}</span>
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
                <span className={styles.label}>{labels.time}</span>
                <span className={styles.selectBox}>
                  <select
                    className={styles.select}
                    value={time}
                    onChange={(e) => {
                      setTime(e.target.value)
                      setWhenTouched(true)
                    }}
                  >
                    {labels.times.map((o) => (
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
                  required
                />
              </label>
              <label className={styles.field}>
                <span className={styles.label}>{labels.phone}</span>
                <input
                  className={
                    errPhone
                      ? `${styles.input} ${styles.inputErr}`
                      : styles.input
                  }
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  aria-invalid={errPhone}
                  required
                />
              </label>
              <label className={`${styles.field} ${styles.full}`}>
                <span className={styles.label}>{labels.email}</span>
                <input
                  className={styles.input}
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
            {(errName || errPhone) && (
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
            <h2 className={`display-thin ${styles.doneTitle}`}>
              {labels.doneTitle}
            </h2>
            <p className={styles.doneText}>{labels.doneText}</p>
          </div>
        )}
      </div>

      <aside className={`scheme-dark ${styles.summary}`} aria-live="polite">
        <h3 className={styles.summaryTitle}>{labels.summaryTitle}</h3>
        <dl className={styles.summaryList}>
          <dt>{labels.summaryWhat}</dt>
          <dd>{selCat?.label ?? dash}</dd>
          <dt>{labels.summarySpace}</dt>
          <dd>{selItem?.label ?? dash}</dd>
          <dt>{labels.summaryPrice}</dt>
          <dd>{selItem?.price ?? dash}</dd>
          <dt>{labels.summaryWhen}</dt>
          <dd>{when}</dd>
        </dl>
        {/* al passo finale il tasto grande porta già allo shop: qui
            sarebbe un doppione */}
        {shopUrl && step < 3 && (
          <a
            className={`mono ${styles.payLink}`}
            href={shopUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            {labels.payOnline}
            <Arrow dir="ne" size={11} />
          </a>
        )}
        <p className={styles.summaryFoot}>
          {labels.questions}
          <a className={styles.summaryTel} href={`tel:${labels.phoneHref}`}>
            {labels.phoneLabel}
          </a>
          <span className={styles.summaryNote}>{labels.phoneNote}</span>
        </p>
      </aside>
    </form>
  )
}
