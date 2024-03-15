import { useContext } from 'react'
import { LayoutProviderContext } from '../context/layout-provider'

export const useLayout = () => {
  const context = useContext(LayoutProviderContext)

  if (context === undefined) throw new Error('useLayout must be used within a LayoutProvider')

  return context
}
