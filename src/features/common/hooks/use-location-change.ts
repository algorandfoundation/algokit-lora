import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

export const useLocationChange = (onChange: (pathname: string) => void) => {
  const location = useLocation()
  useEffect(() => {
    onChange(location.pathname)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname])
}
