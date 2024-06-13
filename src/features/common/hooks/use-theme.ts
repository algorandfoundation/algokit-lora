import { useEffectiveSelectedTheme } from '@/features/settings/data'
import { useEffect } from 'react'

export const useTheme = () => {
  const theme = useEffectiveSelectedTheme()

  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove('light', 'dark')
    root.classList.add(theme)
  }, [theme])
}
