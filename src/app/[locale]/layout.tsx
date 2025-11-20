import type { Metadata, Viewport } from 'next'
import { hasLocale } from 'next-intl'
import { NextIntlClientProvider } from 'next-intl'
import { getLocale, getTranslations, setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { FC, PropsWithChildren } from 'react'
import { App } from 'antd'
import { match } from 'ts-pattern'
import { routing } from '@/i18n/routing'
import { type LocaleParams } from '@/i18n/type'
import AntdProvider from '@/lib/AntdProvider'
import SWRProvider from '@/lib/SWRProvider'

export async function generateMetadata(props: LocaleParams): Promise<Metadata> {
  const { params } = props
  const { locale } = await params
  const t = await getTranslations({ locale })
  const app = t('metadata.app')
  const app_default_title = t('metadata.app_default_title')
  const app_title_template = `%s - ${app}`
  const desc = t('metadata.desc')
  return {
    icons: '/logo.svg',
    applicationName: app,
    title: {
      default: app_default_title,
      template: app_title_template,
    },
    description: desc,
    manifest: '/manifest.json',
    appleWebApp: {
      capable: true,
      statusBarStyle: 'default',
      title: app_default_title,
    },
    formatDetection: {
      telephone: false,
    },
    openGraph: {
      type: 'website',
      siteName: app,
      title: {
        default: app_default_title,
        template: app_title_template,
      },
      description: desc,
    },
    twitter: {
      card: 'summary',
      title: {
        default: app_default_title,
        template: app_title_template,
      },
      description: desc,
    },
  }
}

export const viewport: Viewport = {
  themeColor: '#FFFFFF',
}

const RootLayout: FC<PropsWithChildren> = async (props) => {
  const { children, params } = props as PropsWithChildren & LocaleParams

  const locale = await match(process.env.EXPORT === 'true')
    .with(true, async () => {
      const { locale } = await params
      return locale
    })
    .with(false, getLocale)
    .exhaustive()

  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }

  if (process.env.EXPORT === 'true') {
    setRequestLocale(locale)
  }

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider>
          <AntdProvider locale={locale}>
            <SWRProvider>
              <App className='app'>{children}</App>
            </SWRProvider>
          </AntdProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}

export default RootLayout

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}
