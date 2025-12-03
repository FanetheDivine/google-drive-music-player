'use client'

import { useTranslations } from 'next-intl'
import { FC, useEffect, useMemo, useRef } from 'react'
import { Table } from 'antd'
import { DeleteOutlined, PlayCircleOutlined } from '@ant-design/icons'
import pinyinMatch from 'pinyin-match'
import { useAudioList } from '@/hooks'
import { cn, GoogleAudio } from '@/utils'

export type AudioListProps = Style & {
  searchKeyword?: string
}

export const AudioList: FC<AudioListProps> = (props) => {
  const { className, style, searchKeyword = '' } = props
  const t = useTranslations()
  const { audioList, dispatchAudioList, activeAudio, dispatchActiveAudio } = useAudioList()
  const GoogleAudioTable = Table<GoogleAudio>

  const filteredAudioList = useMemo(() => {
    if (!searchKeyword.trim()) {
      return audioList
    }

    const searchLower = searchKeyword.toLowerCase().trim()

    return audioList.filter((audio) => {
      const name = audio.name
      const nameLower = name.toLowerCase()
      if (nameLower.includes(searchLower)) {
        return true
      }

      try {
        const matchResult = pinyinMatch.match(name, searchKeyword)
        if (matchResult !== false) {
          return true
        }
      } catch {
        /* empty */
      }

      return false
    })
  }, [audioList, searchKeyword])

  useEffect(() => {
    if (activeAudio && !searchKeyword.trim()) {
      document
        .getElementById(`google-audio-${activeAudio.id}`)
        ?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [activeAudio, searchKeyword])
  console.log(filteredAudioList)
  return (
    <GoogleAudioTable
      rowKey={'id'}
      className={cn('overflow-auto', className)}
      style={style}
      dataSource={filteredAudioList}
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
