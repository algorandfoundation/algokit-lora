import { useRequiredParam } from '@/features/common/hooks/use-required-param'
import { UrlParams } from '@/routes/urls'
import { temporaryLocalNetSearchParams, useNetworkConfigs, useSelectedNetwork } from '@/features/network/data'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useEffect } from 'react'

type Props = {
  children: React.ReactNode
}

export function NetworkPage({ children }: Props) {
  const { networkId } = useRequiredParam(UrlParams.NetworkId)
  const networkConfigs = useNetworkConfigs()
  const [searchParams, setSearchParams] = useSearchParams()

  const isWildcardNetworkRoute = networkId === '_'
  if (!(networkId in networkConfigs) && !isWildcardNetworkRoute) {
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

  useEffect(() => {
    const initialParamCount = searchParams.size
    if (initialParamCount > 0) {
      searchParams.delete(temporaryLocalNetSearchParams.algodServer)
      searchParams.delete(temporaryLocalNetSearchParams.algodPort)
      searchParams.delete(temporaryLocalNetSearchParams.indexerServer)
      searchParams.delete(temporaryLocalNetSearchParams.indexerPort)
      searchParams.delete(temporaryLocalNetSearchParams.kmdServer)
      searchParams.delete(temporaryLocalNetSearchParams.kmdPort)
      if (searchParams.size < initialParamCount) {
        setSearchParams(searchParams)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return children
}
