// import { onOpenUrl } from '@tauri-apps/plugin-deep-link'
//
// await onOpenUrl((urls) => {
//   console.log('deep link:', urls)
// })

export function useDeepLink() {
  // const setSelectedNetwork = useSetSelectedNetwork()
  // const navigate = useNavigate()
  //
  // const handleDeepLink = useCallback(
  //   async (url: string | undefined) => {
  //     const options = parseDeepLink(url)
  //     if (options) {
  //       await setSelectedNetwork(options.networkId)
  //       if (options.transactionId) {
  //         navigate(Urls.Explore.Transaction.ById.build({ transactionId: options.transactionId, networkId: options.networkId }))
  //       } else {
  //         navigate(Urls.Index.build({}))
  //       }
  //     }
  //   },
  //   [navigate, setSelectedNetwork]
  // )
  //
  // useEffect(() => {
  //   if (!window.__TAURI__) {
  //     return
  //   }
  //
  //   if (window.deepLink) {
  //     // On init
  //     handleDeepLink(window.deepLink).then(() => {
  //       // Reset so that it won't be used again
  //       window.deepLink = undefined
  //     })
  //   }
  //   // On deep link event while the app is open
  //   const unlisten = listen('deep-link-received', (event) => {
  //     handleDeepLink(event.payload as string)
  //   })
  //
  //   return () => {
  //     unlisten.then((f) => f())
  //   }
  // }, [handleDeepLink])
}
