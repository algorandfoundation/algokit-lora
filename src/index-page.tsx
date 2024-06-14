import { useSelectedNetwork } from '@/features/settings/data'
import { useNavigate } from 'react-router-dom'
import { Urls } from '@/routes/urls'
import { Loader } from 'lucide-react'
import { useEffect } from 'react'

export function IndexPage() {
  const [selectedNetwork] = useSelectedNetwork()
  const navigate = useNavigate()

  useEffect(() => {
    navigate(Urls.Explore.build({ networkId: selectedNetwork }))
  }, [navigate, selectedNetwork])

  return <Loader className="size-10 animate-spin" />
}
