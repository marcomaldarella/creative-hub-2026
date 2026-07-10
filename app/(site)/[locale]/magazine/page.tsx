import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Rule, SectionHeader, RevealGroup } from '@/components/ui'
import { ArticleCard } from '@/components/magazine/ArticleCard'
import { CategoryBar } from '@/components/magazine/CategoryBar'
import { SiteChrome } from '@/components/sections/SiteChrome'
import { isLocale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { getAllArticles, getAllCategories } from '@/lib/sanity/queries'
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

export default async function MagazinePage({ params }: { params: Params }) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const t = getDictionary(locale)

  const [articles, categories] = await Promise.all([
    getAllArticles(),
    getAllCategories(),
  ])

  const [featured, ...rest] = articles

  return (
    <SiteChrome locale={locale} path="/magazine">
      <main className={styles.main}>
        <div className={`wrap ${styles.header}`}>
          <SectionHeader
            kicker={t.magazine.kicker}
            title={t.magazine.title}
            lede={t.magazine.lede}
          />
          <CategoryBar
            categories={categories}
            locale={locale}
            allLabel={t.common.all}
            ariaLabel={t.magazine.categoriesLabel}
            className={styles.categories}
          />
        </div>

        {articles.length === 0 ? (
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
                  right={`${articles.length} ${t.common.articles}`}
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
