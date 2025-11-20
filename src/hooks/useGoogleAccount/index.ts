'use client'

import { create } from 'zustand'

export type Token = {
  access_token: string
  token_type: string
  expires_in: number
  scope: string
  authuser: string
  prompt: string
}
export type GoogleAccount = {
  token?: Token
  loginGoogle: (config: { scope: string }) => Promise<Token>
  logout: () => void
}
export const useGoogleAccount = create<GoogleAccount>((set, get) => {
  let loginTimer: number | null = null
  return {
    loginGoogle: async (config) => {
      const currentToken = get().token
      if (currentToken) return currentToken
      const { scope } = config
      if (!window.google) {
        await insertGoogleScript()
      }
      const { promise, resolve, reject } = Promise.withResolvers<Token>()
      const tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        scope,
        callback: async (resp: any) => {
          if (resp.error !== undefined) {
            console.error(resp)
            reject(resp.error)
          } else {
            resolve(resp)
            set({ token: resp })
          }
        },
      })
      tokenClient.requestAccessToken({ prompt: '' })
      // 50分钟自动刷新
      loginTimer = window.setInterval(
        () => tokenClient.requestAccessToken({ prompt: '' }),
        50 * 60 * 1000,
      )
      return promise
    },
    logout: () => {
      const currentToken = get().token
      if (!currentToken) return currentToken
      if (loginTimer) {
        clearInterval(loginTimer)
        loginTimer = null
      }
      set({ token: undefined })
    },
  }
})

const insertGoogleScript = async () => {
  const { promise, resolve, reject } = Promise.withResolvers<void>()
  const script = document.createElement('script')
  script.onload = () => {
    document.body.removeChild(script)
    resolve()
  }
  script.onerror = reject
  script.src = 'https://accounts.google.com/gsi/client'
  document.body.appendChild(script)
  await promise
}
