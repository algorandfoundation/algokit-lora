import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

// React router scroll restoration doesn't currently work on non body scrollable containers.
// This is a very simple hook to scroll to the top of the container when the location changes.
export function useScrollRestoration(container: React.RefObject<HTMLElement>) {
  const location = useLocation()

  useEffect(() => {
    container.current?.scrollTo(0, 0)
  }, [location.pathname, container])
}
