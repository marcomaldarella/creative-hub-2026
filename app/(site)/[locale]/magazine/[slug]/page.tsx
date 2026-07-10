import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLink, Rule, SectionHeader, RevealGroup } from '@/components/ui'
import { ArticleCard } from '@/components/magazine/ArticleCard'
import { SiteChrome } from '@/components/sections/SiteChrome'
import { MagazinePortable } from '@/components/magazine/MagazinePortable'
import {
  categoryHref,
  formatDate,
  gradientIndex,
} from '@/components/magazine/helpers'
import gradients from '@/components/magazine/gradients.module.css'
import { isLocale, localeHref } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { l } from '@/lib/sanity/l'
import { urlFor } from '@/lib/sanity/image'
import {
  getAllArticles,
  getArticleBySlug,
  getArticlesByCategory,
} from '@/lib/sanity/queries'
import type { Article } from '@/lib/sanity/types'
import styles from './Article.module.css'

export const dynamic = 'force-dynamic'

type Params = Promise<{ locale: string; slug: string }>

const gradientClasses = [gradients.g0, gradients.g1, gradients.g2]

export async function generateMetadata({
  params,
}: {
  params: Params
}): Promise<Metadata> {
  const { locale, slug } = await params
  if (!isLocale(locale)) return {}
  const article = await getArticleBySlug(slug)
  if (!article) return {}
  return {
    title: l(article.title, locale),
    description: l(article.excerpt, locale),
  }
}

/** 3 articoli correlati: stessa (prima) categoria, escluso il corrente;
 *  se non bastano, completa con gli ultimi articoli. */
async function getRelated(article: Article): Promise<Article[]> {
  const categorySlug = article.categories?.[0]?.slug?.current
  const sameCategory = categorySlug
    ? await getArticlesByCategory(categorySlug)
    : []
  const related = sameCategory.filter((a) => a._id !== article._id).slice(0, 3)

  if (related.length < 3) {
    const latest = await getAllArticles()
    for (const a of latest) {
      if (related.length >= 3) break
      if (a._id === article._id) continue
      if (related.some((r) => r._id === a._id)) continue
      related.push(a)
    }
  }

  return related
}

export default async function ArticlePage({ params }: { params: Params }) {
  const { locale, slug } = await params
  if (!isLocale(locale)) notFound()
  const t = getDictionary(locale)

  const article = await getArticleBySlug(slug)
  if (!article) notFound()

  const related = await getRelated(article)

  const title = l(article.title, locale)
  const excerpt = l(article.excerpt, locale)
  const body = l(article.body, locale)
  const date = formatDate(article.publishedAt, locale)
  const author = article.author

  const coverUrl = article.coverImage?.asset
    ? urlFor(article.coverImage).width(1800).height(1013).fit('crop').url()
    : undefined

  const authorPhotoUrl = author?.photo?.asset
    ? urlFor(author.photo).width(120).height(120).fit('crop').url()
    : undefined

  return (
    <SiteChrome locale={locale} path={`/magazine/${slug}`}>
      <main className={styles.main}>
        <article>
          <header className={`wrap ${styles.header}`}>
            <span className={`mono ${styles.kicker}`}>
              {article.categories?.map((category, i) => {
                const catTitle = l(category.title, locale)
                if (!catTitle) return null
                return (
                  <span key={category._id}>
                    {i > 0 && ' · '}
                    <Link href={categoryHref(category, locale)}>
                      {catTitle.toLowerCase()}
                    </Link>
                  </span>
                )
              })}
              {date && <span>{article.categories?.length ? ' — ' : ''}{date}</span>}
            </span>

            <h1 className={styles.title}>{title}</h1>

            {author?.name && (
              <div className={styles.author}>
                <span
                  className={`${styles.authorPhoto} ${
                    authorPhotoUrl ? '' : gradientClasses[gradientIndex(author._id)]
                  }`}
                  aria-hidden={authorPhotoUrl ? undefined : 'true'}
                >
                  {authorPhotoUrl && (
                    <img src={authorPhotoUrl} alt={author.name} loading="lazy" />
                  )}
                </span>
                <span className={styles.authorName}>
                  {t.magazine.by} {author.name}
                  {l(author.role, locale) && (
                    <span className={`mono ${styles.authorRole}`}>
                      {l(author.role, locale)?.toLowerCase()}
                    </span>
                  )}
                </span>
              </div>
            )}
          </header>

          <div className="wrap">
            <div
              className={`${styles.cover} ${
                coverUrl ? '' : gradientClasses[gradientIndex(article._id)]
              }`}
            >
              {coverUrl && (
                <img src={coverUrl} alt={article.coverImage?.alt ?? title ?? ''} />
              )}
            </div>
          </div>

          <div className={`wrap ${styles.bodyWrap}`}>
            {excerpt && <p className={styles.lede}>{excerpt}</p>}
            <MagazinePortable value={body} />
          </div>
        </article>

        <Rule left={t.magazine.kicker} right={t.magazine.relatedTitle} />

        {related.length > 0 && (
          <section className={`wrap ${styles.related}`}>
            <SectionHeader title={t.magazine.relatedTitle} />
            <RevealGroup className={styles.relatedGrid}>
              {related.map((relatedArticle) => (
                <ArticleCard
                  key={relatedArticle._id}
                  article={relatedArticle}
                  locale={locale}
                  reveal
                />
              ))}
            </RevealGroup>
          </section>
        )}

        <div className={`wrap ${styles.back}`}>
          <ArrowLink href={localeHref(locale, '/magazine')} reverse>
            {t.magazine.backToMagazine}
          </ArrowLink>
        </div>
      </main>
    </SiteChrome>
  )
}
