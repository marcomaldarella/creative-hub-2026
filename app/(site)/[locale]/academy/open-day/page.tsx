import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Arrow, ArrowLink, Button, Reveal, RevealGroup } from '@/components/ui'
import { SiteChrome } from '@/components/sections/SiteChrome'
import { UniSubnav } from '@/components/sections/UniSubnav'
import { OpenDayForm } from '@/components/sections/OpenDayForm'
import { isLocale, localeHref } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { pageAlternates } from '@/lib/seo'
import uniImg from '@/public/img/sections/academy-universitari.jpg'
import customImg from '@/public/img/sections/academy-custom.jpg'
/* grammatiche condivise: det per testata/sezioni/griglie, tp per le
   righe etichetta—testo delle schede info */
import det from '@/components/sections/DetailPage.module.css'
import tp from '@/components/sections/TopicScreen.module.css'
import styles from './page.module.css'

export const dynamic = 'force-dynamic'

/* la riga della fascia si legge in due tempi: quello che sta prima del
   trattino (l'orario, o la domanda) pesa, il resto resta normale */
function bandRich(text: string) {
  const i = text.indexOf('—')
  if (i < 0) return text
  return (
    <>
      <strong className={styles.bandStrong}>{text.slice(0, i).trim()}</strong>{' '}
      {text.slice(i)}
    </>
  )
}

/* destinazione del mailto di prenotazione */
const BOOKING_EMAIL = 'hello@bologna-creativehub.it'
const MAPS_URL =
  'https://maps.google.com/?q=Via+del+Tappezziere+4,+40138+Bologna'
/* riquadro mappa OpenStreetMap centrato sulla sede (via del
   Tappezziere 4): coordinate reali, marcatore incluso */
const MAP_EMBED =
  'https://www.openstreetmap.org/export/embed.html?bbox=11.4053%2C44.4993%2C11.4213%2C44.5064&layer=mapnik&marker=44.5028453%2C11.4132952'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const od = getDictionary(locale).openDay
  return {
    title: od.meta.title,
    description: od.meta.description,
    alternates: pageAlternates(locale, '/academy/open-day'),
  }
}

export default async function OpenDayPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const t = getDictionary(locale)
  const od = t.openDay

  const telHref = `tel:${od.book.phone.replace(/\s/g, '')}`

  /* le due card-ancora con foto: stessa foto dei percorsi della landing
     academy (canto = universitari, pad = custom) */
  const anchorCards = [
    {
      id: 'universitari',
      img: uniImg,
      card: od.cards.uni,
    },
    {
      id: 'lezioni',
      img: customImg,
      card: od.cards.custom,
    },
  ]

  /* i rimandi delle domande dei genitori, nell'ordine del dizionario */
  const parentHrefs = [
    localeHref(locale, '/academy/corsi-universitari'),
    localeHref(locale, '/academy/corsi-universitari'),
    localeHref(locale, '/academy/stage-placement'),
    '#come-arrivare',
  ]

  const subnavItems = [
    { id: 'universitari', label: od.subnav.universitari },
    { id: 'lezioni', label: od.subnav.lezioni },
    { id: 'prenota', label: od.subnav.prenota },
    { id: 'come-arrivare', label: od.subnav.comeArrivare },
  ]

  /* scheda info a righe hairline dentro la card bordata */
  const infoCard = (rows: { label: string; value: string }[]) => (
    <Reveal className={styles.infoCard} delay={120}>
      <div className={`${tp.defs} ${styles.infoDefs}`}>
        {rows.map((r) => (
          <div key={r.label} className={tp.def}>
            <span className={tp.defLabel}>{r.label}</span>
            <span className={tp.defText}>{r.value}</span>
          </div>
        ))}
      </div>
    </Reveal>
  )

  return (
    <SiteChrome locale={locale} path="/academy/open-day">
      <main className={styles.main}>
        {/* ————— testata ————— */}
        <header className={`wrap ${det.head}`}>
          <Reveal className={det.back}>
            <ArrowLink href={localeHref(locale, '/academy')} reverse>
              {t.topics.backTo} {t.nav.academy.toLowerCase()}
            </ArrowLink>
          </Reveal>
          <Reveal as="span" className={`mono ${det.kicker}`} delay={60}>
            {od.kicker}
          </Reveal>
          <Reveal as="h1" className={`display-thin ${det.title}`} delay={120}>
            {od.title.split('\n').map((line) => (
              <span key={line} className={styles.titleLine}>
                {line}
              </span>
            ))}
          </Reveal>
          <Reveal as="p" className={det.lede} delay={180}>
            {od.lede}
          </Reveal>
        </header>

        {/* ————— le due card-ancora con foto ————— */}
        <section className={`wrap ${styles.cardsSez}`}>
          <RevealGroup className={det.grid2}>
            {anchorCards.map(({ id, img, card }) => (
              <Link key={id} href={`#${id}`} className={`rv ${styles.cardA}`}>
                <figure className={styles.cardPh}>
                  <Image
                    src={img}
                    alt={card.alt}
                    fill
                    sizes="(max-width: 860px) 100vw, 50vw"
                  />
                </figure>
                <span className={`mono ${styles.cardNum}`}>{card.num}</span>
                <span className={styles.cardTitle}>{card.title}</span>
                <span className={styles.cardSub}>{card.sub}</span>
                <span className={styles.cardGo}>
                  {od.cards.cta}
                  {/* freccia del brand ruotata in giù: punta all'ancora */}
                  <span className={styles.cardGoArrow} aria-hidden="true">
                    <Arrow dir="e" size={14} />
                  </span>
                </span>
              </Link>
            ))}
          </RevealGroup>
        </section>

        {/* ————— indice sticky con scroll-spy (UI della scheda corso) ————— */}
        <UniSubnav
          course={od.subnav.course}
          year=""
          items={subnavItems}
          prevLabel={od.subnav.prev}
          nextLabel={od.subnav.next}
        />

        {/* ————— od.01 · corsi universitari ————— */}
        <section id="universitari" className={styles.blockSez}>
          <div className={`wrap ${det.duo} ${styles.duoWide} ${styles.duoPad}`}>
            <div>
              <Reveal as="span" className={`mono ${det.kicker}`}>
                {od.uni.kicker}
              </Reveal>
              <Reveal as="h2" className={`display-thin ${det.h2}`} delay={60}>
                {od.uni.title}
              </Reveal>
              <Reveal as="p" className={det.sezLede} delay={120}>
                {od.uni.lede}
              </Reveal>
              <Reveal as="p" className={tp.sezP} delay={160}>
                {od.uni.text}
              </Reveal>
            </div>
            {infoCard(od.uni.info)}
          </div>
          <div className="wrap">
            <RevealGroup className={styles.cells3}>
              {od.uni.cells.map((c) => (
                <div key={c.title} className={`rv ${styles.cell}`}>
                  <span className={`mono ${styles.cellKicker}`}>
                    {c.kicker}
                  </span>
                  <h3 className={styles.cellTitle}>{c.title}</h3>
                  <p className={styles.cellText}>{c.text}</p>
                </div>
              ))}
            </RevealGroup>
          </div>
          {/* fascia nera compatta di chiusura */}
          <div className={`scheme-dark ${styles.band}`}>
            <div className={`wrap ${styles.bandIn}`}>
              <p className={styles.bandText}>{bandRich(od.uni.band.text)}</p>
              <div className={styles.bandRow}>
                <Button variant="azzurro" href="#prenota-uni">
                  {od.uni.band.cta}
                </Button>
                <ArrowLink
                  href={localeHref(locale, '/academy/corsi-universitari')}
                >
                  {od.uni.band.link}
                </ArrowLink>
              </div>
            </div>
          </div>
        </section>

        {/* ————— per chi accompagna: le domande dei genitori ————— */}
        <section className={`wrap ${det.sez}`}>
          <Reveal as="span" className={`mono ${det.kicker}`}>
            {od.parents.kicker}
          </Reveal>
          <Reveal as="h2" className={`display-thin ${det.h2}`} delay={60}>
            {od.parents.title}
          </Reveal>
          <Reveal as="p" className={det.sezLede} delay={120}>
            {od.parents.lede}
          </Reveal>
          <RevealGroup className={det.grid2}>
            {od.parents.items.map((item, i) => (
              <div key={item.q} className={`rv ${styles.qa}`}>
                <h3 className={styles.cellTitle}>{item.q}</h3>
                <p className={styles.qaA}>{item.a}</p>
                <ArrowLink href={parentHrefs[i]}>{item.link}</ArrowLink>
              </div>
            ))}
          </RevealGroup>
        </section>

        {/* ————— od.02 · lezioni su misura ————— */}
        <section id="lezioni" className={`${styles.blockSez} ${styles.sezLine}`}>
          <div className={`wrap ${det.duo} ${styles.duoWide} ${styles.duoPad}`}>
            <div>
              <Reveal as="span" className={`mono ${det.kicker}`}>
                {od.custom.kicker}
              </Reveal>
              <Reveal as="h2" className={`display-thin ${det.h2}`} delay={60}>
                {od.custom.title}
              </Reveal>
              <Reveal as="p" className={det.sezLede} delay={120}>
                {od.custom.lede}
              </Reveal>
              <Reveal as="p" className={tp.sezP} delay={160}>
                {od.custom.text}
              </Reveal>
              <RevealGroup className={styles.chips}>
                {od.custom.chips.map((chip) => (
                  <span key={chip} className={`rv ${styles.chip}`}>
                    {chip}
                  </span>
                ))}
              </RevealGroup>
            </div>
            {infoCard(od.custom.info)}
          </div>
          <div className="wrap">
            <RevealGroup className={styles.cells2}>
              {od.custom.cells.map((c) => (
                <div key={c.title} className={`rv ${styles.cell}`}>
                  <span className={`mono ${styles.cellKicker}`}>
                    {c.kicker}
                  </span>
                  <h3 className={styles.cellTitle}>{c.title}</h3>
                  <p className={styles.cellText}>{c.text}</p>
                </div>
              ))}
            </RevealGroup>
          </div>
          <div className={`scheme-dark ${styles.band}`}>
            <div className={`wrap ${styles.bandIn}`}>
              <p className={styles.bandText}>{bandRich(od.custom.band.text)}</p>
              <div className={styles.bandRow}>
                <Button variant="azzurro" href="#prenota-lezioni">
                  {od.custom.band.cta}
                </Button>
                <ArrowLink href={localeHref(locale, '/academy/corsi-custom')}>
                  {od.custom.band.link}
                </ArrowLink>
              </div>
            </div>
          </div>
        </section>

        {/* ————— prenota ————— */}
        <section id="prenota" className={`wrap ${det.sez}`}>
          {/* ancore extra per le CTA con preselezione: il browser scrolla
              solo su id esistenti, l'hash lo legge poi il form */}
          <span id="prenota-uni" className={styles.anchor} aria-hidden="true" />
          <span
            id="prenota-lezioni"
            className={styles.anchor}
            aria-hidden="true"
          />
          <div className={det.duo}>
            <div>
              <Reveal as="span" className={`mono ${det.kicker}`}>
                {od.book.kicker}
              </Reveal>
              <Reveal as="h2" className={`display-thin ${det.h2}`} delay={60}>
                {od.book.title}
              </Reveal>
              <Reveal as="p" className={tp.sezP} delay={120}>
                {od.book.text}
              </Reveal>
              <Reveal className={styles.phoneRow} delay={160}>
                <span className={styles.phoneLead}>{od.book.phoneLead}</span>
                <ArrowLink href={telHref} external>
                  {od.book.phone}
                </ArrowLink>
                <span className={styles.phoneNote}>{od.book.phoneNote}</span>
              </Reveal>
            </div>
            <Reveal delay={100}>
              <OpenDayForm
                labels={od.book.form}
                to={BOOKING_EMAIL}
                privacyHref={localeHref(locale, '/privacy')}
              />
            </Reveal>
          </div>
        </section>

        {/* ————— non puoi venire? ————— */}
        <section className={`wrap ${det.sez} ${styles.sezLine}`}>
          <Reveal as="span" className={`mono ${det.kicker}`}>
            {od.alt.kicker}
          </Reveal>
          <Reveal as="h2" className={`display-thin ${det.h2}`} delay={60}>
            {od.alt.title}
          </Reveal>
          <RevealGroup className={styles.altRows}>
            <div className={`rv ${styles.altRow}`}>
              <span className={`mono ${styles.altNum}`}>01</span>
              <div>
                <h3 className={styles.cellTitle}>{od.alt.live.title}</h3>
                <p className={styles.cellText}>{od.alt.live.text}</p>
              </div>
              <div className={styles.altAction}>
                <Button href="#prenota">{od.alt.live.cta}</Button>
              </div>
            </div>
            <div className={`rv ${styles.altRow}`}>
              <span className={`mono ${styles.altNum}`}>02</span>
              <div>
                <h3 className={styles.cellTitle}>{od.alt.tutor.title}</h3>
                <p className={styles.cellText}>{od.alt.tutor.text}</p>
              </div>
              <div className={styles.altAction}>
                <ArrowLink href={telHref} external>
                  {od.book.phone}
                </ArrowLink>
              </div>
            </div>
          </RevealGroup>
        </section>

        {/* ————— come arrivare: solo l'indirizzo ————— */}
        <section
          id="come-arrivare"
          className={`wrap ${det.sez} ${styles.sezLine}`}
        >
          <Reveal as="span" className={`mono ${det.kicker}`}>
            {od.reach.kicker}
          </Reveal>
          <Reveal as="h2" className={`display-thin ${det.h2}`} delay={60}>
            {od.reach.title}
          </Reveal>
          <div className={styles.reachGrid}>
            <Reveal className={styles.reachBox} delay={120}>
              <div className={tp.defs}>
                <div className={tp.def}>
                  <span className={tp.defLabel}>{od.reach.addressLabel}</span>
                  <span className={tp.defText}>{od.reach.address}</span>
                </div>
              </div>
              <ArrowLink href={MAPS_URL} external>
                {od.reach.maps}
              </ArrowLink>
            </Reveal>
            {/* mappa vera, da OpenStreetMap: nessuna chiave e nessun
                cookie di profilazione, si carica solo quando serve */}
            <Reveal className={styles.mapBox} delay={180}>
              <iframe
                className={styles.map}
                title={od.reach.title}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                src={MAP_EMBED}
              />
            </Reveal>
          </div>
        </section>
      </main>
    </SiteChrome>
  )
}
