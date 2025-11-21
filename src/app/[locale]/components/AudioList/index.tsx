import { useTranslations } from 'next-intl'
import { FC, useEffect } from 'react'
import { Table } from 'antd'
import { DeleteOutlined, PlayCircleOutlined } from '@ant-design/icons'
import { useAudioList } from '@/hooks'
import { cn, GoogleAudio } from '@/utils'

export type AudioList = Style
export const AudioList: FC<AudioList> = (props) => {
  const { className, style } = props
  const t = useTranslations()
  const { audioList, dispatchAudioList, activeAudio, dispatchActiveAudio } = useAudioList()
  const GoogleAudioTable = Table<GoogleAudio>
  useEffect(() => {
    if (activeAudio) {
      document
        .getElementById(`google-audio-${activeAudio.id}`)
        ?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [activeAudio])
  return (
    <GoogleAudioTable
      rowKey={'id'}
      className={cn('overflow-auto', className)}
      style={style}
      dataSource={audioList}
      showHeader={false}
      pagination={false}
      columns={[
        {
          render: (_, record) => {
            const { id } = record
            const active = id === activeAudio?.id
            if (active)
              return <span className='whitespace-nowrap text-red-500'>({t('music.playing')})</span>
            return (
              <PlayCircleOutlined
                className='text-2xl'
                onClick={() => dispatchActiveAudio({ type: 'set', value: record })}
              />
            )
          },
          width: 120,
        },
        {
          render: (_, record) => {
            const { id, name } = record
            return <span id={`google-audio-${id}`}>{name}</span>
          },
        },
        {
          render: (_, record) => {
            return (
              <DeleteOutlined
                className='text-red-500'
                onClick={() => {
                  dispatchAudioList({ type: 'del', value: { id: record.id } })
                }}
              />
            )
          },
        },
      ]}
    />
  )
}
