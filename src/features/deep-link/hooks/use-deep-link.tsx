import { useCallback, useEffect } from 'react'
import { listen } from '@tauri-apps/api/event'
import { useNavigate } from 'react-router-dom'
import { useSetSelectedNetwork } from '@/features/network/data'
import { DeepLinkType, parseDeepLink } from '@/features/deep-link/parse-deep-link'
import { Urls } from '@/routes/urls'

export function useDeepLink() {
  const setSelectedNetwork = useSetSelectedNetwork()
  const navigate = useNavigate()

  const handleDeepLink = useCallback(
    async (url: string | undefined) => {
      const options = parseDeepLink(url)
      if (options) {
        await setSelectedNetwork(options.networkId)

        if (options.type === DeepLinkType.Network) {
          navigate(Urls.Index.build({}))
        }
        if (options.type === DeepLinkType.Transaction) {
          navigate(Urls.Explore.Transaction.ById.build({ transactionId: options.transactionId, networkId: options.networkId }))
        }
        if (options.type === DeepLinkType.AppLab) {
          navigate(Urls.Explore.AppLab.build({ networkId: options.networkId }))
        }
      }
    },
    [navigate, setSelectedNetwork]
  )

  useEffect(() => {
    if (!window.__TAURI__) {
      return
    }

    if (window.deepLink) {
      // On init
      handleDeepLink(window.deepLink).then(() => {
        // Reset so that it won't be used again
        window.deepLink = undefined
      })
    }
    // On deep link event while the app is open
    const unlisten = listen('deep-link-received', (event) => {
      handleDeepLink(event.payload as string)
    })

    return () => {
      unlisten.then((f) => f())
    }
  }, [handleDeepLink])
}
