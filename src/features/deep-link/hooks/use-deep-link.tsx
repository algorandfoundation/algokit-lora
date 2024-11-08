import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useNetworkConfigs, useSelectedNetwork, useSetSelectedNetwork } from '@/features/network/data'
import { getCurrent, onOpenUrl } from './tauri-deep-link'

export function useDeepLink() {
  const navigate = useNavigate()
  const setSelectedNetwork = useSetSelectedNetwork()
  const [currentUrl, setCurrentUrl] = useState<string | null>(null)
  const networkConfigs = useNetworkConfigs()
  const [selectedNetwork] = useSelectedNetwork()
  const networks = Object.keys(networkConfigs)

  const onDeepLink = useCallback(
    (urls: string[]) => {
      const url = urls[0]
      const deepLinkRegex = /^algokit-lora:\/\//
      const match = url.match(deepLinkRegex)
      if (match) {
        const newUrl = `/${url.replace(deepLinkRegex, '')}`
        const networkId = newUrl.split('/')[1]
        if (networks.includes(networkId) && networkId !== selectedNetwork) {
          setSelectedNetwork(networkId)
        }
        setCurrentUrl(newUrl)
        navigate(newUrl)
      }
    },
    [navigate, networks, selectedNetwork, setSelectedNetwork]
  )

  useEffect(() => {
    // Only run useEffect if you are within a TAURI instance
    if (!window.__TAURI_INTERNALS__) return
    // If the currentUrl is falsy then the deeplink opened the app
    if (!currentUrl) {
      getCurrent().then((current) => {
        if (current) {
          onDeepLink(current)
        }
      })
    }
    // Register deep link listener
    const unlisten = onOpenUrl((urls) => {
      onDeepLink(urls)
    })
    // Cleanup deep link listener
    return () => {
      unlisten.then((f) => f())
    }
  }, [currentUrl, onDeepLink])
}
