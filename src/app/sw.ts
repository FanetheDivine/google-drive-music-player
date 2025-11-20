import type { PrecacheEntry, SerwistGlobalConfig } from 'serwist'
import { Serwist, StaleWhileRevalidate, ExpirationPlugin } from 'serwist'

// This declares the value of `injectionPoint` to TypeScript.
// `injectionPoint` is the string that will be replaced by the
// actual precache manifest. By default, this string is set to
// `"self.__SW_MANIFEST"`.
declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined
  }
}

declare const self: ServiceWorkerGlobalScope

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,

  runtimeCaching: [
    {
      matcher: ({ request }) =>
        request.destination === 'document' ||
        request.destination === 'script' ||
        request.destination === 'style' ||
        request.destination === 'image',

      handler: new StaleWhileRevalidate({
        cacheName: 'permanent-swr-cache',
        plugins: [
          new ExpirationPlugin({
            maxEntries: 9999,
            maxAgeSeconds: 60 * 60 * 24 * 365 * 100, // 100 年
          }),
        ],
      }),
    },
  ],
})

serwist.addEventListeners()
