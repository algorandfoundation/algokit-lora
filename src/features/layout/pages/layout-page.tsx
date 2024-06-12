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
    <div className="w-full">
      <Header />
      <div className={cn('grid grid-flow-col grid-cols-[minmax(min-content,auto)_1fr]')}>
        <LeftSideBarMenu />
        <div className={cn('px-4 pb-4')}>{children}</div>
        <ToastContainer />
      </div>
    </div>
  )
}
