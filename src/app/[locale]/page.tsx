'use client'

import { Locale, useLocale, useTranslations } from 'next-intl'
import { FC, useState } from 'react'
import { Button, Modal, Select } from 'antd'
import { GoogleOutlined } from '@ant-design/icons'
import { useBoolean } from 'ahooks'
import { useAudioList } from '@/hooks'
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
