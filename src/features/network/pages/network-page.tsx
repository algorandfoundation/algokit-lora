import { useRequiredParam } from '@/features/common/hooks/use-required-param'
import { UrlParams, Urls } from '@/routes/urls'
import { useNetworkConfigs, useSelectedNetwork } from '@/features/network/data'
import { useLocation, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'

type Props = {
  children: React.ReactNode
}

const wildcardNetworkRoute = '_'

export function NetworkPage({ children }: Props) {
  const { networkId } = useRequiredParam(UrlParams.NetworkId)
  const networkConfigs = useNetworkConfigs()

  if (!(networkId in networkConfigs) && networkId !== wildcardNetworkRoute) {
    throw new Error(`"${networkId}" is not a valid network.`)
  }

  const navigate = useNavigate()
  const [selectedNetwork] = useSelectedNetwork()
  const { pathname, search, hash } = useLocation()

  useEffect(() => {
    if (networkId === wildcardNetworkRoute) {
      // Handle the wildcard network route
      navigate(pathname.replace(wildcardNetworkRoute, selectedNetwork) + search + hash, { replace: true })
    } else if (networkId !== selectedNetwork) {
      // When a user changes the network, their history will contain routes for the previous network.
      // This handles navigating the user to the explore page for the selected network, so they don't get 404s when navigating through history.
      navigate(Urls.Explore.build({ networkId: selectedNetwork }), { replace: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [networkId, selectedNetwork])

  return children
}
