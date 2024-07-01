import { ReactNode } from 'react'
import { Header } from '../components/header'
import { LeftSideBarMenu } from '../components/left-side-bar-menu'
import { cn } from '@/features/common/utils'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { useDeepLink } from '@/features/deep-link/hooks/use-deep-link'
import { useResolvedTheme } from '@/features/settings/data'
import { SubscriberStatus } from '../components/subscriber-status'

export interface LayoutPageProps {
  children?: ReactNode
}

export function LayoutPage({ children }: LayoutPageProps) {
  useDeepLink()
  const theme = useResolvedTheme()

  return (
    <div className="flex h-screen flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <LeftSideBarMenu />
        <div className="flex w-full flex-col">
          <SubscriberStatus />
          <main className="flex flex-1 items-start overflow-y-auto overflow-x-hidden">
            <div className={cn('grid w-full mb-4 mx-4')}>{children}</div>
          </main>
        </div>
      </div>
      <ToastContainer theme={theme} toastClassName="border" />
    </div>
  )
}
