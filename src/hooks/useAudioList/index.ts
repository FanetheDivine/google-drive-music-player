import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { GoogleAudio } from '@/utils'

type AudioListActionMap = {
  /** 在歌单的音乐更新name 不在的音乐加入歌单尾部 */
  add: GoogleAudio[]
  /** 删除一个音乐 */
  del: { id: string }
  /** 将音乐放置在id为to的前方 如果to不传 则放置在尾部 */
  place: { target: string; to?: string }
  /** 直接设置 */
  set: GoogleAudio[]
}
export type AudioListStore = {
  audioList: GoogleAudio[]
  dispatchAudioList: (
    action: {
      [K in keyof AudioListActionMap]: {
        type: K
        value: AudioListActionMap[K]
      }
    }[keyof AudioListActionMap],
  ) => void
}

export const useAudioList = create(
  persist<AudioListStore>(
    (set) => {
      return {
        audioList: [],
        dispatchAudioList: (action) => {
          const { type, value } = action
          switch (type) {
            case 'add': {
              set((prev) => {
                const { audioList } = prev
                const newAudioList: GoogleAudio[] = []
                value.forEach((v) => {
                  const target = audioList.find((a) => a.id === v.id)
                  if (target) {
                    target.name = v.name
                  } else {
                    newAudioList.push(v)
                  }
                })
                return {
                  audioList: [...audioList, ...newAudioList],
                }
              })
              break
            }
            case 'del': {
              set((prev) => {
                return {
                  audioList: prev.audioList.filter((a) => a.id === value.id),
                }
              })
              break
            }
            case 'place': {
              set((prev) => {
                const targetIndex = prev.audioList.findIndex((item) => item.id === value.target)
                if (targetIndex === -1) return prev
                const targetAudio = prev.audioList[targetIndex]
                const newAudioList = prev.audioList.toSpliced(targetIndex, 1)
                let toIndex = newAudioList.findIndex((item) => item.id === value.to)
                if (toIndex === -1) {
                  toIndex = newAudioList.length
                }
                newAudioList.splice(toIndex, 0, targetAudio)
                return {
                  audioList: newAudioList,
                }
              })
              break
            }
            case 'set': {
              set({ audioList: value })
              break
            }
            default:
              throw new Error('未知的action类型')
          }
        },
      }
    },
    {
      name: 'google-drive-audio-list',
      version: 1,
    },
  ),
)
