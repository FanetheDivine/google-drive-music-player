'use client'

import { useTranslations } from 'next-intl'
import { FC, useEffect, useState } from 'react'
import { Button, Checkbox, Empty, Input, Table } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import { useRequest } from 'ahooks'
import useSWR from 'swr'
import { ValueController } from 'value-controller'
import { useComposition, useGoogleAccount } from '@/hooks'
import {
  cn,
  getAudioFromIndexDB,
  getGoogleAudioContent,
  getGoogleAudioFiles,
  GoogleAudio,
  sleep,
  storeAudioToIndexDB,
  withErrorBoundary,
} from '@/utils'
import { DefaultErrorFallback } from '@/components/DefaultErrorFallback'
import { DefaultLoadingFallback } from '@/components/DefaultLoadingFallback'

export const DriveAudioSelect: FC<ValueController<GoogleAudio[]>> = withErrorBoundary((props) => {
  const { value, onChange } = props
  const { token, loginGoogle } = useGoogleAccount()
  const [search, setSearch] = useState<string>()
  const { compositionProps } = useComposition({ value: search, onChange: setSearch })
  const { data, isLoading, error, mutate } = useSWR(
    'google-audio-list',
    async () => {
      let currentToken = token
      if (!currentToken) {
        currentToken = await loginGoogle({
          scope: 'https://www.googleapis.com/auth/drive.readonly',
        })
      }
      await sleep(1000)
      const list = await getGoogleAudioFiles(currentToken)
      return list
    },
    {
      revalidateOnMount: true,
    },
  )
  if (isLoading) {
    return <DefaultLoadingFallback />
  }
  if (error) {
    return <DefaultErrorFallback error={error} reset={() => mutate()} />
  }
  if (!data || data.length === 0) {
    return <Empty />
  }
  const GoogleAudioTable = Table<GoogleAudio>
  return (
    <div className='flex max-h-[60vh] flex-col gap-4'>
      <Input prefix={<SearchOutlined />} placeholder='搜索音乐' allowClear {...compositionProps} />
      <span className='flex items-center gap-2 whitespace-nowrap'>
        <Checkbox
          checked={Boolean(value?.length)}
          indeterminate={Boolean(value?.length) && data?.length !== value?.length}
          onChange={() => {
            // 全选
            if (data?.length === value?.length) {
              onChange?.([])
            } else {
              onChange?.(data!)
            }
          }}
        >
          全选
        </Checkbox>
        <CacheSelectedBtn
          className={cn({ invisible: !value?.length })}
          onClick={async () => {
            for (let i = 0; i !== value?.length; ++i) {
              const { id } = value![i]
              const cache = await getAudioFromIndexDB(id)
              if (!cache) {
                const content = await getGoogleAudioContent(token!, id)
                await storeAudioToIndexDB(id, content)
              }
            }
            mutate(undefined)
          }}
        />
      </span>
      <GoogleAudioTable
        className='flex-1 overflow-auto'
        rowKey={'id'}
        rowSelection={{
          type: 'checkbox',
          selectedRowKeys: value?.map((item) => item.id),
          onChange: (val) => {
            onChange?.(val.map((id) => data?.find((item) => item.id === id)!).filter(Boolean))
          },
        }}
        dataSource={data}
        columns={[
          {
            dataIndex: 'name',
          },
          {
            render: (_, record) => {
              const { id } = record
              return <CacheOp id={id} />
            },
          },
        ]}
        showHeader={false}
      />
    </div>
  )
})

const CacheOp: FC<{ id: string }> = (props) => {
  const { id } = props
  const t = useTranslations()
  const { token } = useGoogleAccount()
  const {
    data: cached,
    isLoading,
    mutate,
  } = useSWR(
    [id, 'google-music-item'],
    async ([id]) => {
      const cachedAudio = await getAudioFromIndexDB(id)
      return Boolean(cachedAudio)
    },
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  )
  const { loading: caching, run: cacheThis } = useRequest(
    async () => {
      const content = await getGoogleAudioContent(token!, id)
      await storeAudioToIndexDB(id, content)
      mutate(true)
    },
    { manual: true },
  )
  if (isLoading) return null
  if (cached) {
    return (
      <Button type='link' disabled>
        {t('music.cached')}
      </Button>
    )
  }
  return (
    <Button type='link' loading={caching} onClick={cacheThis}>
      {t('music.cache')}
    </Button>
  )
}

const CacheSelectedBtn: FC<Style & { onClick: () => Promise<void> }> = (props) => {
  const { onClick, className, style } = props
  const t = useTranslations()
  const { run: cacheSelect, loading } = useRequest(onClick, { manual: true })
  return (
    <Button type='link' className={className} style={style} loading={loading} onClick={cacheSelect}>
      {t('music.cacheSelected')}
    </Button>
  )
}
