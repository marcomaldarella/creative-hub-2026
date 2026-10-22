import Link from 'next/link'
import {
  Arrow,
  ArrowLink,
  Reveal,
  RevealGroup,
  Rule,
  SectionHeader,
} from '@/components/ui'
import {
  LESSON_FORM_ANCHOR,
  LessonForm,
  LessonPrefill,
  type LessonVariant,
} from '@/components/sections/LessonForm'
import { PointsAccordion } from '@/components/sections/PointsAccordion'
import { SiteChrome } from '@/components/sections/SiteChrome'
import { Thumb } from '@/components/sections/Thumb'
import { localeHref, type Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { urlFor } from '@/lib/sanity/image'
import { l } from '@/lib/sanity/l'
import type { Course, SiteSettings } from '@/lib/sanity/types'
import styles from './LessonScreen.module.css'

/* dal PortableText del body ai paragrafi piani */
function paragraphs(blocks?: unknown[] | null): string[] {
  if (!blocks) return []
  return (blocks as { _type?: string; children?: { text?: string }[] }[])
    .filter((b) => b._type === 'block')
    .map((b) => (b.children ?? []).map((c) => c.text ?? '').join('').trim())
    .filter(Boolean)
}

/**
 * SEO per corso delle lezioni su misura: i mockup prescrivono title e
 * description precisi (cluster Search Console) e, per basso e
 * produzione, anche un H1 che il pattern generico "Lezioni di {titolo}
 * a Bologna" non sa produrre ("basso elettrico", "produzione musicale
 * e Ableton"). Vive nel dizionario come la mappa uniExit: sono quattro
 * pagine fisse, non vale un campo Sanity in più per corso.
 */
export function lessonSeo(locale: Locale, slug: string) {
  const map = getDictionary(locale).lesson.seo as Record<
    string,
    { h1: string; title: string; description: string }
  >
  return map[slug] ?? null
}

/**
 * Landing delle lezioni su misura (dai mockup v2, nella grammatica del
 * sito): hero con badge e cover, metodo, insegnanti veri, cosa impari,
 * tre modi di studiare, come funziona, FAQ, altre lezioni e chiusura.
 * Tutto dai dati Sanity del corso: le sezioni vuote non compaiono.
 */
export function LessonScreen({
  course,
  siblings,
  settings,
  locale,
}: {
  course: Course
  /** gli altri corsi custom, per il nastro "altre lezioni" */
  siblings: Course[]
  settings: SiteSettings | null
  locale: Locale
}) {
  const t = getDictionary(locale)
  const title = l(course.title, locale) ?? ''
  const lede = l(course.summary, locale)
  const metodo = paragraphs(l(course.body, locale))
  const teachers = (course.teachers ?? []).filter((tc) => tc?.name)
  /* CTA "Prova con …": se il nome proprio è condiviso da più docenti
     (due Martina sul canto), si aggiunge l'iniziale del cognome */
  const firstNames = teachers.map(
    (tc) => (tc.name ?? '').trim().split(/\s+/)[0]
  )
  const tryName = (name?: string | null) => {
    const parts = (name ?? '').trim().split(/\s+/)
    const first = parts[0] ?? ''
    const shared = firstNames.filter((f) => f === first).length > 1
    return shared && parts[1] ? `${first} ${parts[1][0]}.` : first
  }
  const skills = (course.skills ?? [])
    .map((s) => ({ title: l(s.title, locale), text: l(s.text, locale) }))
    .filter((s) => s.title)
  const modi = (course.structure ?? [])
    .map((s) => ({ title: l(s.title, locale), text: l(s.text, locale) }))
    .filter((s) => s.title)
  const come = (course.admissions ?? [])
    .map((s) => ({ title: l(s.title, locale), text: l(s.text, locale) }))
    .filter((s) => s.title && s.text)
  const faq = (course.faq ?? [])
    .map((s) => ({ title: l(s.title, locale) ?? '', text: l(s.text, locale) ?? '' }))
    .filter((s) => s.title && s.text)
  const badges = (course.admissionsKeys ?? [])
    .map((k) => l(k, locale))
    .filter(Boolean) as string[]
  const modiIntro = l(course.structureIntro, locale)
  const academyPath = localeHref(locale, '/academy')
  const kick = (n: number, label: string) =>
    `${String(n).padStart(2, '0')} — ${label}`
  let n = 0

  const slugCur = course.slug?.current ?? ''
  /* opzioni "Da dove parti?" del form, per famiglia di corso */
  const variant: LessonVariant = slugCur.includes('canto')
    ? 'canto'
    : slugCur.includes('produzione')
      ? 'produzione'
      : 'strumento'
  const privacyHref = localeHref(locale, '/privacy')
  const form = (
    <LessonForm
      labels={t.lesson.form}
      variant={variant}
      courseTitle={title}
      courseSlug={slugCur}
      privacyHref={privacyHref}
    />
  )

  /* pacchetti prezzo (solo i corsi che li hanno in Sanity) */
  const packs = (course.packages ?? []).filter((p) => l(p.name, locale))
  const packTerms = (course.packagesTerms ?? [])
    .map((k) => l(k, locale))
    .filter(Boolean) as string[]

  /* uscita SEO verso il corso universitario omologo (note sviluppatore:
     non cannibalizzare la pagina universitaria) — mappa slug → corso.
     Gli strumenti portano a Creative Musicianship (indirizzo Strumento),
     la produzione a Urban Music Production. */
  const uniExitHrefs: Record<string, string> = {
    'corso-custom-produzione-musicale': '/academy/urban-music-production',
    'corso-custom-basso': '/academy/creative-musicianship',
    'corso-custom-chitarra': '/academy/creative-musicianship',
    'corso-custom-pianoforte-tastiere': '/academy/creative-musicianship',
  }
  const uniExitCopy = (
    t.lesson.uniExit as Record<string, { question: string; label: string }>
  )[slugCur]
  const uniExit =
    uniExitHrefs[slugCur] && uniExitCopy
      ? { href: localeHref(locale, uniExitHrefs[slugCur]), ...uniExitCopy }
      : null

  /* "Per chi sono le lezioni": le quattro card del mockup. Sulla
     produzione il mockup ne mostra tre (niente card genitore). */
  const audience = t.lesson.audience.items.filter(
    (a) => !(variant === 'produzione' && a.v === 'genitore')
  )
  /* "Cosa trovi alla nostra scuola": sei card, con la variante dell'aula
     dedicata ad Ableton per la produzione */
  const school =
    variant === 'produzione'
      ? t.lesson.school.itemsProduzione
      : t.lesson.school.items
  const schoolTitle =
    variant === 'produzione'
      ? t.lesson.school.titleProduzione
      : t.lesson.school.title

  /* sede: indirizzo da Sanity, mappa aperta su Google (nessun embed) */
  const address = settings?.address ?? 'Via del Tappezziere 4, 40138 Bologna'
  const mapHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `Creative Hub, ${address}`
  )}`

  /* H1 per corso quando il pattern generico non basta (basso elettrico,
     produzione + Ableton): vedi lessonSeo */
  const heroTitle =
    lessonSeo(locale, slugCur)?.h1 ||
    `${t.lesson.titlePrefix} ${title.toLowerCase()} ${t.lesson.titleSuffix}`

  return (
    <SiteChrome locale={locale} path={`/academy/${course.slug?.current ?? ''}`}>
      <main className={styles.main}>
        {/* ————— hero: testata azzurra, col form di prenotazione a
            fianco (è la CTA primaria della pagina, non un bottone che
            porta allo shop) ————— */}
        <header className={`wrap ${styles.head} ${styles.headDuo}`}>
          <div>
            <Reveal className={styles.back}>
              <ArrowLink href={academyPath} reverse>
                {t.lesson.back}
              </ArrowLink>
            </Reveal>
            <Reveal as="span" className={`mono ${styles.kicker}`} delay={60}>
              {t.lesson.kicker}
            </Reveal>
            <Reveal
              as="h1"
              className={`display-thin ${styles.title}`}
              delay={120}
            >
              {heroTitle}
            </Reveal>
            {lede && (
              <Reveal as="p" className={styles.lede} delay={180}>
                {lede}
              </Reveal>
            )}
            {badges.length > 0 && (
              <RevealGroup className={styles.badges}>
                {badges.map((b) => (
                  <span key={b} className={`rv ${styles.badge}`}>
                    {b}
                  </span>
                ))}
              </RevealGroup>
            )}
          </div>
          {/* l'ancora resta su questa istanza: i bottoni "Prova con…"
              e le card pacchetto prefillano e scrollano qui */}
          <Reveal id={LESSON_FORM_ANCHOR} className={styles.formSlot} delay={120}>
            {form}
          </Reveal>
        </header>

        {/* cover a tutto campo */}
        <Reveal className={styles.cover}>
          <Thumb image={course.coverImage} index={0} fill alt={title} />
        </Reveal>

        {/* ————— il metodo ————— */}
        {metodo.length > 0 && (
          <>
            <Rule left={String(++n).padStart(2, '0')} right={t.lesson.metodoKicker} />
            <section className={`wrap ${styles.sez} ${styles.duo}`}>
              <SectionHeader
                kicker={kick(n, t.lesson.metodoKicker)}
                title={t.lesson.metodoTitle}
              />
              <div>
                {metodo.map((p, i) => (
                  <Reveal as="p" key={p} delay={i * 60} className={styles.metodoP}>
                    {p}
                  </Reveal>
                ))}
              </div>
            </section>
          </>
        )}

        {/* ————— gli insegnanti (solo se collegati) ————— */}
        {teachers.length > 0 && (
          <div className={`scheme-dark ${styles.dark}`}>
            <Rule left={String(++n).padStart(2, '0')} right={t.lesson.teachersKicker} />
            <section className={`wrap ${styles.sez}`}>
              <SectionHeader
                kicker={kick(n, t.lesson.teachersKicker)}
                title={t.lesson.teachersTitle}
              />
              {/* i ritratti prefillano l'insegnante nel form e ci scrollano */}
              <RevealGroup className={styles.teacherGrid}>
                {teachers.map((tc) => (
                  <LessonPrefill
                    key={tc._id}
                    teacher={tc.name ?? ''}
                    className={`rv ${styles.teacher}`}
                    ariaLabel={`${t.lesson.teacherTry} ${tc.name}`}
                  >
                    <div className={styles.teacherPh}>
                      {tc.photo && (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={urlFor(tc.photo)
                            .width(400)
                            .height(500)
                            .fit('crop')
                            .auto('format')
                            .url()}
                          alt={tc.name ?? ''}
                          loading="lazy"
                        />
                      )}
                    </div>
                    <span className={styles.teacherName}>{tc.name}</span>
                    {l(tc.role, locale) && (
                      <span className={styles.teacherRole}>
                        {l(tc.role, locale)}
                      </span>
                    )}
                    {l(tc.bio, locale) && (
                      <span className={styles.teacherCred}>
                        {l(tc.bio, locale)}
                      </span>
                    )}
                    <span className={styles.teacherTry}>
                      {t.lesson.teacherTry} {tryName(tc.name)}{' '}
                      <Arrow size={11} />
                    </span>
                  </LessonPrefill>
                ))}
              </RevealGroup>
            </section>
          </div>
        )}

        {/* ————— per chi sono le lezioni: quattro card hairline ————— */}
        {audience.length > 0 && (
          <>
            <Rule
              left={String(++n).padStart(2, '0')}
              right={t.lesson.audience.kicker}
            />
            <section className={`wrap ${styles.sez}`}>
              <SectionHeader
                kicker={kick(n, t.lesson.audience.kicker)}
                title={t.lesson.audience.title}
                lede={t.lesson.audience.lede}
              />
              <RevealGroup className={styles.aud}>
                {audience.map((a) => (
                  <div key={a.v} className={`rv ${styles.audCard}`}>
                    <span className={`mono ${styles.cellNum}`}>{a.kicker}</span>
                    <h3 className={styles.cellTitle}>{a.title}</h3>
                    <p className={styles.cellText}>{a.text}</p>
                  </div>
                ))}
              </RevealGroup>
            </section>
          </>
        )}

        {/* ————— cosa trovi alla nostra scuola: sei card su tre colonne ————— */}
        {school.length > 0 && (
          <>
            <Rule
              left={String(++n).padStart(2, '0')}
              right={t.lesson.school.kicker}
            />
            <section className={`wrap ${styles.sez}`}>
              <SectionHeader
                kicker={kick(n, t.lesson.school.kicker)}
                title={schoolTitle}
                lede={t.lesson.school.lede}
              />
              <RevealGroup className={styles.cells}>
                {school.map((s, i) => (
                  <div key={s.title} className={`rv ${styles.cell}`}>
                    <span className={`mono ${styles.cellNum}`}>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <h3 className={styles.cellTitle}>{s.title}</h3>
                    <p className={styles.cellText}>{s.text}</p>
                  </div>
                ))}
              </RevealGroup>
            </section>
          </>
        )}

        {/* ————— cosa impari ————— */}
        {skills.length > 0 && (
          <>
            <Rule left={String(++n).padStart(2, '0')} right={t.lesson.skillsKicker} />
            <section className={`wrap ${styles.sez}`}>
              <SectionHeader
                kicker={kick(n, t.lesson.skillsKicker)}
                title={l(course.skillsLede, locale) ?? ''}
              />
              <RevealGroup className={styles.cells}>
                {skills.map((s, i) => (
                  <div key={s.title} className={`rv ${styles.cell}`}>
                    <span className={`mono ${styles.cellNum}`}>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <h3 className={styles.cellTitle}>{s.title}</h3>
                    {s.text && <p className={styles.cellText}>{s.text}</p>}
                  </div>
                ))}
              </RevealGroup>
            </section>
          </>
        )}

        {/* ————— tre modi di studiare ————— */}
        {modi.length > 0 && (
          <>
            <Rule left={String(++n).padStart(2, '0')} right={t.lesson.modiKicker} />
            <section className={`wrap ${styles.sez} ${styles.duo}`}>
              <SectionHeader
                kicker={kick(n, t.lesson.modiKicker)}
                title={t.lesson.modiTitle}
                lede={modiIntro ?? undefined}
              />
              <div className={styles.modi}>
                {modi.map((m) => (
                  <Reveal key={m.title} className={styles.modo}>
                    <h3 className={styles.cellTitle}>{m.title}</h3>
                    <p className={styles.cellText}>{m.text}</p>
                  </Reveal>
                ))}
              </div>
            </section>
          </>
        )}

        {/* ————— come funziona: passi numerati ————— */}
        {come.length > 0 && (
          <>
            <Rule left={String(++n).padStart(2, '0')} right={t.lesson.comeKicker} />
            <section className={`wrap ${styles.sez} ${styles.duo}`}>
              <SectionHeader
                kicker={kick(n, t.lesson.comeKicker)}
                title={t.lesson.comeTitle}
              />
              <div className={styles.steps}>
                {come.map((s, i) => (
                  <div key={s.title} className={styles.step}>
                    <span className={`mono ${styles.cellNum}`}>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <h3 className={styles.stepTitle}>{s.title}</h3>
                    <p className={styles.cellText}>{s.text}</p>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        {/* ————— pacchetti e prezzi (solo se il corso li ha) ————— */}
        {packs.length > 0 && (
          <>
            <Rule
              left={String(++n).padStart(2, '0')}
              right={t.lesson.packages.kicker}
            />
            <section className={`wrap ${styles.sez}`}>
              <SectionHeader
                kicker={kick(n, t.lesson.packages.kicker)}
                title={t.lesson.packages.title}
                lede={t.lesson.packages.lede}
              />
              <RevealGroup className={styles.packs}>
                {packs.map((p) => (
                  <div
                    key={p._key ?? l(p.name, locale)}
                    className={`rv ${styles.pack} ${!p.plan ? styles.packFree : ''}`}
                  >
                    {l(p.badge, locale) && (
                      <span className={`mono ${styles.packBadge}`}>
                        {l(p.badge, locale)}
                      </span>
                    )}
                    <h3 className={styles.packName}>{l(p.name, locale)}</h3>
                    <p className={styles.packPrice}>
                      {p.price}
                      {l(p.per, locale) && (
                        <span className={styles.packPer}>
                          {' '}
                          {l(p.per, locale)}
                        </span>
                      )}
                    </p>
                    {l(p.unitNote, locale) && (
                      <p className={styles.packUnit}>{l(p.unitNote, locale)}</p>
                    )}
                    {l(p.note, locale) && (
                      <p className={styles.packNote}>{l(p.note, locale)}</p>
                    )}
                    {(p.features ?? []).length > 0 && (
                      <ul className={styles.packList}>
                        {(p.features ?? []).map((f) => (
                          <li key={f._key ?? l(f, locale)}>{l(f, locale)}</li>
                        ))}
                      </ul>
                    )}
                    <LessonPrefill plan={p.plan ?? ''} className={styles.packCta}>
                      {p.plan
                        ? `${t.lesson.packages.ctaPlanPrefix} ${p.plan}`
                        : t.lesson.packages.ctaFree}
                    </LessonPrefill>
                  </div>
                ))}
              </RevealGroup>
              {packTerms.length > 0 && (
                <Reveal as="p" className={styles.packTerms}>
                  {packTerms.join(' · ')}
                </Reveal>
              )}
            </section>
          </>
        )}

        {/* ————— faq ————— */}
        {faq.length > 0 && (
          <>
            <Rule left={String(++n).padStart(2, '0')} right={t.lesson.faqKicker} />
            <section className={`wrap ${styles.sez} ${styles.duo}`}>
              <SectionHeader
                kicker={kick(n, t.lesson.faqKicker)}
                title={t.lesson.faqTitle}
              />
              <PointsAccordion items={faq} />
            </section>
          </>
        )}

        {/* ————— altre lezioni su misura ————— */}
        {siblings.length > 0 && (
          <>
            <Rule left={String(++n).padStart(2, '0')} right={t.lesson.othersKicker} />
            <section className={`wrap ${styles.sez}`}>
              <SectionHeader
                kicker={kick(n, t.lesson.othersKicker)}
                title={t.lesson.othersTitle}
              />
              <RevealGroup className={styles.others}>
                {siblings.map((c) => (
                  <Link
                    key={c._id}
                    href={`${academyPath}/${c.slug?.current ?? ''}`}
                    className={`rv ${styles.other}`}
                  >
                    {l(c.title, locale)}
                  </Link>
                ))}
              </RevealGroup>
            </section>
          </>
        )}

        {/* ————— la scuola a Bologna: SEO locale. Solo dati confermati:
            gli orari di segreteria del mockup sono un giallo da validare
            e restano fuori ————— */}
        <Rule left={String(++n).padStart(2, '0')} right={t.lesson.sede.kicker} />
        <section className={`wrap ${styles.sez} ${styles.duo}`}>
          <SectionHeader
            kicker={kick(n, t.lesson.sede.kicker)}
            title={t.lesson.sede.title}
            lede={t.lesson.sede.lede}
          />
          <Reveal className={styles.defs}>
            <div className={styles.def}>
              <span className={styles.defLabel}>
                {t.lesson.sede.addressLabel}
              </span>
              <span className={styles.defText}>{address}</span>
            </div>
            {settings?.phone && (
              <div className={styles.def}>
                <span className={styles.defLabel}>
                  {t.lesson.sede.phoneLabel}
                </span>
                <a
                  className={styles.defText}
                  href={`tel:${settings.phone.replace(/\s/g, '')}`}
                >
                  {settings.phone}
                </a>
              </div>
            )}
            <div className={styles.mapLink}>
              <ArrowLink href={mapHref} external>
                {t.lesson.sede.mapLabel}
              </ArrowLink>
            </div>
          </Reveal>
        </section>

        {/* ————— ponte al corso universitario omologo ————— */}
        {uniExit && (
          <>
            <Rule
              left={String(++n).padStart(2, '0')}
              right={t.lesson.uniSectionKicker}
            />
            <section className={`wrap ${styles.sez} ${styles.duo}`}>
              <SectionHeader
                kicker={kick(n, t.lesson.uniSectionKicker)}
                title={t.lesson.uniSectionTitle}
              />
              <Reveal className={styles.uniExit}>
                <p className={styles.uniExitQ}>{uniExit.question}</p>
                <ArrowLink href={uniExit.href}>{uniExit.label}</ArrowLink>
              </Reveal>
            </section>
          </>
        )}

        {/* ————— chiusura: fascia nera col form al posto del bottone shop ————— */}
        <div className={`scheme-dark ${styles.dark}`}>
          <section className={`wrap ${styles.sez} ${styles.ctaSez} ${styles.ctaDuo}`}>
            <div>
              <Reveal as="h2" className={`display-thin ${styles.ctaTitle}`}>
                {t.lesson.ctaTitle}
              </Reveal>
              <Reveal as="p" className={styles.ctaText} delay={80}>
                {t.lesson.ctaText}
              </Reveal>
              {/* i tre passi del mockup: cosa succede dopo l'invio */}
              <Reveal as="p" className={styles.ctaStepsLede} delay={120}>
                {t.lesson.ctaSteps.lede}
              </Reveal>
              <RevealGroup as="ol" className={styles.ctaSteps}>
                {t.lesson.ctaSteps.items.map((s, i) => (
                  <li key={s} className="rv">
                    <span className={`mono ${styles.ctaStepNum}`}>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span>{s}</span>
                  </li>
                ))}
              </RevealGroup>
              {settings?.phone && (
                <Reveal delay={160}>
                  <ArrowLink
                    href={`tel:${settings.phone.replace(/\s/g, '')}`}
                    external
                  >
                    {settings.phone}
                  </ArrowLink>
                </Reveal>
              )}
            </div>
            <Reveal delay={120}>{form}</Reveal>
          </section>
        </div>
      </main>
    </SiteChrome>
  )
}
