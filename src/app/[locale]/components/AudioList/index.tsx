import { useTranslations } from 'next-intl'
import { FC } from 'react'
import { Table } from 'antd'
import { DeleteOutlined, PlayCircleOutlined } from '@ant-design/icons'
import { ValueController } from 'value-controller'
import { useAudioList } from '@/hooks'
import { cn, GoogleAudio } from '@/utils'

export type AudioList = Style & ValueController<string>
export const AudioList: FC<AudioList> = (props) => {
  const { value, onChange, className, style } = props
  const t = useTranslations()
  const { audioList, dispatchAudioList } = useAudioList()
  const GoogleAudioTable = Table<GoogleAudio>
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
            const active = id === value
            if (active) return <span className='text-red-500'>({t('music.playing')})</span>
            return <PlayCircleOutlined className='text-2xl' onClick={() => onChange?.(id)} />
          },
        },
        {
          dataIndex: 'name',
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
