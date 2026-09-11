import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SiteChrome } from '@/components/sections/SiteChrome';
import { CourseTemplateShell } from '@/components/mockup/CourseTemplateShell';
import { isLocale } from '@/lib/i18n/config';
import { css, html } from '@/components/mockup/templates/v1';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Urban Music Production — v1 (mockup)',
  robots: { index: false, follow: false },
};

export default async function CorsoV1Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return (
    <SiteChrome locale={locale} path="/academy/corso-v1">
      <CourseTemplateShell css={css} html={html} />
    </SiteChrome>
  );
}
