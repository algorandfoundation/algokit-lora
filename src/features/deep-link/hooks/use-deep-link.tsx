import { useSetSelectedNetwork } from '@/features/network/data'
import { Urls } from '@/routes/urls'
// import { listen } from '@tauri-apps/api/event'
import { useCallback, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { parseDeepLink } from '../parse-deep-link'
import { onOpenUrl } from '@tauri-apps/plugin-deep-link'

export function useDeepLink() {
  const setSelectedNetwork = useSetSelectedNetwork()
  const navigate = useNavigate()
  const isListernerActive = useRef(false)
  console.log(`got here`)

  const handleDeepLink = useCallback(
    async (url: string | undefined) => {
      const options = parseDeepLink(url)
      if (options) {
        await setSelectedNetwork(options.networkId)
        if (options.transactionId) {
          navigate(Urls.Explore.Transaction.ById.build({ transactionId: options.transactionId, networkId: options.networkId }))
        } else {
          const url = Urls.Index.build({})
          navigate(url)
        }
      }
    },
    [navigate, setSelectedNetwork]
  )

  useEffect(() => {
    if (isListernerActive.current) {
      return
    }
    console.log(`Setting up deep link listener`)
    const unlisten = onOpenUrl((url) => {
      console.log(`Handling deep link: ${url}`)
      alert(`Handling deep link: ${url}`)
      // handleDeepLink(url)
    })
    isListernerActive.current = true

    return () => {
      unlisten.then(() => {
        isListernerActive.current = false
      })
    }
    // if (!window.__TAURI__) {
    // if (window.deepLink) {
    //   console.log(`Handling deep link: ${window.deepLink}`)
    //   // On init
    //   handleDeepLink(window.deepLink).then(() => {
    //     // Reset so that it won't be used again
    //     window.deepLink = undefined
    //   })
    // }
    // // On deep link event while the app is open
    // const unlisten = listen('deep-link-received', (event) => {
    //   handleDeepLink(event.payload as string)
    // })

    // return () => {
    //   unlisten.then((f) => f())
    // }
  }, [handleDeepLink])
}
