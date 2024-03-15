import { ReactNode } from 'react'
import { Header } from '../components/header'
import { LeftSideBarMenu } from '../components/left-side-bar-menu'
import { cn } from '@/features/common/utils'

export interface LayoutPageProps {
  children?: ReactNode
}

export function LayoutPage({ children }: LayoutPageProps) {
  return (
    <>
      <Header className={cn('mb-1')} />
      <div className={cn('flex h-full flex-shrink flex-row')}>
        <LeftSideBarMenu />
        <div className={cn('grow pl-4 pt-4')}> {children}</div>
      </div>
    </>
  )
}
