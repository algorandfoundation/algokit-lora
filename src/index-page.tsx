import { useNavigate } from 'react-router-dom'
import { Urls } from '@/routes/urls'
import { Loader2 as Loader } from 'lucide-react'
import { useEffect } from 'react'
import { useSelectedNetwork } from './features/network/data'

export function IndexPage() {
  const [selectedNetwork] = useSelectedNetwork()
  const navigate = useNavigate()

  useEffect(() => {
    navigate(Urls.Explore.build({ networkId: selectedNetwork }))
  }, [navigate, selectedNetwork])

  return <Loader className="size-10 animate-spin" />
}
