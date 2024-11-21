import { useRequiredParam } from '@/features/common/hooks/use-required-param'
import { UrlParams } from '@/routes/urls'
import { useNetworkConfigs, useSelectedNetwork } from '@/features/network/data'
import { useLocation, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'

type Props = {
  children: React.ReactNode
}

const wildcardNetworkRoute = '_'

export function NetworkPage({ children }: Props) {
  const { networkId: currentNetworkId } = useRequiredParam(UrlParams.NetworkId)
  const networkConfigs = useNetworkConfigs()

  if (!(currentNetworkId in networkConfigs) && currentNetworkId !== wildcardNetworkRoute) {
    throw new Error(`"${currentNetworkId}" is not a valid network.`)
  }

  const navigate = useNavigate()
  const [selectedNetwork, setSelectedNetwork] = useSelectedNetwork()
  const { pathname } = useLocation()

  useEffect(() => {
    if (currentNetworkId === selectedNetwork) {
      return
    }

    setSelectedNetwork(currentNetworkId)
    const newUrl = pathname.replace(selectedNetwork, currentNetworkId)
    navigate(newUrl, { replace: true })
  }, [currentNetworkId, navigate, pathname, selectedNetwork, setSelectedNetwork])

  return children
}
