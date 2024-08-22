import { ReactNode, useCallback, useRef } from 'react'
import { Header } from '../components/header'
import { LeftSideBarMenu } from '../components/left-side-bar-menu'
import { cn } from '@/features/common/utils'
import 'react-toastify/dist/ReactToastify.css'
import { useDeepLink } from '@/features/deep-link/hooks/use-deep-link'
import { ScrollRestoration, useNavigate } from 'react-router-dom'
import { SubscriberStatus } from '../components/subscriber-status'
import { useNetworkConfig, useShouldPromptForTokens } from '@/features/network/data'
import { TokenPromptDialog } from '@/features/network/components/token-prompt-dialog'
import { AppState, Auth0Provider } from '@auth0/auth0-react'
import { Urls } from '@/routes/urls'
import config from '@/config'

type Props = {
  children?: ReactNode
}

const callbackUrl = `${window.location.origin}${Urls.FundAuthCallback.build({})}`
const scope = 'openid email'

export function LayoutPage({ children }: Props) {
  useDeepLink()
  const shouldPromptForTokens = useShouldPromptForTokens()
  const networkConfig = useNetworkConfig()
  const mainContent = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  const navigateToCorrectRoute = useCallback(
    (appState?: AppState) => {
      navigate(appState?.returnTo ?? Urls.Fund.build({}))
    },
    [navigate]
  )

  const inner = (
    <div className="flex h-screen flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <LeftSideBarMenu />
        <div className="flex w-full flex-col">
          <SubscriberStatus />
          {shouldPromptForTokens && <TokenPromptDialog />}
          <main ref={mainContent} className="flex flex-1 items-start overflow-y-auto overflow-x-hidden">
            <div className={cn('grid w-full mb-4 mx-4')}>{!shouldPromptForTokens ? children : undefined}</div>
          </main>
        </div>
      </div>
      {/* This uses a patched version of this component to support scrolling non body containers. */}
      <ScrollRestoration elementRef={mainContent} />
    </div>
  )

  return networkConfig.dispenserApi ? (
    <Auth0Provider
      domain={config.dispenserAuth0Domain}
      clientId={config.dispenserAuth0ClientId}
      authorizationParams={{ audience: config.dispenserAuth0Audience, scope, redirect_uri: callbackUrl }}
      onRedirectCallback={navigateToCorrectRoute}
    >
      {inner}
    </Auth0Provider>
  ) : (
    inner
  )
}
