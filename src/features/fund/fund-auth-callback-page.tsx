import { PageTitle } from '@/features/common/components/page-title'
import { fundPageTitle } from './fund-page'
import { useAuth0 } from '@auth0/auth0-react'
import { PageLoader } from '../common/components/page-loader'

export function FundAuthCallbackPage() {
  const { error } = useAuth0()

  if (error) {
    throw error
  }

  // This should always be a transient page, so we can simply show a loader.
  return (
    <>
      <PageTitle title={fundPageTitle} />
      <PageLoader />
    </>
  )
}
