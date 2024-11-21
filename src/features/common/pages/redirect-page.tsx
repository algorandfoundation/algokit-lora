import { AnyUrlTemplate } from '@/routes/url-template'
import { stripUrlParams } from '@/routes/urls'
import { useEffect, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { PageLoader } from '../components/page-loader'
import { useSelectedNetwork } from '@/features/network/data'

type Props = {
  from: AnyUrlTemplate
  to: AnyUrlTemplate
}

export function RedirectPage({ from: _from, to: _to }: Props) {
  const navigate = useNavigate()
  const location = useLocation()
  const [selectedNetwork] = useSelectedNetwork()

  const [from, to] = useMemo(() => {
    return [stripUrlParams(_from.toString(), selectedNetwork), stripUrlParams(_to.toString(), selectedNetwork)] as const
  }, [_from, _to, selectedNetwork])

  useEffect(() => {
    navigate(location.pathname.replace(from, to))
  }, [location.pathname, navigate, from, to])

  return <PageLoader />
}
