import { ReactNode, useRef } from 'react'
import { Header } from '../components/header'
import { LeftSideBarMenu } from '../components/left-side-bar-menu'
import { cn } from '@/features/common/utils'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { useDeepLink } from '@/features/deep-link/hooks/use-deep-link'
import { useResolvedTheme } from '@/features/settings/data'
import { ScrollRestoration } from 'react-router-dom'
import { SubscriberStatus } from '../components/subscriber-status'

type Props = {
  children?: ReactNode
}

export function LayoutPage({ children }: Props) {
  useDeepLink()
  const theme = useResolvedTheme()
  const mainContent = useRef<HTMLDivElement>(null)

  return (
    <div className="flex h-screen flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <LeftSideBarMenu />
        <div className="flex w-full flex-col">
          <SubscriberStatus />
          <main ref={mainContent} className="flex flex-1 items-start overflow-y-auto overflow-x-hidden">
            <div className={cn('grid w-full mb-4 mx-4')}>{children}</div>
          </main>
        </div>
      </div>
      <ToastContainer theme={theme} toastClassName="border" />
      {/* This uses a patched version of this component to support scrolling non body containers. */}
      <ScrollRestoration elementRef={mainContent} />
    </div>
  )
}
