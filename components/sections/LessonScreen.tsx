import Link from 'next/link'
import {
  ArrowLink,
  Marquee,
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
import {
  LessonTeachers,
  type LessonTeacher,
} from '@/components/sections/LessonTeachers'
import { SiteChrome } from '@/components/sections/SiteChrome'
import { UniSubnav } from '@/components/sections/UniSubnav'
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
 * sito): testata con badge e form, metodo, slider insegnanti, cosa
 * impari, tre modi di studiare, come funziona, FAQ, altre lezioni e
 * chiusura.
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
  /* iniziali per il ritratto mancante: "Alberto Bergonzoni" → AB */
  const initials = (name?: string | null) =>
    (name ?? '')
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() ?? '')
      .join('')
  /* gli insegnanti già risolti per lo slider (client): niente oggetti
     Sanity oltre il confine, solo stringhe e URL */
  const teacherItems: LessonTeacher[] = teachers.map((tc) => ({
    id: tc._id,
    name: tc.name ?? '',
    short: tryName(tc.name),
    role: l(tc.role, locale) ?? '',
    bio: l(tc.bio, locale) ?? '',
    initials: initials(tc.name),
    photo: tc.photo?.asset
      ? urlFor(tc.photo).width(1200).height(900).fit('crop').auto('format').url()
      : '',
    video: tc.videoUrl ?? '',
  }))

  const slugNow = course.slug?.current ?? ''
  const facesTpl =
    (t.lesson.facesBySlug as Record<string, string>)[slugNow] ??
    t.lesson.facesLine
  const facesLine = facesTpl.replace(
    '{n}',
    t.lesson.numbers[teachers.length] ?? String(teachers.length),
  )
  /* "i nostri insegnanti hanno suonato con": solo dove il cliente ha
     dato i crediti (nel mockup ce l'ha la chitarra) */
  const credits =
    (t.lesson.creditsBySlug as Record<string, string[]>)[slugNow] ?? []
  /* su basso e pianoforte il nastro non porta collaborazioni ma gli
     stili suonabili: cambia anche la testa della fascia */
  const creditsLabel =
    (t.lesson.creditsLabelBySlug as Record<string, string>)[slugNow] ??
    t.lesson.creditsLabel

  const academyPath = localeHref(locale, '/academy')
  /* il tasto indietro riporta all'indice delle lezioni su misura, non
     all'academy intera (richiesta cliente) */
  const indicePath = localeHref(locale, '/academy/corsi-custom')
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

  /* "Per chi sono le lezioni": le quattro card del mockup. Sulla
     produzione il mockup ne mostra tre (niente card genitore) e sul
     canto la sezione non c'è proprio. */
  const audience =
    variant === 'canto'
      ? []
      : t.lesson.audience.items.filter(
          (a) => !(variant === 'produzione' && a.v === 'genitore')
        )
  /* "Cosa trovi alla nostra scuola": sei card scritte per strumento dove
     il mockup le differenzia (canto, chitarra, pianoforte), l'aula
     Ableton sulla produzione, il testo generico altrove */
  const schoolBySlug = t.lesson.school.itemsBySlug as Record<
    string,
    { title: string; text: string }[]
  >
  const school =
    schoolBySlug[slugCur] ??
    (variant === 'produzione'
      ? t.lesson.school.itemsProduzione
      : t.lesson.school.items)
  const schoolTitle =
    variant === 'produzione'
      ? t.lesson.school.titleProduzione
      : t.lesson.school.title

  /* pacchetti prezzo (solo i corsi che li hanno in Sanity) */
  const packs = (course.packages ?? []).filter((p) => l(p.name, locale))
  const packTerms = (course.packagesTerms ?? [])
    .map((k) => l(k, locale))
    .filter(Boolean) as string[]

  /* voci dell'indice sticky: solo le sezioni che la pagina rende
     davvero (un corso senza docenti o senza prezzi non le elenca) */
  const navItems = [
    metodo.length > 0 && { id: 'metodo', label: t.lesson.metodoKicker },
    teachers.length > 0 && { id: 'docenti', label: t.lesson.teachersKicker },
    audience.length > 0 && { id: 'per-chi', label: t.lesson.audience.kicker },
    skills.length > 0 && { id: 'impari', label: t.lesson.skillsKicker },
    modi.length > 0 && { id: 'modi', label: t.lesson.modiKicker },
    come.length > 0 && { id: 'come', label: t.lesson.comeKicker },
    packs.length > 0 && { id: 'prezzi', label: t.lesson.packages.kicker },
    faq.length > 0 && { id: 'faq', label: t.lesson.faqKicker },
    { id: LESSON_FORM_ANCHOR, label: t.lesson.bookKicker },
  ].filter(Boolean) as { id: string; label: string }[]

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

  /* la riga di chip sotto "cosa impari": stili per gli strumenti,
     software per la produzione — il canto non ne ha */
  const chips = (
    t.lesson.styles.bySlug as Record<
      string,
      { label: string; items: string[] }
    >
  )[slugCur]

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
              <ArrowLink href={indicePath} reverse>
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
            {/* la fila degli insegnanti del mockup: ritratto dove c'è,
                altrimenti le iniziali come nel layout del cliente */}
            {teachers.length > 0 && (
              <Reveal className={styles.faces} delay={220}>
                <div className={styles.facesRow}>
                  {teachers.map((tc) => {
                    const photo = tc.photo?.asset
                      ? urlFor(tc.photo).width(120).height(120).fit('crop').url()
                      : null
                    return (
                      <span
                        key={tc._id ?? tc.name}
                        className={styles.face}
                        title={tc.name ?? ''}
                      >
                        {photo ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img src={photo} alt="" className={styles.faceImg} />
                        ) : (
                          initials(tc.name)
                        )}
                      </span>
                    )
                  })}
                </div>
                <p className={styles.facesLine}>{facesLine}</p>
              </Reveal>
            )}
          </div>
          {/* l'ancora resta su questa istanza: i bottoni "Prova con…"
              e le card pacchetto prefillano e scrollano qui */}
          <Reveal id={LESSON_FORM_ANCHOR} className={styles.formSlot} delay={120}>
            {form}
          </Reveal>
        </header>

        {/* "i nostri insegnanti hanno suonato con": la fascia di prova
            del mockup, con i crediti veri dove il cliente li ha dati */}
        {credits.length > 0 && (
          <div className={`scheme-dark ${styles.credits}`}>
            <span className={`mono ${styles.creditsLabel}`}>
              {creditsLabel}
            </span>
            <Marquee
              speed={34}
              items={credits.map((c) => (
                <span key={c} className={styles.credit}>
                  {c}
                </span>
              ))}
            />
          </div>
        )}

        {/* indice sticky delle sezioni, come sulla landing universitari */}
        {navItems.length > 2 && (
          <UniSubnav
            course={title}
            year={badges[0] ?? ''}
            items={navItems}
            prevLabel={t.lesson.navPrev}
            nextLabel={t.lesson.navNext}
            tone="dark"
          />
        )}

        {/* niente banda media sotto la barra sticky: dalla testata col
            form si entra dritti nel contenuto (richiesta cliente) */}

        {/* ————— il metodo ————— */}
        {metodo.length > 0 && (
          <>
            <Rule left={String(++n).padStart(2, '0')} right={t.lesson.metodoKicker} />
            <section id="metodo" className={`wrap ${styles.sez} ${styles.duo}`}>
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
            <section id="docenti" className={`wrap ${styles.sez}`}>
              <SectionHeader
                kicker={kick(n, t.lesson.teachersKicker)}
                title={t.lesson.teachersTitle}
              />
              {/* uno alla volta: pillole coi nomi, contatore sul numero
                  vero di insegnanti e ritratto che, se c'è un video in
                  Sanity, parte al clic */}
              <Reveal>
                <LessonTeachers
                  items={teacherItems}
                  labels={{
                    prev: t.lesson.teachersNav.prev,
                    next: t.lesson.teachersNav.next,
                    group: t.lesson.teachersNav.group,
                    play: t.lesson.teachersNav.play,
                    try: t.lesson.teacherTry,
                  }}
                />
              </Reveal>
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
            <section id="per-chi" className={`wrap ${styles.sez}`}>
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
            <section id="scuola" className={`wrap ${styles.sez}`}>
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
            <section id="impari" className={`wrap ${styles.sez}`}>
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
              {chips && (
                <Reveal className={styles.chips}>
                  <span className={`mono ${styles.chipsLabel}`}>
                    {chips.label}
                  </span>
                  {chips.items.map((c) => (
                    <span key={c} className={styles.chip}>
                      {c}
                    </span>
                  ))}
                </Reveal>
              )}
            </section>
          </>
        )}

        {/* ————— tre modi di studiare ————— */}
        {modi.length > 0 && (
          <>
            <Rule left={String(++n).padStart(2, '0')} right={t.lesson.modiKicker} />
            {/* titolo in alto a tutta larghezza e tre card piene sotto:
                le voci respirano come nelle altre sezioni a griglia */}
            <section id="modi" className={`wrap ${styles.sez}`}>
              <SectionHeader
                kicker={kick(n, t.lesson.modiKicker)}
                title={t.lesson.modiTitle}
                lede={modiIntro ?? undefined}
              />
              <RevealGroup className={styles.modi}>
                {modi.map((m, i) => (
                  <div key={m.title} className={`rv ${styles.modo}`}>
                    <span className={`mono ${styles.cellNum}`}>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <h3 className={styles.modoTitle}>{m.title}</h3>
                    {m.text && <p className={styles.cellText}>{m.text}</p>}
                  </div>
                ))}
              </RevealGroup>
            </section>
          </>
        )}

        {/* ————— come funziona: passi numerati ————— */}
        {come.length > 0 && (
          <>
            <Rule left={String(++n).padStart(2, '0')} right={t.lesson.comeKicker} />
            <section id="come" className={`wrap ${styles.sez} ${styles.duo}`}>
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
            <section id="prezzi" className={`wrap ${styles.sez}`}>
              <SectionHeader
                kicker={kick(n, t.lesson.packages.kicker)}
                title={t.lesson.packages.title}
                lede={t.lesson.packages.lede}
              />
              <RevealGroup className={styles.packs}>
                {packs.map((p, pi) => (
                  <div
                    key={p._key ?? l(p.name, locale)}
                    /* come nel mockup: la prova si stacca col bordo pieno,
                       la formula più completa è la card nera */
                    className={[
                      'rv',
                      styles.pack,
                      !p.plan ? styles.packFree : '',
                      p.plan && pi === packs.length - 1
                        ? `scheme-dark ${styles.packHi}`
                        : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
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

        {/* ————— faq ————— */}
        {faq.length > 0 && (
          <>
            <Rule left={String(++n).padStart(2, '0')} right={t.lesson.faqKicker} />
            <section id="faq" className={`wrap ${styles.sez} ${styles.duo}`}>
              <SectionHeader
                kicker={kick(n, t.lesson.faqKicker)}
                title={t.lesson.faqTitle}
              />
              {/* sulle lezioni su misura le risposte sono brevi: solo
                  testo, niente foto nel pannello (richiesta cliente) */}
              <PointsAccordion items={faq} plain />
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
