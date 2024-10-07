import { Button } from '@/features/common/components/button'
import { Card, CardContent } from '@/features/common/components/card'
import { PageTitle } from '@/features/common/components/page-title'
import { cn } from '@/features/common/utils'
import { useCreateAppInterfaceStateMachine } from '../data/create-app-interface'
import { CreateFromAppId } from '../components/create-from-app-id'
import { CreateFromDeployment } from '../components/create-from-deployment'
import { PageLoader } from '@/features/common/components/page-loader'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Urls } from '@/routes/urls'

export const createAppInterfacePageTitle = 'Create App Interface'

function Inner() {
  const navigate = useNavigate()
  const snapshot = useCreateAppInterfaceStateMachine()
  const [state, send] = snapshot

  useEffect(() => {
    if (state.matches('finished')) {
      navigate(Urls.AppLab.build({}))
    }
  }, [navigate, state])

  if (state.matches('createAppInterface')) {
    return (
      <div className={cn('grid grid-cols-1 lg:grid-cols-2 gap-4')}>
        <Card>
          <CardContent>
            <div>
              <h2>Use Existing App ID</h2>
              <span>Enter a previously deployed app id to create an app interface.</span>
              <Button onClick={() => send({ type: 'fromAppIdSelected' })}>Use existing</Button>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <div>
              <h2>Deploy New App</h2>
              <span>Deploy a new app and create an app interface.</span>
              <Button onClick={() => send({ type: 'fromAppDeploymentSelected' })}>Deploy new</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  } else if (state.matches('fromAppId')) {
    return <CreateFromAppId snapshot={snapshot} />
  } else if (state.matches('fromAppDeployment')) {
    return <CreateFromDeployment snapshot={snapshot} />
  }

  return <PageLoader />
}

export function CreateAppInterface() {
  return (
    <>
      <PageTitle title={createAppInterfacePageTitle} />
      <Inner />
    </>
  )
}
