import { useEffect } from 'react'
import { useNavigate } from 'react-router'

export function LandingPage() {
  const navigate = useNavigate()

  useEffect(() => {
    const url = extractUrl(window.urlSchemeRequest)
    if (url) {
      navigate(url)
    }
  }, [navigate])

  return <div>Landing Page</div>
}

const extractUrl = (urlSchemeRequest: string | undefined) => {
  if (urlSchemeRequest && urlSchemeRequest.startsWith('algokit-explorer://')) {
    return urlSchemeRequest.slice('algokit-explorer://'.length)
  }
  return undefined
}
