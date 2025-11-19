'use client'

import { useTranslations } from 'next-intl'
import { FC, useState } from 'react'
import { Button, Modal } from 'antd'
import { GoogleOutlined } from '@ant-design/icons'
import { useBoolean } from 'ahooks'
import { useAudioList, useGoogleAudioUrl } from '@/hooks'
import { AudioList } from './components/AudioList'
import { DriveAudioSelect } from './components/DriveAudioSelect'
import { MusicPlayer } from './components/MusicPlayer'

const Page: FC = () => {
  const t = useTranslations()
  const { audioList, dispatchAudioList } = useAudioList()
  const [selectOpen, { toggle }] = useBoolean()
  const [activeId, setActiveId] = useState('')
  return (
    <>
      <div className='flex h-full w-full flex-col overflow-hidden'>
        <div className='flex gap-4 bg-gray-200 p-4'>
          <Button type='primary' icon={<GoogleOutlined />} onClick={toggle}>
            {t('music.selectFromDrive')}
          </Button>
        </div>
        <AudioList className='flex-1' value={activeId} onChange={setActiveId} />
        <MusicPlayer value={activeId} onChange={setActiveId} />
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
