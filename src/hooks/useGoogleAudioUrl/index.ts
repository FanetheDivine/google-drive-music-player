import useSWR from 'swr'
import { getAudioFromIndexDB, getGoogleAudioContent, storeAudioToIndexDB } from '@/utils'
import { useGoogleAccount } from '../useGoogleAccount'

export const useGoogleAudioUrl = (id?: string) => {
  const { token } = useGoogleAccount()
  return useSWR(
    id,
    async (id) => {
      let content = await getAudioFromIndexDB(id)
      if (!content) {
        content = await getGoogleAudioContent(token!, id)
        await storeAudioToIndexDB(id, content)
      }
      return URL.createObjectURL(content)
    },
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  )
}
