import { openDB } from 'idb'
import type { Token } from '@/hooks/useGoogleAccount'

export type GoogleAudio = {
  id: string
  name: string
  mimeType: string
  webViewLink: string
}

export const getGoogleAuthorization = (token: Token) => ({
  Authorization: `${token.token_type} ${token.access_token}`,
})

export const getGoogleAudioFiles = async (token: Token) => {
  const audioMimeTypes = [
    'audio/mpeg',
    'audio/wav',
    'audio/ogg',
    'audio/flac',
    'audio/mp4',
    'audio/x-m4a',
    'audio/aac',
  ]
    .map((type) => `mimeType='${type}'`)
    .join(' or ')

  const query = encodeURIComponent(audioMimeTypes)
  const url = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,mimeType,webViewLink)`
  const data = await fetch(url, {
    headers: {
      ...getGoogleAuthorization(token),
    },
  }).then((res) => res.json())
  return data.files as GoogleAudio[]
}

export const getGoogleAudioContent = async (token: Token, id: string) => {
  const url = `https://www.googleapis.com/drive/v3/files/${id}?alt=media`

  const content = await fetch(url, {
    headers: {
      ...getGoogleAuthorization(token),
    },
  }).then((res) => res.blob())

  return content
}

const DB_NAME = 'GoogleAudioCache'
const STORE_NAME = 'audioBlobs'
const getAudioDB = async () => {
  const db = await openDB(DB_NAME, 1, {
    upgrade: (db) => {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME)
      }
    },
  })
  return db
}

export const getAudioFromIndexDB = async (id: string) => {
  const db = await getAudioDB()
  const data = await db.get(STORE_NAME, id)
  return data as Blob | undefined
}

export const storeAudioToIndexDB = async (id: string, content: Blob) => {
  const db = await getAudioDB()
  await db.put(STORE_NAME, content, id)
}
