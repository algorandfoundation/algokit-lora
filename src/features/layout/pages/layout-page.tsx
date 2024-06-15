import { ReactNode } from 'react'
import { Header } from '../components/header'
import { LeftSideBarMenu } from '../components/left-side-bar-menu'
import { cn } from '@/features/common/utils'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { useDeepLink } from '@/features/deep-link/hooks/use-deep-link'

export interface LayoutPageProps {
  children?: ReactNode
}

export function LayoutPage({ children }: LayoutPageProps) {
  useDeepLink()

  return (
    <div className="flex h-screen flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <LeftSideBarMenu />
        <main className="flex flex-1 items-start overflow-y-auto px-4">
          <div className={cn('grid w-full mb-4')}>{children}</div>
        </main>
      </div>
      <ToastContainer />
    </div>
  )
}
