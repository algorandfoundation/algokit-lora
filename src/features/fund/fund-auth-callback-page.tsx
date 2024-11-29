import { PageTitle } from '@/features/common/components/page-title'
import { fundPageTitle } from './fund-page'
import { useAuth0 } from '@auth0/auth0-react'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Urls } from '@/routes/urls'

// TODO: PD - logout failed
// TODO: PD - fix the bug where closing the app during the auth process -> this fails
export function FundAuthCallbackPage() {
  const { error, handleRedirectCallback, isAuthenticated } = useAuth0()
  const navigate = useNavigate()
  // console.log('FundAuthCallbackPage', error, user, isLoading, isAuthenticated, window.location.href)
  if (error) {
    throw error
  }

  useEffect(() => {
    handleRedirectCallback(window.location.href)
    // ;(async () => {
    //   await

    //   // console.log(r)
    // })()
    // refreshDataProviderToken()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      navigate(Urls.Network.Fund.build({ networkId: '_' }))
    }
  }, [isAuthenticated, navigate])

  // This should always be a transient page, so we can simply show a loader.
  return (
    <>
      <PageTitle title={fundPageTitle} />
      <span>FundAuthCallbackPage</span>
    </>
  )
}

//tauri://localhost/fund/auth-callback?code=buqKbyDVTOGG8omsvbZVAL0OYCOlIYfEA0jS93_0qMKJW&state=Mzk5SzQ5REd5WEhPeTY4Sk1fLl9WeUhfZ3ROVGJycjdVeUNEUDVvdUI1dQ%3D%3D
//algokit-lora://fund/auth-callback?code=foo&state=asd
