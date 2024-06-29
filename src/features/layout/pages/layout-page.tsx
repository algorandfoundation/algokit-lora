import { ReactNode, useRef } from 'react'
import { Header } from '../components/header'
import { LeftSideBarMenu } from '../components/left-side-bar-menu'
import { cn } from '@/features/common/utils'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { useDeepLink } from '@/features/deep-link/hooks/use-deep-link'
import { useResolvedTheme } from '@/features/settings/data'
import { useScrollRestoration } from '@/features/common/hooks/use-scroll-restoration'

type Props = {
  children?: ReactNode
}

export function LayoutPage({ children }: Props) {
  useDeepLink()
  const theme = useResolvedTheme()

  // This hook is required as React router scroll restoration doesn't work on non body scrollable containers.
  const mainContent = useRef<HTMLDivElement>(null)
  useScrollRestoration(mainContent)

  return (
    <div className="flex h-screen flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <LeftSideBarMenu />
        <main ref={mainContent} className="flex flex-1 items-start overflow-y-auto overflow-x-hidden">
          <div className={cn('grid w-full mb-4 mx-4')}>{children}</div>
        </main>
      </div>
      <ToastContainer theme={theme} toastClassName="border" />
    </div>
  )
}
