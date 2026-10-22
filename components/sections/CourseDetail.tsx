import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { CourseTemplateShell } from '@/components/mockup/CourseTemplateShell'
import { buildCourseHtml, css } from '@/components/mockup/templates/v3'
import { LessonScreen, lessonSeo } from '@/components/sections/LessonScreen'
import { SiteChrome, shopHref } from '@/components/sections/SiteChrome'
import type { Locale } from '@/lib/i18n/config'
import { localeHref } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { pageAlternates } from '@/lib/seo'
import { urlFor } from '@/lib/sanity/image'
import { l } from '@/lib/sanity/l'
import { getAllCourses, getCourseBySlug, getSiteSettings } from '@/lib/sanity/queries'
import type { CourseEntry, SanityImage } from '@/lib/sanity/types'

/**
 * La scheda corso — struttura approvata di corso-v3 (riunione Duessenza
 * 17/09) applicata a TUTTI i corsi: l'HTML viene generato dal builder del
 * template con i dati Sanity (hero, fatti, panoramica dal body, foto della
 * gallery nelle competenze, docenti).
 *
 * Vive qui perché la stessa scheda è servita da due URL: /academy/[slug]
 * per i corsi a catalogo e /academy/formazione-finanziata/[slug] per i
 * corsi finanziati, che stanno sotto la loro pagina di categoria. Il
 * `basePath` cambia solo il percorso canonico e quello dello chrome.
 */

/* dal PortableText del body ai paragrafi piani per la panoramica */
function paragraphs(blocks: unknown): string[] {
  if (!Array.isArray(blocks)) return []
  return blocks
    .filter(
      (b): b is { _type: string; style?: string; children?: { text?: string }[] } =>
        typeof b === 'object' &&
        b !== null &&
        (b as { _type?: string })._type === 'block' &&
        (!(b as { style?: string }).style ||
          (b as { style?: string }).style === 'normal'),
    )
    .map((b) => (b.children ?? []).map((c) => c.text ?? '').join('').trim())
    .filter(Boolean)
}

function imgUrl(
  image: SanityImage | undefined,
  w: number,
  h: number,
): string | undefined {
  return image?.asset
    ? urlFor(image).width(w).height(h).fit('crop').auto('format').quality(82).url()
    : undefined
}

/** title/description/alternates della scheda, dal corso in Sanity */
export async function courseDetailMetadata(
  locale: Locale,
  slug: string,
  basePath: string,
): Promise<Metadata> {
  const course = await getCourseBySlug(slug)
  /* lezioni su misura: title e description sono prescritti dai mockup
     (cluster Search Console), non derivati dal titolo del corso */
  const seo = course?.types?.includes('custom') ? lessonSeo(locale, slug) : null
  if (seo) {
    return {
      title: seo.title,
      description: seo.description,
      alternates: pageAlternates(locale, `${basePath}/${slug}`),
    }
  }
  const title = l(course?.title, locale)
  const description = l(course?.summary, locale)
  return title
    ? { title, description, alternates: pageAlternates(locale, `${basePath}/${slug}`) }
    : {}
}

export async function CourseDetail({
  locale,
  slug,
  basePath,
}: {
  locale: Locale
  slug: string
  /** percorso della pagina che ospita la scheda, senza locale */
  basePath: string
}) {
  const t = getDictionary(locale)
  const [course, settings] = await Promise.all([
    getCourseBySlug(slug),
    getSiteSettings(),
  ])
  if (!course) notFound()

  /* i corsi custom hanno la landing delle lezioni su misura (dai
     mockup v2), non la scheda universitaria */
  if (course.types?.includes('custom')) {
    const siblings = (await getAllCourses()).filter(
      (c) => c.types?.includes('custom') && c._id !== course._id
    )
    return (
      <LessonScreen
        course={course}
        siblings={siblings}
        settings={settings}
        locale={locale}
      />
    )
  }

  const gallery = course.gallery ?? []
  const title = l(course.title, locale) ?? slug

  /* corsi finanziati: fascia FSE+ (obbligo normativo) e form "Avvisami
     alla prossima edizione" al posto della candidatura — le iscrizioni
     aprono a bando. La dicitura dell'operazione è quella specifica del
     corso quando c'è, altrimenti quella generica del programma */
  const finanziato = course.types?.includes('finanziato') ?? false
  const DICITURE: Record<string, string> = {
    'music-data-analyst-and-strategist':
      'Operazione Rif. PA 2025-25412/RER/2, approvata con DGR n. 2030/2025 del 09/12/2025 e cofinanziata dal Fondo sociale europeo Plus (FSE+). Ente attuatore: MPDA Aps.',
  }
  const fundingTopic = t.topics.formazioneFinanziata.funding
  /* etichette della scheda finanziata (sottomenu, titoli delle due
     fisarmoniche, fatto "gratuito" della testata) */
  const scheda = t.finanziata.scheda

  /* voci titolo+testo delle sezioni editabili (fieldset "Scheda corso"):
     una voce senza né titolo né testo non arriva al template */
  const entries = (arr?: CourseEntry[]) => {
    const out = (arr ?? [])
      .map((it) => ({
        title: l(it.title, locale) ?? '',
        text: l(it.text, locale) ?? '',
      }))
      .filter((it) => it.title || it.text)
    return out.length ? out : undefined
  }

  const html = buildCourseHtml({
    eyebrow: finanziato
      ? t.avvisami.courseEyebrow
      : `Academy · ${l(course.category?.title, locale) ?? t.academy.kicker}`,
    title,
    sub: l(course.summary, locale) ?? '',
    courseLine: [title, l(course.level, locale)].filter(Boolean).join(' — '),
    meta: [
      /* il dato che apre la testata del mockup finanziati: il corso è
         gratuito perché lo paga il programma regionale FSE+ */
      ...(finanziato
        ? [{ label: scheda.costLabel, value: scheda.costValue }]
        : []),
      { label: t.common.duration, value: l(course.duration, locale) },
      { label: t.common.start, value: l(course.startDate, locale) },
      /* scadenza candidature (hero del mockup): solo se compilata */
      {
        label: t.common.deadline,
        value: l(course.applicationDeadline, locale),
      },
      { label: t.common.level, value: l(course.level, locale) },
      { label: t.common.language, value: l(course.language, locale) },
      { label: t.common.mode, value: l(course.mode, locale) },
    ].filter((m): m is { label: string; value: string } => Boolean(m.value)),
    heroImage: imgUrl(course.coverImage, 1600, 1200),
    /* a bando non si vende: niente carrello, la hero porta al form */
    secondaryCta: finanziato
      ? undefined
      : {
          label: t.common.bookOn,
          href: course.shopUrl ?? shopHref(settings),
        },
    funded: finanziato,
    year: finanziato ? '' : undefined,
    admissionsIntro: finanziato ? '' : undefined,
    admissionsNote: finanziato ? '' : undefined,
    statusBand: finanziato ? { text: t.avvisami.closedBand } : undefined,
    panoramica: paragraphs(l(course.body, locale)),
    panImage: imgUrl(gallery[0] ?? course.coverImage, 1200, 800),
    skillImages: gallery.length
      ? Array.from(
          { length: 6 },
          (_, i) => imgUrl(gallery[i % gallery.length], 900, 563)!,
        )
      : undefined,
    skillsLede: l(course.skillsLede, locale) ?? undefined,
    skills: entries(course.skills),
    structureIntro: l(course.structureIntro, locale)
      ?.split(/\n+/)
      .map((p) => p.trim())
      .filter(Boolean),
    structure: entries(course.structure),
    admissions: entries(course.admissions),
    /* mockup finanziati: "Chi può partecipare." tiene solo i requisiti,
       l'iscrizione vive in una sezione sua con la pillola di stato */
    admissionsTitle: finanziato ? scheda.admissionsTitle : undefined,
    skillsTitle: finanziato ? scheda.skillsTitle : undefined,
    primaryCta: finanziato
      ? { label: scheda.heroCta, href: '#avvisami' }
      : undefined,
    fundedNav: finanziato ? scheda.nav : undefined,
    enrollment:
      finanziato && entries(course.enrollment)
        ? {
            title: scheda.enrollmentTitle,
            items: entries(course.enrollment)!,
            status: course.editionStatus
              ? t.finanziata.status[course.editionStatus]
              : undefined,
          }
        : undefined,
    /* selezione pesata e rete del corso (mockup finanziati): le sezioni
       compaiono solo se compilate in Sanity */
    selectionLede: l(course.selectionLede, locale) ?? undefined,
    selection: (course.selection ?? [])
      .map((it) => ({
        weight: it.weight ?? '',
        title: l(it.title, locale) ?? '',
        text: l(it.text, locale) ?? '',
      }))
      .filter((it) => it.title || it.text),
    networkLede: l(course.networkLede, locale) ?? undefined,
    network: entries(course.network),
    faq: entries(course.faq),
    /* griglia docenti: il primo collegato in Sanity è il course leader;
       il template pubblica solo docenti con ruolo o bio reali e, se non
       ne resta nessuno, non renderizza la sezione */
    teachers: (course.teachers ?? [])
      .filter((tch) => tch?.name)
      .slice(0, 4)
      .map((tch) => ({
        name: tch.name as string,
        role: l(tch.role, locale) ?? '',
        cred: l(tch.bio, locale) ?? '',
        img: imgUrl(tch.photo, 800, 1000),
      })),
    funding: finanziato
      ? {
          logos: DICITURE[slug]
            ? [
                'Unione Europea',
                'Repubblica Italiana',
                'Regione Emilia-Romagna',
              ]
            : (fundingTopic?.logos ?? []),
          text: DICITURE[slug] ?? fundingTopic?.text ?? '',
        }
      : undefined,
    avvisami: finanziato
      ? {
          title: t.avvisami.titleCourse,
          lede: t.avvisami.ledeCourse,
          contacts: t.avvisami.contacts,
          interestsLegend: t.avvisami.interestsLegend,
          interests: t.avvisami.interests,
          name: t.avvisami.name,
          email: t.avvisami.email,
          phone: t.avvisami.phone,
          residence: t.avvisami.residence,
          residenceYes: t.avvisami.residenceYes,
          residenceOptions: t.avvisami.residenceOptions,
          submit: t.avvisami.submit,
          sending: t.avvisami.sending,
          notePrefix: t.avvisami.notePrefix,
          noteLink: t.avvisami.noteLink,
          noteSuffix: t.avvisami.noteSuffix,
          privacyHref: localeHref(locale, '/privacy'),
          missing: t.avvisami.missing,
          done: t.avvisami.done,
          error: t.avvisami.error,
        }
      : undefined,
  })

  return (
    <SiteChrome locale={locale} path={`${basePath}/${slug}`}>
      {/* l'h1 vero del template vive nello shadow DOM dello shell:
          per crawler e screen reader serve un h1 nel light DOM */}
      <h1 className="sr-only">{title}</h1>
      <CourseTemplateShell css={css} html={html} />
    </SiteChrome>
  )
}
