import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Rule, SearchBox, SectionHeader, RevealGroup } from '@/components/ui'
import { ArticleCard } from '@/components/magazine/ArticleCard'
import { CategoryBar } from '@/components/magazine/CategoryBar'
import { SiteChrome } from '@/components/sections/SiteChrome'
import { isLocale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { getAllArticles, getAllCategories } from '@/lib/sanity/queries'
import { l } from '@/lib/sanity/l'
import { matchesQuery } from '@/lib/search'
import styles from './Magazine.module.css'

export const dynamic = 'force-dynamic'

type Params = Promise<{ locale: string }>

export async function generateMetadata({
  params,
}: {
  params: Params
}): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const t = getDictionary(locale)
  return {
    title: t.magazine.metaTitle,
    description: t.magazine.metaDescription,
  }
}

export default async function MagazinePage({
  params,
  searchParams,
}: {
  params: Params
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const t = getDictionary(locale)
  const { q } = await searchParams
  const query = typeof q === 'string' ? q : undefined

  const [articles, categories] = await Promise.all([
    getAllArticles(),
    getAllCategories(),
  ])

  const results = articles.filter((a) =>
    matchesQuery(
      query,
      l(a.title, locale),
      l(a.excerpt, locale),
      a.author?.name,
      ...(a.categories?.map((c) => l(c.title, locale)) ?? [])
    )
  )

  const [featured, ...rest] = results

  return (
    <SiteChrome locale={locale} path="/magazine">
      <main className={styles.main}>
        <div className={`wrap ${styles.header}`}>
          <SectionHeader
            as="h1"
            kicker={t.magazine.kicker}
            title={t.magazine.title}
            lede={t.magazine.lede}
          />
          <div className={styles.toolbar}>
            <CategoryBar
              categories={categories}
              locale={locale}
              allLabel={t.common.all}
              ariaLabel={t.magazine.categoriesLabel}
              className={styles.categories}
            />
            <SearchBox placeholder={t.common.search} className={styles.search} />
          </div>
        </div>

        {results.length === 0 ? (
          <div className="wrap">
            <span className={`mono ${styles.empty}`}>{t.magazine.empty}</span>
          </div>
        ) : (
          <>
            <Rule left={t.magazine.kicker} right={t.magazine.featuredLabel} />

            {featured && (
              <RevealGroup className={`wrap ${styles.zone}`}>
                <ArticleCard article={featured} locale={locale} featured reveal />
              </RevealGroup>
            )}

            {rest.length > 0 && (
              <>
                <Rule
                  left={t.magazine.latestLabel}
                  right={`${results.length} ${t.common.articles}`}
                />
                <RevealGroup className={`wrap ${styles.zone} ${styles.grid}`}>
                  {rest.map((article) => (
                    <ArticleCard
                      key={article._id}
                      article={article}
                      locale={locale}
                      reveal
                    />
                  ))}
                </RevealGroup>
              </>
            )}
          </>
        )}
      </main>
    </SiteChrome>
  )
}
