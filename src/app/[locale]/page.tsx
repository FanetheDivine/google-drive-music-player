'use client'

import { useLocale, useTranslations } from 'next-intl'
import { FC, useEffect, useRef, useState } from 'react'
import { Button, Input, Modal, Select } from 'antd'
import { GoogleOutlined, SearchOutlined } from '@ant-design/icons'
import { useBoolean, useDebounceFn } from 'ahooks'
import { motion } from 'motion/react'
import { useAudioList, useComposition } from '@/hooks'
import { cn } from '@/utils'
import { usePathname, useRouter } from '@/i18n/navigation'
import { AudioList } from './components/AudioList'
import { DriveAudioSelect } from './components/DriveAudioSelect'
import { MusicPlayer } from './components/MusicPlayer'

const Page: FC = () => {
  const t = useTranslations()
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const { audioList, dispatchAudioList } = useAudioList()
  const [selectOpen, { toggle }] = useBoolean()
  const [search, setSearch] = useState<string>('')
  const { run: deboSetSearch } = useDebounceFn(setSearch, { wait: 300 })
  const { compositionProps } = useComposition({ value: search, onChange: deboSetSearch })
  const bodyRef = useRef<HTMLElement>(null)
  useEffect(() => {
    bodyRef.current = document.body
  }, [])
  return (
    <>
      <div className='flex h-full w-full flex-col overflow-hidden'>
        <div className='flex items-center gap-4 bg-gray-200 p-4'>
          <Button type='primary' icon={<GoogleOutlined />} onClick={toggle}>
            {t('music.selectFromDrive')}
          </Button>
          <Select
            className='ml-auto w-25'
            value={locale}
            onChange={(val) => {
              router.push(pathname, { locale: val })
            }}
            options={[
              {
                value: 'en',
                label: 'English',
              },
              {
                value: 'zh',
                label: '中文',
              },
            ]}
          />
        </div>
        <AudioList className='flex-1' />
        <MusicPlayer />
      </div>
      {audioList.length > 0 ? (
        <motion.div
          drag
          dragConstraints={bodyRef}
          dragMomentum={false}
          dragElastic={0.3}
          className={cn(
            'fixed top-20 left-0 z-10 translate-x-1/2',
            'max-w-[50vw] min-w-40',
            'rounded-full bg-white px-4 py-1 shadow-md',
          )}
        >
          <Input
            prefix={<SearchOutlined />}
            placeholder={t('music.searchPlaceholder')}
            allowClear
            className='w-full'
            onClear={() => setSearch('')}
            {...compositionProps}
          />
        </motion.div>
      ) : null}
      <Modal
        title={
          <span className='flex items-center gap-2'>
            <img src='/logo.svg' className='h-4 w-4' />
            {t('music.select')}
          </span>
        }
        open={selectOpen}
        onCancel={toggle}
        className='top-5'
        keyboard={false}
        maskClosable={false}
        destroyOnClose
        footer={null}
      >
        <DriveAudioSelect
          value={audioList}
          onChange={(value) => {
            dispatchAudioList({ type: 'set', value })
          }}
        />
      </Modal>
    </>
  )
}

export default Page
