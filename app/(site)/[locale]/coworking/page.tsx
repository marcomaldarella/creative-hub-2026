import type { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { Button, Card, Reveal, Rule, SectionHeader } from '@/components/ui'
import { SiteChrome, shopHref } from '@/components/sections/SiteChrome'
import { PhotoDuo } from '@/components/sections/Photo'
import { PhotoStrip } from '@/components/sections/PhotoStrip'
import { isLocale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { getSiteSettings, getSpacesByKind } from '@/lib/sanity/queries'
import { l } from '@/lib/sanity/l'
import corridoio1Img from '@/public/img/foto/corridoio-1.jpg'
import corridoio2Img from '@/public/img/foto/corridoio-2.jpg'
import corridoio3Img from '@/public/img/foto/corridoio-3.jpg'
import corridoio4Img from '@/public/img/foto/corridoio-4.jpg'
import corridoio5Img from '@/public/img/foto/corridoio-5.jpg'
import corridoio6Img from '@/public/img/foto/corridoio-6.jpg'
import corridoio7Img from '@/public/img/foto/corridoio-7.jpg'
import banano1Img from '@/public/img/foto/banano-1.jpg'
import banano2Img from '@/public/img/foto/banano-2.jpg'
import styles from './page.module.css'

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const t = getDictionary(locale)
  return { title: t.nav.coworking, description: t.coworking.lede }
}

export default async function CoworkingPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const t = getDictionary(locale)

  const [spaces, settings] = await Promise.all([
    getSpacesByKind('coworking'),
    getSiteSettings(),
  ])

  return (
    <SiteChrome locale={locale} path="/coworking">
      <main className={styles.main}>
        {/* ————— hero: stessa grammatica di /studios — foto viva a filo
            in alto a sx, testi a dx ————— */}
        <header className={styles.head}>
          <Reveal className={styles.headMedia}>
            <Image
              src="/img/sections/coworking-lounge.jpg"
              alt="La lounge del coworking: sedute e grafiche geometriche alle pareti"
              width={1800}
              height={1350}
              priority
              className={styles.headImg}
            />
          </Reveal>
          <div className={styles.headText}>
            <Reveal as="span" className={`mono ${styles.kicker}`}>
              {t.coworking.kicker}
            </Reveal>
            <Reveal as="h1" className={`display-thin ${styles.title}`} delay={80}>
              {t.coworking.title}
            </Reveal>
            <Reveal as="p" className={styles.lede} delay={160}>
              {t.coworking.lede}
            </Reveal>
          </div>
        </header>

        <Rule left={t.coworking.kicker} right={t.coworking.spacesKicker} />


        {/* ————— gli spazi ————— */}
        <section className={styles.sez} id="coworking">
          <div className="wrap">
            <SectionHeader
              kicker={t.coworking.spacesKicker}
              title={t.coworking.spacesTitle}
            />
            <div className={styles.spaces}>
              {spaces.map((space, i) => (
                <Reveal key={space._id} delay={(i % 3) * 60}>
                  <Card
                    kicker={`cw.0${i + 1}`}
                    title={l(space.title, locale)}
                    className={styles.spaceCard}
                  >
                    <p className={styles.spaceSummary}>
                      {l(space.summary, locale)}
                    </p>
                    {space.features && space.features.length > 0 && (
                      <ul className={`mono ${styles.features}`}>
                        {space.features.map((f) => (
                          <li key={f._key}>{l(f, locale)?.toLowerCase()}</li>
                        ))}
                      </ul>
                    )}
                  </Card>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ————— gli spazi, dal vivo: banda a due colonne come /studios ————— */}
        <section className={styles.photoDuo} aria-label="Gli spazi del coworking">
          <Image
            src="/img/sections/future-together.jpg"
            alt='Il corridoio con il murale "future together" e le sedute blu'
            width={1800}
            height={1350}
            className={styles.duoImg}
          />
          <Image
            src="/img/sections/designing-the.jpg"
            alt='La parete gialla "designing the future" lungo il corridoio'
            width={1800}
            height={1350}
            className={styles.duoImg}
          />
        </section>

        {/* ————— i corridoi: nastro di foto a filo di pagina ————— */}
        <section className={styles.sez}>
          <PhotoStrip
            kicker={t.coworking.corridoiKicker}
            title={t.coworking.corridoiTitle}
            text={t.coworking.corridoiText}
            labels={{
              prev: t.coworking.corridoiPrev,
              next: t.coworking.corridoiNext,
              hint: t.coworking.corridoiHint,
            }}
            photos={[
              { src: corridoio1Img, alt: 'Corridoio delle aule CW301 con segnaletica gialla a pavimento e pareti' },
              { src: corridoio2Img, alt: "Ingresso dell'area CW300: pareti bianche, segnaletica gialla e parquet" },
              { src: corridoio3Img, alt: 'Murale "future together" lungo il corridoio, con una pianta in primo piano' },
              { src: corridoio4Img, alt: 'Scala interna con il murale "small steps big change" su parete arancio' },
              { src: corridoio5Img, alt: "Porta dell'ufficio segreteria vista dal corridoio" },
              { src: corridoio6Img, alt: 'Corridoio lungo verso gli uffici, con la targa della segreteria' },
              { src: corridoio7Img, alt: 'Corridoio della library, con la scritta arancio sulla parete scura' },
            ]}
          />
        </section>

        {/* ————— la banano room: due quadrate affiancate ————— */}
        <section className={styles.sez}>
          <div className="wrap">
            <PhotoDuo
              kicker={t.coworking.bananoKicker}
              title={t.coworking.bananoTitle}
              text={t.coworking.bananoText}
              photos={[
                {
                  src: banano1Img,
                  alt: 'La banano room del coworking: tavolo rotondo, sedute in velluto e luci calde',
                },
                {
                  src: banano2Img,
                  alt: "La banano room vista d'insieme: soffitto industriale, grande banano al centro e divani",
                },
              ]}
            />
          </div>
        </section>

        {/* ————— cta day pass (azzurro) ————— */}
        <section className={`${styles.sez} ${styles.cta}`} id="prenota">
          <div className={`wrap ${styles.ctaIn}`}>
            <div>
              <span className={`mono ${styles.ctaKicker}`}>
                {t.coworking.ctaKicker}
              </span>
              <h2 className={`display-thin ${styles.ctaTitle}`}>
                {t.coworking.ctaTitle}
              </h2>
              <p className={styles.ctaText}>{t.coworking.ctaText}</p>
            </div>
            <Button href={shopHref(settings)} external>
              {t.coworking.ctaDayPass}
            </Button>
          </div>
        </section>
      </main>
    </SiteChrome>
  )
}
