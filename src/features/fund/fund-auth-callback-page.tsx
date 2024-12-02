import { PageTitle } from '@/features/common/components/page-title'
import { fundPageTitle } from './fund-page'
import { useAuth0 } from '@auth0/auth0-react'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Urls } from '@/routes/urls'
import { PageLoader } from '../common/components/page-loader'

export function FundAuthCallbackPage() {
  const { error, handleRedirectCallback, isAuthenticated } = useAuth0()
  const navigate = useNavigate()
  if (error) {
    throw error
  }

  useEffect(() => {
    handleRedirectCallback(window.location.href)
  }, [handleRedirectCallback])

  useEffect(() => {
    if (isAuthenticated) {
      navigate(Urls.Network.Fund.build({ networkId: '_' }))
    }
  }, [isAuthenticated, navigate])

  // This should always be a transient page, so we can simply show a loader.
  return (
    <>
      <PageTitle title={fundPageTitle} />
      <PageLoader />
    </>
  )
}
