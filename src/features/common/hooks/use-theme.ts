import { useSelectedTheme } from '@/features/settings/data'
import { useEffect } from 'react'

export const useTheme = () => {
  const [theme] = useSelectedTheme()

  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove('light', 'dark')

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      root.classList.add(systemTheme)
      return
    }

    root.classList.add(theme)
  }, [theme])
}
