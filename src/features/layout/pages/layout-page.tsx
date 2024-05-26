import { ReactNode, useEffect, useState } from 'react'
import { Header } from '../components/header'
import { LeftSideBarMenu } from '../components/left-side-bar-menu'
import { cn } from '@/features/common/utils'
import { useSubscribeToBlocksEffect } from '@/features/blocks/data'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { listen } from '@tauri-apps/api/event'

export interface LayoutPageProps {
  children?: ReactNode
}

export function LayoutPage({ children }: LayoutPageProps) {
  const [message, setMessage] = useState('hello!!')
  useSubscribeToBlocksEffect()

  useEffect(() => {
    const unlisten = listen('scheme-request-received', (event) => {
      setMessage(`event received:${event.payload}`)
    })

    return () => {
      unlisten.then((f) => f())
    }
  }, [setMessage])

  return (
    <div className="w-full xl:max-w-screen-xl">
      {message}
      <Header className={cn('mb-1')} />
      <div className={cn('grid grid-flow-col grid-cols-[minmax(min-content,auto)_1fr]')}>
        <LeftSideBarMenu />
        <div className={cn('pl-4 pt-4')}>{children}</div>
        <ToastContainer />
      </div>
    </div>
  )
}
