import { ReactNode } from 'react'
import { Header } from '../components/header'
import { LeftSideBarMenu } from '../components/left-side-bar-menu'
import { cn } from '@/features/common/utils'
import { useSubscribeToBlocksEffect } from '@/features/blocks/data'

export interface LayoutPageProps {
  children?: ReactNode
}

export function LayoutPage({ children }: LayoutPageProps) {
  useSubscribeToBlocksEffect()

  return (
    <div className="w-full xl:max-w-screen-xl">
      <Header className={cn('mb-1')} />
      <div className={cn('grid grid-flow-col')}>
        <LeftSideBarMenu />
        <div className={cn('pl-4 pt-4')}>{children}</div>
      </div>
    </div>
  )
}
