import type { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import {
  ArrowLink,
  Button,
  Reveal,
  RevealGroup,
  Rule,
} from '@/components/ui'
import { SiteChrome } from '@/components/sections/SiteChrome'
import { SectionPagesNav } from '@/components/sections/SectionPagesNav'
import { PointsAccordion } from '@/components/sections/PointsAccordion'
import { isLocale, localeHref } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { pageAlternates } from '@/lib/seo'
import { getPageById, getSiteSettings } from '@/lib/sanity/queries'
import { l } from '@/lib/sanity/l'
import studioRegiaBImg from '@/public/img/sections/studio-regia-b.jpg'
import podcastImg from '@/public/img/foto/podcast-cabina.avif'
import studioSslImg from '@/public/img/foto/studio-ssl.jpg'
import { ContactForm } from '@/components/sections/ContactForm'
import det from '@/components/sections/DetailPage.module.css'
import { StudioContacts } from '@/components/sections/StudioContacts'
import tp from '@/components/sections/TopicScreen.module.css'
import styles from './page.module.css'

export const dynamic = 'force-dynamic'

/* etichetta della Rule dal titolo di sezione: via il punto, tutto minuscolo
   (così resta giusta anche in inglese, senza chiavi dedicate) */
const kickerOf = (s: string) => s.replace(/\.+$/, '').toLowerCase()

type Block = {
  style?: string
  listItem?: string
  children?: { text?: string }[]
}

const textOf = (b: Block) =>
  (b.children ?? []).map((c) => c.text ?? '').join('').trim()

/* coppie titolo+testo (h3 seguito dal paragrafo): tengono solo le voci
   che hanno DAVVERO una risposta — un accordion vuoto è rotto */
const pairsOf = (blocks: Block[]) => {
  const out: { title: string; text: string }[] = []
  for (const b of blocks) {
    if (b.style === 'h3' || b.style === 'h4') {
      out.push({ title: textOf(b), text: '' })
    } else if (out.length && !out[out.length - 1].text) {
      out[out.length - 1].text = textOf(b)
    }
  }
  return out.filter((p) => p.title && p.text)
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
    title: t.studioSub.podcast.metaTitle,
    description: t.studioSub.podcast.metaDesc,
    alternates: pageAlternates(locale, '/studios/podcast'),
  }
}

export default async function PodcastPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const t = getDictionary(locale)
  const d = t.studioSub.podcast
  const [page, settings] = await Promise.all([
    getPageById('podcast'),
    getSiteSettings(),
  ])

  /* dal documento Sanity (v2): le tre schede, la cabina, la checklist,
     le domande frequenti — restano editabili dallo Studio, il dizionario
     fa da rete */
  const sec = (idx: number) =>
    ((l(page?.sections?.[idx]?.body, locale) ?? []) as Block[])
  const typesSan = pairsOf(sec(0)).map((p, i) => ({
    n: `vo.${String(i + 1).padStart(2, '0')}`,
    title: p.title,
    text: p.text,
  }))
  const types = typesSan.length ? typesSan : d.types
  const boothSan = sec(1).filter((b) => !b.listItem).map(textOf).filter(Boolean)
  const boothTexts = boothSan.length ? boothSan : [d.boothText1, d.boothText2]
  const prepBlocks = sec(2)
  const prepLede =
    textOf(prepBlocks.find((b) => !b.listItem) ?? {}) || d.prepLede
  const prepSan = prepBlocks.filter((b) => b.listItem).map(textOf).filter(Boolean)
  const prep = prepSan.length ? prepSan : d.prep
  const faq = pairsOf(sec(3))

  const email = t.studioSub.email
  const mailBook = `mailto:${email}?subject=${encodeURIComponent(d.book)}`

  return (
    <SiteChrome locale={locale} path="/studios/podcast">
      <main className={det.main}>
        {/* ————— testata: testo a sinistra, regia a destra ————— */}
        <header className={`wrap ${det.head}`}>
          <div className={det.headGrid}>
            <div>
              <Reveal className={det.back}>
                <ArrowLink href={localeHref(locale, '/studios')} reverse>
                  {t.studioSub.back}
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
              <RevealGroup className={det.facts}>
                {d.facts.map((f) => (
                  <span key={f.t} className={`rv ${det.fact}`}>
                    <span className={det.factT}>{f.t}</span>
                    <span className={det.factS}>{f.s}</span>
                  </span>
                ))}
              </RevealGroup>
              <Reveal className={det.heroRow} delay={120}>
                <Button variant="azzurro" href={mailBook} external>
                  {d.book}
                </Button>
              </Reveal>
            </div>
            <Reveal className={det.headPh} delay={120}>
              <Image
                src={podcastImg}
                alt="Microfono da studio con filtro anti-pop davanti alla cuffia, pronto per la registrazione di una voce"
                className={det.headImg}
                sizes="(max-width: 860px) 100vw, 50vw"
                priority
              />
            </Reveal>
          </div>
        </header>

        {/* ————— barra delle pagine di sezione (mockup) ————— */}
        <SectionPagesNav locale={locale} base="/studios" current="/studios/podcast" />

        {/* ————— cosa registri: le tre schede vo.01–03 ————— */}
        <Rule left="01" right={d.typesKicker} />
        <section className={`wrap ${det.sez}`}>
          <Reveal as="h2" className={`display-thin ${det.h2}`}>
            {d.typesTitle}
          </Reveal>
          <RevealGroup className={det.grid3}>
            {types.map((x) => (
              <div key={x.n} className={`rv ${tp.cell}`}>
                <span className={`mono ${styles.typeN}`}>{x.n}</span>
                <h3 className={`${tp.cellTitle} ${styles.typeTitle}`}>
                  {x.title}
                </h3>
                <p className={styles.typeText}>{x.text}</p>
              </div>
            ))}
          </RevealGroup>
        </section>

        {/* ————— la cabina: foto e due paragrafi ————— */}
        <Rule left="02" right={kickerOf(d.boothTitle)} />
        <section className={`wrap ${det.sez} ${det.duo}`}>
          <Reveal className={styles.boothPh}>
            <Image
              src={studioSslImg}
              alt="Mani sulla console SSL in regia"
              className={styles.boothImg}
              sizes="(max-width: 860px) 100vw, 40vw"
            />
          </Reveal>
          <div>
            <Reveal as="h2" className={`display-thin ${det.h2}`}>
              {d.boothTitle}
            </Reveal>
            {boothTexts.map((p, i) => (
              <Reveal as="p" key={p} className={tp.sezP} delay={60 + i * 60}>
                {p}
              </Reveal>
            ))}
          </div>
        </section>

        {/* ————— prima di venire: la checklist ————— */}
        <Rule left="03" right={kickerOf(d.prepTitle)} />
        <section className={`wrap ${det.sez}`}>
          <Reveal as="h2" className={`display-thin ${det.h2}`}>
            {d.prepTitle}
          </Reveal>
          <Reveal as="p" className={det.sezLede} delay={60}>
            {prepLede}
          </Reveal>
          <Reveal as="ul" className={det.check} delay={120}>
            {prep.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </Reveal>
        </section>

        {/* ————— domande frequenti: solo le coppie con risposta in Sanity ————— */}
        {faq.length > 0 && (
          <>
            <Rule left="04" right={kickerOf(d.faqTitle)} />
            <section className={`wrap ${det.sez} ${det.duo}`}>
              <Reveal as="h2" className={`display-thin ${det.h2}`}>
                {d.faqTitle}
              </Reveal>
              <PointsAccordion items={faq} plain />
            </section>
          </>
        )}

        {/* ————— chiusura: prenota la cabina ————— */}
        <div className={`scheme-dark ${det.dark}`}>
          <section className={`wrap ${det.sez} ${det.duo}`}>
            <div>
              <Reveal as="h2" className={`display-thin ${det.ctaTitle}`}>
                {d.ctaTitle}
              </Reveal>
              <Reveal as="p" className={det.ctaText} delay={80}>
                {d.ctaText}
              </Reveal>
              <StudioContacts
                email={email}
                phone={settings?.phone}
                notes={t.studioSub.notes}
              />
            </div>
            {/* il form del mockup: mailto composto, servizio preselezionato */}
            <Reveal delay={140}>
              <ContactForm
                to={email}
                subject={d.ctaTitle}
                topics={t.form.studioTopics}
                defaultTopic={t.form.studioTopics[4]}
                labels={{
                  ...t.form,
                  topic: t.form.topicNeed,
                  messagePlaceholder: t.form.messagePlaceholderStudio,
                }}
                privacyHref={localeHref(locale, '/privacy')}
                sendLabel={t.form.sendRequest}
                company={false}
              />
            </Reveal>
          </section>
        </div>
      </main>
    </SiteChrome>
  )
}
