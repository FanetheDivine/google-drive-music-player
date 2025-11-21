import { FC } from 'react'
import { StepBackwardOutlined, StepForwardOutlined } from '@ant-design/icons'
import { useAudioList, useGoogleAudioUrl } from '@/hooks'
import { cn } from '@/utils'

export type MusicPlayer = Style
export const MusicPlayer: FC<MusicPlayer> = (props) => {
  const { className, style } = props
  const { activeAudio, dispatchActiveAudio } = useAudioList()

  const { data: url } = useGoogleAudioUrl(activeAudio?.id)
  return (
    <div className={cn('flex items-center gap-2 bg-gray-400 p-2', className)} style={style}>
      <StepBackwardOutlined
        className='ml-auto text-2xl text-white'
        onClick={() => dispatchActiveAudio({ type: 'prev' })}
      />
      <audio src={url} controls autoPlay onEnded={() => dispatchActiveAudio({ type: 'next' })} />
      <StepForwardOutlined
        className='mr-auto text-2xl text-white'
        onClick={() => dispatchActiveAudio({ type: 'next' })}
      />
    </div>
  )
}
