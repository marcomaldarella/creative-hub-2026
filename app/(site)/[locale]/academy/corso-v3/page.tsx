import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SiteChrome } from '@/components/sections/SiteChrome';
import { CourseTemplateShell } from '@/components/mockup/CourseTemplateShell';
import { isLocale } from '@/lib/i18n/config';
import { css, html } from '@/components/mockup/templates/v3';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Urban Music Production — v3 (mockup)',
  robots: { index: false, follow: false },
};

export default async function CorsoV3Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return (
    <SiteChrome locale={locale} path="/academy/corso-v3">
      <CourseTemplateShell css={css} html={html} />
    </SiteChrome>
  );
}
