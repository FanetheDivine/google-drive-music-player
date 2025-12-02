import { hasLocale } from 'next-intl'
import { getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { type NextRequest, NextResponse } from 'next/server'
import { routing } from '@/i18n/routing'

export async function GET(req: NextRequest, ctx: RouteContext<'/[locale]/manifest.json'>) {
  const { locale } = await ctx.params
  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }
  const t = await getTranslations({ locale })
  return NextResponse.json({
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
