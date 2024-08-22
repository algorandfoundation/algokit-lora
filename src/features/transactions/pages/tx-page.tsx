import { Loader2 as Loader } from 'lucide-react'
import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

export function TxPage() {
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const to = location.pathname.replace(`/tx`, '/transaction')
    navigate(to)
  }, [location.pathname, navigate])

  return <Loader className="size-10 animate-spin" />
}
