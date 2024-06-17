import { useRequiredParam } from '@/features/common/hooks/use-required-param'
import { UrlParams } from '@/routes/urls'
import { networksConfigs, useSelectedNetwork } from '@/features/settings/data'
import { useLocation, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'

type Props = {
  children: React.ReactNode
}
export function NetworkPage({ children }: Props) {
  const [selectedNetwork] = useSelectedNetwork()
  const { networkId } = useRequiredParam(UrlParams.NetworkId)
  const navigate = useNavigate()
  const { pathname, search, hash } = useLocation()
  const isWildcardNetworkRoute = networkId === '_'
  const isValidNetwork = isWildcardNetworkRoute || (networksConfigs.find((c) => c.id === networkId) ? true : false)
  if (!isValidNetwork) {
    throw new Error(`"${networkId}" is not a valid network.`)
  }

  useEffect(() => {
    if (isWildcardNetworkRoute) {
      navigate(pathname.replace('_', selectedNetwork) + search + hash)
    }
  }, [hash, pathname, search, navigate, selectedNetwork, isWildcardNetworkRoute])

  return children
}
