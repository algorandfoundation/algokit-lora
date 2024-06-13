import { useRequiredParam } from '@/features/common/hooks/use-required-param'
import { UrlParams, Urls } from '@/routes/urls'
import { networksConfigs } from '@/features/settings/data'
import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'

type Props = {
  children: React.ReactNode
}
export function NetworkPage({ children }: Props) {
  const { networkId } = useRequiredParam(UrlParams.NetworkId)
  const navigate = useNavigate()

  useEffect(() => {
    if (!networksConfigs.find((c) => c.id === networkId)) {
      navigate(Urls.Index.build({}))
    }
  }, [navigate, networkId])

  return children
}
