import { ReactNode, useEffect } from 'react'
import { Header } from '../components/header'
import { LeftSideBarMenu } from '../components/left-side-bar-menu'
import { cn } from '@/features/common/utils'
import { useSubscribeToBlocksEffect } from '@/features/blocks/data'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { listen } from '@tauri-apps/api/event'
import { useNavigate } from 'react-router-dom'

export interface LayoutPageProps {
  children?: ReactNode
}

export function LayoutPage({ children }: LayoutPageProps) {
  const navigate = useNavigate()
  useSubscribeToBlocksEffect()

  useEffect(() => {
    const unlisten = listen('scheme-request-received', (event) => {
      const url = extractUrl(event.payload as string)
      if (url) {
        navigate(url)
      }
    })

    return () => {
      unlisten.then((f) => f())
    }
  }, [navigate])

  return (
    <div className="w-full xl:max-w-screen-xl">
      <Header className={cn('mb-1')} />
      <div className={cn('grid grid-flow-col grid-cols-[minmax(min-content,auto)_1fr]')}>
        <LeftSideBarMenu />
        <div className={cn('pl-4 pt-4')}>{children}</div>
        <ToastContainer />
      </div>
    </div>
  )
}

const extractUrl = (urlSchemeRequest: string | undefined) => {
  if (urlSchemeRequest && urlSchemeRequest.startsWith('algokit-explorer://')) {
    return urlSchemeRequest.slice('algokit-explorer://'.length)
  }
  return undefined
}
