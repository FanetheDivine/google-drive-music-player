import { FC } from 'react'
import { StepBackwardOutlined, StepForwardOutlined } from '@ant-design/icons'
import { ValueController } from 'value-controller'
import { useAudioList, useGoogleAudioUrl } from '@/hooks'
import { cn } from '@/utils'

export type MusicPlayer = Style & ValueController<string>
export const MusicPlayer: FC<MusicPlayer> = (props) => {
  const { value, onChange, className, style } = props
  const { audioList } = useAudioList()
  const playPrev = () => {
    const activeIndex = audioList.findIndex((item) => item.id === value)
    if (activeIndex === -1) return
    const prev = activeIndex === 0 ? audioList.at(-1) : audioList[activeIndex - 1]
    if (prev?.id) {
      onChange?.(prev.id)
    }
  }
  const playNext = () => {
    const activeIndex = audioList.findIndex((item) => item.id === value)
    if (activeIndex === -1) return
    const next = activeIndex === audioList.length - 1 ? audioList[0] : audioList[activeIndex + 1]
    if (next?.id) {
      onChange?.(next.id)
    }
  }
  const { data: url } = useGoogleAudioUrl(value)
  return (
    <div className={cn('flex items-center gap-2 bg-gray-400 p-2', className)} style={style}>
      <StepBackwardOutlined className='ml-auto text-2xl text-white' onClick={playPrev} />
      <audio src={url} controls autoPlay onEnded={playNext} />
      <StepForwardOutlined className='mr-auto text-2xl text-white' onClick={playNext} />
    </div>
  )
}
