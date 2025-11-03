import { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'
import createPWAPlugin from '@ducanh2912/next-pwa'
import nextAnalyzer from '@next/bundle-analyzer'

const nextConfig: NextConfig = {
  output: process.env.EXPORT === 'true' ? 'export' : undefined,
}

const withPWA = createPWAPlugin({
  dest: 'public',
})
const withNextIntl = createNextIntlPlugin()
const withAnalyzer = nextAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})

export default withAnalyzer(withPWA(withNextIntl(nextConfig)))
