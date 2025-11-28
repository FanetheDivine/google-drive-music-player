'use client'

import { useTranslations } from 'next-intl'
import { FC, useMemo, useState } from 'react'
import { Button, Checkbox, Empty, Input, Table } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import { useDebounceFn, useRequest } from 'ahooks'
import pinyinMatch from 'pinyin-match'
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
  const t = useTranslations()
  const { token, loginGoogle } = useGoogleAccount()

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

  const [search, setSearch] = useState<string>('')
  const { run: deboSetSearch } = useDebounceFn(setSearch, { wait: 300 })
  const { compositionProps } = useComposition({ value: search, onChange: deboSetSearch })
  // 过滤音频列表：支持拼音搜索和模糊查询
  const filteredData = useMemo(() => {
    if (!data || !search.trim()) {
      return data || []
    }

    const searchLower = search.toLowerCase().trim()

    return data.filter((audio) => {
      const name = audio.name
      const nameLower = name.toLowerCase()

      if (nameLower.includes(searchLower)) {
        return true
      }

      try {
        const matchResult = pinyinMatch.match(name, search)
        if (matchResult !== false) {
          return true
        }
      } catch {
        /* empty */
      }

      return false
    })
  }, [data, search])

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
      <Input
        prefix={<SearchOutlined />}
        placeholder={t('music.searchPlaceholder')}
        allowClear
        onClear={() => setSearch('')}
        {...compositionProps}
      />
      <span className='flex items-center gap-2 whitespace-nowrap'>
        <Checkbox
          checked={
            filteredData.length > 0 &&
            filteredData.every((item) => value?.some((v) => v.id === item.id))
          }
          indeterminate={
            filteredData.length > 0 &&
            filteredData.some((item) => value?.some((v) => v.id === item.id)) &&
            !filteredData.every((item) => value?.some((v) => v.id === item.id))
          }
          onChange={() => {
            // 全选/取消全选（基于过滤后的数据）
            const filteredIds = new Set(filteredData.map((item) => item.id))
            const currentSelectedInFiltered =
              value?.filter((item) => filteredIds.has(item.id)) || []
            const isAllSelected = currentSelectedInFiltered.length === filteredData.length

            if (isAllSelected) {
              onChange?.(value?.filter((item) => !filteredIds.has(item.id)) || [])
            } else {
              const newSelected = [
                ...(value || []),
                ...filteredData.filter((item) => !value?.some((v) => v.id === item.id)),
              ]
              onChange?.(newSelected)
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
          onChange: (selectedRowKeys) => {
            // 保留之前选中的项
            const filteredIds = new Set(filteredData.map((item) => item.id))
            const otherSelected = (value || []).filter((item) => !filteredIds.has(item.id))
            const newSelected = [
              ...otherSelected,
              ...filteredData.filter((item) => selectedRowKeys.includes(item.id)),
            ]
            onChange?.(newSelected)
          },
        }}
        dataSource={filteredData}
        columns={[
          {
            dataIndex: 'name',
          },
          {
            render: (_, record) => {
              const { id } = record
              return <CacheOp id={id} />
            },
            width: 130,
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
      revalidateOnMount: true,
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
