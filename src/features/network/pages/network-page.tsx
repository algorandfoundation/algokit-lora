import { useRequiredParam } from '@/features/common/hooks/use-required-param'
import { UrlParams } from '@/routes/urls'
import { useNetworksConfigs, useSelectedNetwork } from '@/features/settings/data'
import { useLocation, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'

type Props = {
  children: React.ReactNode
}
export function NetworkPage({ children }: Props) {
  const networksConfigs = useNetworksConfigs()
  const { networkId } = useRequiredParam(UrlParams.NetworkId)

  const isWildcardNetworkRoute = networkId === '_'
  const networkConfig = networksConfigs.find((c) => c.id === networkId)
  if (!networkConfig && !isWildcardNetworkRoute) {
    throw new Error(`"${networkId}" is not a valid network.`)
  }

  const navigate = useNavigate()
  const [selectedNetwork] = useSelectedNetwork()
  const { pathname, search, hash } = useLocation()

  useEffect(() => {
    if (isWildcardNetworkRoute) {
      navigate(pathname.replace('_', selectedNetwork) + search + hash)
    }
  }, [hash, pathname, search, navigate, selectedNetwork, isWildcardNetworkRoute])

  return children
}
