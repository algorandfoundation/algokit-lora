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
