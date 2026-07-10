import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ArrowLink, Rule, SectionHeader, RevealGroup } from '@/components/ui'
import { ArticleCard } from '@/components/magazine/ArticleCard'
import { CategoryBar } from '@/components/magazine/CategoryBar'
import { SiteChrome } from '@/components/sections/SiteChrome'
import { isLocale, localeHref } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { l } from '@/lib/sanity/l'
import { getAllCategories, getArticlesByCategory } from '@/lib/sanity/queries'
import styles from '../../Magazine.module.css'

export const dynamic = 'force-dynamic'

type Params = Promise<{ locale: string; slug: string }>

export async function generateMetadata({
  params,
}: {
  params: Params
}): Promise<Metadata> {
  const { locale, slug } = await params
  if (!isLocale(locale)) return {}
  const t = getDictionary(locale)
  const categories = await getAllCategories()
  const category = categories.find((c) => c.slug?.current === slug)
  const title = category ? l(category.title, locale) : undefined
  return {
    title: title ? `${title} — ${t.magazine.metaTitle}` : t.magazine.metaTitle,
    description: t.magazine.metaDescription,
  }
}

export default async function MagazineCategoryPage({
  params,
}: {
  params: Params
}) {
  const { locale, slug } = await params
  if (!isLocale(locale)) notFound()
  const t = getDictionary(locale)

  const categories = await getAllCategories()
  const category = categories.find((c) => c.slug?.current === slug)
  if (!category) notFound()

  const articles = await getArticlesByCategory(slug)
  const categoryTitle = l(category.title, locale) ?? slug

  return (
    <SiteChrome locale={locale} path={`/magazine/categoria/${slug}`}>
      <main className={styles.main}>
        <div className={`wrap ${styles.header}`}>
          <SectionHeader
            kicker={`${t.magazine.kicker} — ${t.magazine.categoryKicker}`}
            title={categoryTitle}
          />
          <CategoryBar
            categories={categories}
            locale={locale}
            activeSlug={slug}
            allLabel={t.common.all}
            ariaLabel={t.magazine.categoriesLabel}
            className={styles.categories}
          />
        </div>

        <Rule
          left={categoryTitle.toLowerCase()}
          right={`${articles.length} ${t.common.articles}`}
        />

        {articles.length === 0 ? (
          <div className="wrap">
            <span className={`mono ${styles.empty}`}>{t.magazine.empty}</span>
          </div>
        ) : (
          <RevealGroup className={`wrap ${styles.zone} ${styles.grid}`}>
            {articles.map((article) => (
              <ArticleCard
                key={article._id}
                article={article}
                locale={locale}
                reveal
              />
            ))}
          </RevealGroup>
        )}

        <div className="wrap" style={{ paddingBottom: 'var(--sez)' }}>
          <ArrowLink href={localeHref(locale, '/magazine')} reverse>
            {t.magazine.backToMagazine}
          </ArrowLink>
        </div>
      </main>
    </SiteChrome>
  )
}
