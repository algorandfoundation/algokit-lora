import { useSetSelectedNetwork } from '@/features/network/data'
import { Urls } from '@/routes/urls'
import { listen } from '@tauri-apps/api/event'
import { useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { parseDeepLink } from '../parse-deep-link'

export function useDeepLink() {
  const setSelectedNetwork = useSetSelectedNetwork()
  const navigate = useNavigate()

  const handleDeepLink = useCallback(
    async (url: string | undefined) => {
      const options = parseDeepLink(url)
      console.log(options)
      if (options) {
        console.log('set network')
        await setSelectedNetwork(options.networkId)
        if (options.transactionId) {
          navigate(Urls.Explore.Transaction.ById.build({ transactionId: options.transactionId, networkId: options.networkId }))
        } else {
          const url = Urls.Index.build({})
          console.log(url)
          navigate(url)
          // navigate('/settings')
          console.log('navigate to', url)
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
      console.log(event)
      handleDeepLink(event.payload as string)
    })

    return () => {
      unlisten.then((f) => f())
    }
  }, [handleDeepLink])
}
