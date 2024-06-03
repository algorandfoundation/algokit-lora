import { ReactNode, useEffect } from 'react'
import 'react-toastify/dist/ReactToastify.css'
import { listen } from '@tauri-apps/api/event'
import { useNavigate } from 'react-router-dom'
import { useSetAtom } from 'jotai'
import { selectedNetworkAtom, settingsStore } from '@/features/settings/data'
import { parseDeepLink } from '@/features/deep-link/parse-deep-link'
import { Urls } from '@/routes/urls'

type Props = {
  children?: ReactNode
}

export function DeepLinkPage({ children }: Props) {
  const setSelectedNetwork = useSetAtom(selectedNetworkAtom, { store: settingsStore })
  const navigate = useNavigate()

  useEffect(() => {
    function handleDeepLink(url: string | undefined) {
      const options = parseDeepLink(url)
      if (options) {
        setSelectedNetwork(options.networkId)
        // TODO: we should navigate to somewhere when the network is changed

        if (options.transactionId) {
          navigate(Urls.Explore.Transaction.ById.build({ transactionId: options.transactionId }))
        }
      }
    }

    // On init
    handleDeepLink(window.deepLink)

    // On deep link event while the app is open
    const unlisten = listen('deep-link-received', (event) => {
      handleDeepLink(event.payload as string)
    })

    return () => {
      unlisten.then((f) => f())
    }
  }, [navigate, setSelectedNetwork])

  return <>{children}</>
}
