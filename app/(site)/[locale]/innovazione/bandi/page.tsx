import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLink, Button, Reveal, RevealGroup, Rule } from '@/components/ui'
import { SiteChrome } from '@/components/sections/SiteChrome'
import { SectionPagesNav } from '@/components/sections/SectionPagesNav'
import { isLocale, localeHref } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { pageAlternates } from '@/lib/seo'
import { getSiteSettings } from '@/lib/sanity/queries'
/* grammatica condivisa delle pagine di dettaglio: testata, pillole
   filtro, elenco bandi, chiusura nera */
import { ContactForm } from '@/components/sections/ContactForm'
import det from '@/components/sections/DetailPage.module.css'
import styles from './page.module.css'

export const dynamic = 'force-dynamic'

type BandoItem = {
  date: string
  type: string
  open: boolean
  statusLabel: string
  title: string
  text: string
  per: string
  cta: string
  href: string
}

/* filtro server-side: la chiave arriva da ?f= e si risolve qui, niente JS
   in pagina. L'ordine resta quello del dizionario (aperti in cima). */
function matches(item: BandoItem, f: string): boolean {
  switch (f) {
    case 'aperte':
      return item.open
    case 'archivio':
      return !item.open
    case 'call':
      return item.type === 'call'
    case 'progetti':
      return item.type === 'progetto'
    case 'eventi':
      return item.type === 'evento'
    default:
      return true
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const t = getDictionary(locale)
  return {
    title: t.innovationSub.bandi.metaTitle,
    description: t.innovationSub.bandi.metaDesc,
    alternates: pageAlternates(locale, '/innovazione/bandi'),
  }
}

export default async function BandiPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ f?: string }>
}) {
  const [{ locale }, { f }] = await Promise.all([params, searchParams])
  if (!isLocale(locale)) notFound()
  const t = getDictionary(locale)
  const d = t.innovationSub.bandi
  const settings = await getSiteSettings()

  /* chiave sconosciuta in query = come 'tutte' */
  const active = f && d.filters.some((x) => x.key === f) ? f : 'tutte'
  const items = (d.items as BandoItem[]).filter((item) => matches(item, active))
  const base = localeHref(locale, '/innovazione/bandi')
  /* etichetta della Rule: il titolo d'elenco, minuscolo e senza punto */
  const listKicker = d.listTitle.toLowerCase().replace(/\.$/, '')


  return (
    <SiteChrome locale={locale} path="/innovazione/bandi">
      <main className={det.main}>
        {/* ————— testata semplice: niente foto, niente fatti ————— */}
        <header className={`wrap ${det.head}`}>
          <Reveal className={det.back}>
            <ArrowLink href={localeHref(locale, '/innovazione')} reverse>
              {t.innovationSub.back}
            </ArrowLink>
          </Reveal>
          <Reveal as="span" className={`mono ${det.kicker}`} delay={60}>
            {d.kicker}
          </Reveal>
          <Reveal as="h1" className={`display-thin ${det.title}`} delay={120}>
            {d.title}
          </Reveal>
          <Reveal as="p" className={det.lede} delay={180}>
            {d.lede}
          </Reveal>
        </header>

        {/* ————— barra delle pagine di sezione (mockup) ————— */}
        <SectionPagesNav locale={locale} base="/innovazione" current="/innovazione/bandi" />

        {/* ————— l'elenco, con le pillole filtro ————— */}
        <Rule left="01" right={listKicker} />
        <section className={`wrap ${det.sez}`}>
          <Reveal as="h2" className={`display-thin ${det.h2}`}>
            {d.listTitle}
          </Reveal>
          <Reveal className={det.filters} delay={60}>
            {d.filters.map((fl) => {
              const on = fl.key === active
              return (
                <Link
                  key={fl.key}
                  href={fl.key === 'tutte' ? base : `${base}?f=${fl.key}`}
                  className={
                    on
                      ? `${det.filter} ${det.filterOn}`
                      : `${det.filter} ${styles.pill}`
                  }
                  aria-current={on ? 'true' : undefined}
                >
                  {fl.label}
                </Link>
              )
            })}
          </Reveal>
          <RevealGroup className={det.bandi}>
            {items.map((item) => (
              <article
                key={item.title}
                className={`rv ${det.bando}${
                  item.open ? ` ${det.bandoHot} ${styles.hot}` : ''
                }`}
              >
                <div className={det.bandoMeta}>
                  <span
                    className={`${det.bandoStatus}${
                      item.open ? ` ${det.bandoOpen}` : ''
                    }`}
                  >
                    {item.statusLabel}
                  </span>
                  <span className={`mono ${det.bandoDate}`}>{item.date}</span>
                  <span className={`mono ${det.bandoType}`}>
                    {d.typeLabels[item.type as keyof typeof d.typeLabels]}
                  </span>
                </div>
                <div>
                  <h3 className={det.bandoTitle}>{item.title}</h3>
                  <p className={det.bandoText}>{item.text}</p>
                  <span className={det.bandoPer}>
                    {d.perLabel} {item.per}
                  </span>
                </div>
                {item.cta && item.href && (
                  <Button
                    href={localeHref(locale, item.href)}
                    className={`${styles.btnBn} ${styles.btnSm}`}
                  >
                    {item.cta}
                  </Button>
                )}
              </article>
            ))}
          </RevealGroup>
          <Reveal className={det.crossRow} delay={120}>
            <span>{d.crossText}</span>
            <ArrowLink href={localeHref(locale, '/academy/formazione-finanziata')}>
              {d.crossCta}
            </ArrowLink>
          </Reveal>
        </section>

        {/* ————— chiusura nera: avvisami quando esce un bando ————— */}
        <div className={`scheme-dark ${det.dark}`}>
          <section className={`wrap ${det.sez} ${det.duo}`}>
          <div>
            <Reveal as="h2" className={`display-thin ${det.ctaTitle}`}>
              {d.ctaTitle}
            </Reveal>
            <Reveal as="p" className={det.ctaText} delay={80}>
              {d.ctaText}
            </Reveal>
            <div className={det.mailRows}>
              {t.innovation.mailNotes.map((m) => (
                <a key={m.mail} className={det.mailRow} href={`mailto:${m.mail}`}>
                  <span className={det.mailAddr}>{m.mail}</span>
                  <span className={det.mailNote}>{m.note}</span>
                </a>
              ))}
              {settings?.phone && (
                <a
                  className={det.mailRow}
                  href={`tel:${settings.phone.replace(/\s/g, '')}`}
                >
                  <span className={det.mailAddr}>{settings.phone}</span>
                </a>
              )}
            </div>
          </div>
          {/* il form del mockup: mailto composto, tema preselezionato */}
          <Reveal delay={140}>
            <ContactForm
              to="hello@bologna-creativehub.it"
              subject={d.ctaTitle}
              topics={t.form.innovationTopics}
              defaultTopic={t.form.innovationTopics[3]}
              labels={{ ...t.form, topic: t.form.topicTalk }}
              privacyHref={localeHref(locale, '/privacy')}
                sendLabel={d.ctaWrite}
            />
          </Reveal>
          </section>
        </div>
      </main>
    </SiteChrome>
  )
}
