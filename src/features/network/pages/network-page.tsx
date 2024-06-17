import { useRequiredParam } from '@/features/common/hooks/use-required-param'
import { UrlParams } from '@/routes/urls'
import { networksConfigs, useSelectedNetwork } from '@/features/settings/data'
import { useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'

type Props = {
  children: React.ReactNode
}
export function NetworkPage({ children }: Props) {
  const [isValidNetworkId, setIsValidNetworkId] = useState<boolean>(false)
  const [selectedNetwork] = useSelectedNetwork()
  const { networkId } = useRequiredParam(UrlParams.NetworkId)
  const navigate = useNavigate()
  const { pathname, search, hash } = useLocation()

  useEffect(() => {
    if (networkId === '_') {
      navigate(pathname.replace('_', selectedNetwork) + search + hash)
    }
    setIsValidNetworkId(!!networksConfigs.find((c) => c.id === networkId))
  }, [hash, pathname, search, navigate, networkId, selectedNetwork])

  return isValidNetworkId ? children : <div>Network "{networkId}" is not a valid network.</div>
}
