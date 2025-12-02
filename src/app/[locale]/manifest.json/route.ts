import { hasLocale } from 'next-intl'
import { getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { routing } from '@/i18n/routing'
import { LocaleParams } from '@/i18n/type'

export async function GET(req: Request, props: LocaleParams) {
  const params = await props.params
  const { locale } = params
  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }
  const t = await getTranslations({ locale })
  return Response.json({
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
