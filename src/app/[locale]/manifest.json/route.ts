import type { MetadataRoute } from 'next'
import { hasLocale } from 'next-intl'
import { getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { NextRequest, NextResponse } from 'next/server'
import { routing } from '@/i18n/routing'

export async function GET(req: NextRequest, context: RouteContext<'/[locale]/manifest.json'>) {
  const params = await context.params
  const { locale } = params
  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }
  const t = await getTranslations({ locale })
  return NextResponse.json<MetadataRoute.Manifest>({
    name: t('metadata.app'),
    short_name: t('metadata.short_name'),
    icons: [
      {
        src: '/logo.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
    ],
    theme_color: '#FFFFFF',
    background_color: '#FFFFFF',
    start_url: `/${locale}`,
    display: 'standalone',
    orientation: 'portrait',
  })
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}
