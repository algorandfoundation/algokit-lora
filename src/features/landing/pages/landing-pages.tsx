import { useRequiredParam } from '@/features/common/hooks/use-required-param'
import { selectedNetworkAtom, settingsStore } from '@/features/settings/data'
import { UrlParams } from '@/routes/urls'
import { useSetAtom } from 'jotai'
import { Loader } from 'lucide-react'
import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

export function LandingPage() {
  const { networkId } = useRequiredParam(UrlParams.NetworkId)
  const setSelectedNetwork = useSetAtom(selectedNetworkAtom, { store: settingsStore })
  const location = useLocation()
  const navigate = useNavigate()

  // TODO: return 404 if networkId is not valid
  useEffect(() => {
    setSelectedNetwork(networkId)
    let to = location.pathname.replace(`/${networkId}`, '')
    if (!to) {
      // If the pathname is just the networkId, redirect to the root
      to = '/'
    }

    navigate(to)
  }, [location.pathname, navigate, networkId, setSelectedNetwork])

  return <Loader className="size-10 animate-spin" />
}
