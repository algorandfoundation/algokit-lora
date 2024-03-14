import { ReactNode } from 'react'
import { Header } from '../components/header'
import { LeftSideBarMenu } from '../components/left-side-bar-menu'

export interface LayoutPageProps {
  children?: ReactNode
}

export function LayoutPage({ children }: LayoutPageProps) {
  return (
    <>
      <Header />
      <LeftSideBarMenu />
      {children}
    </>
  )
}
