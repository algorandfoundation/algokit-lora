import { ReactNode } from 'react'
import { Header } from '../components/header'
import { LeftSideBarMenu } from '../components/left-side-bar-menu'
import { cn } from '@/features/primitive/utils'

export interface LayoutPageProps {
  children?: ReactNode
}

export function LayoutPage({ children }: LayoutPageProps) {
  return (
    <>
      <Header />
      <div className={cn('flex h-full flex-row')}>
        <LeftSideBarMenu />
        {children}
      </div>
    </>
  )
}
