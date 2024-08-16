import { Button } from '@/features/common/components/button'
import { Urls } from '@/routes/urls'
import { useAuth0 } from '@auth0/auth0-react'
import { useCallback } from 'react'

export function DispenserApiUserInfo() {
  const { isAuthenticated, user, logout } = useAuth0()

  const logOut = useCallback(async () => {
    await logout({
      logoutParams: {
        returnTo: `${window.location.origin}${Urls.Fund.build({})}`,
      },
    })
  }, [logout])

  if (!isAuthenticated) {
    return undefined
  }

  return (
    <p className="flex items-center">
      {user?.email && <span className="truncate">Connected as: {user?.email}&nbsp;</span>}
      <Button onClick={logOut} variant="link" className="h-auto p-0 text-base">
        Log out
      </Button>
    </p>
  )
}
