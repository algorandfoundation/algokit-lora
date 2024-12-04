import { Button } from '@/features/common/components/button'
import { Urls } from '@/routes/urls'
import { useAuth0 } from '@auth0/auth0-react'
import { useCallback } from 'react'
import { open } from '@tauri-apps/plugin-shell'
import { LORA_URI_SCHEME } from '@/features/common/constants'

export function DispenserApiUserInfo() {
  const { isAuthenticated, user, logout } = useAuth0()

  const logOut = useCallback(async () => {
    if (window.__TAURI_INTERNALS__) {
      await logout({
        logoutParams: {
          returnTo: `${LORA_URI_SCHEME}:/${Urls.Network.Fund.build({ networkId: '_' })}`,
        },
        openUrl: async (url) => {
          await open(url)
        },
      })
    } else {
      await logout({
        logoutParams: {
          returnTo: `${window.location.origin}${Urls.Network.Fund.build({ networkId: '_' })}`,
        },
      })
    }
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
