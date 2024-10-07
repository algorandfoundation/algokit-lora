import { AnyUrlTemplate } from '@/routes/url-template'
import { stripUrlParams } from '@/routes/urls'
import { useEffect, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { PageLoader } from '../components/page-loader'

type Props = {
  from: AnyUrlTemplate
  to: AnyUrlTemplate
}

export function RedirectPage({ from: _from, to: _to }: Props) {
  const navigate = useNavigate()
  const location = useLocation()

  const [from, to] = useMemo(() => {
    return [stripUrlParams(_from.toString()), stripUrlParams(_to.toString())] as const
  }, [_from, _to])

  useEffect(() => {
    navigate(location.pathname.replace(from, to))
  }, [location.pathname, navigate, from, to])

  return <PageLoader />
}
