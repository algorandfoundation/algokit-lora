import { useCallback } from 'react'
import { Button } from '@/features/common/components/button'
import { useAuth0 } from '@auth0/auth0-react'

export const dispenserApiLoginButtonLabel = 'log in to fund your account'

export function DispenserApiLoggedOut() {
  const { loginWithPopup } = useAuth0()

  const logIn = useCallback(async () => {
    await loginWithPopup()
  }, [loginWithPopup])

  return (
    <div>
      <p>
        To help protect this network, we impose daily fund limits.
        <br />
        Please&nbsp;
        <Button onClick={logIn} variant="link" className="h-auto p-0 text-base">
          {dispenserApiLoginButtonLabel}
        </Button>
        .
      </p>
    </div>
  )
}
