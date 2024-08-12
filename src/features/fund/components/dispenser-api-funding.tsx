import { useAuth0 } from '@auth0/auth0-react'
import { DispenserApiLoggedOut } from './dispenser-api-logged-out'
import { DispenserApiLoggedIn } from './dispenser-api-logged-in'
import { NetworkConfig } from '@/features/network/data/types'
import { PageLoader } from '@/features/common/components/page-loader'

type Props = {
  networkConfig: NetworkConfig
}

export function DispenserApiFunding({ networkConfig }: Props) {
  const { isLoading, isAuthenticated } = useAuth0()
  return isLoading ? <PageLoader /> : isAuthenticated ? <DispenserApiLoggedIn networkConfig={networkConfig} /> : <DispenserApiLoggedOut />
}
