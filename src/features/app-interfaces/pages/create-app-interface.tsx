import { Button } from '@/features/common/components/button'
import { Card, CardContent } from '@/features/common/components/card'
import { PageTitle } from '@/features/common/components/page-title'
import { cn, isArc32AppSpec, isArc4AppSpec } from '@/features/common/utils'
import { useCreateAppInterfaceStateMachine } from '../data/create-app-interface'
import { CreateFromAppId } from '../components/create-from-app-id'
import { CreateFromDeployment } from '../components/create-from-deployment'
import { PageLoader } from '@/features/common/components/page-loader'
import { useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Urls } from '@/routes/urls'
import { toast } from 'react-toastify'
import { invariant } from '@/utils/invariant'
import { AppSpecStandard, Arc32AppSpec, Arc4AppSpec } from '../data/types'
import { useCreateAppInterface } from '../data'

export const createAppInterfacePageTitle = 'Create App Interface'

function Inner() {
  const navigate = useNavigate()
  const createAppInterface = useCreateAppInterface()
  const machine = useCreateAppInterfaceStateMachine()
  const [state, send] = machine

  const create = useCallback(async () => {
    invariant(state.context.applicationId, 'Application ID is required')
    invariant(state.context.name, 'App interface name is required')
    invariant(state.context.appSpec, 'App spec is required')

    const common = {
      applicationId: state.context.applicationId,
      name: state.context.name,
      roundFirstValid: state.context.roundFirstValid,
      roundLastValid: state.context.roundLastValid,
    }

    if (isArc32AppSpec(state.context.appSpec)) {
      await createAppInterface({
        ...common,
        appSpec: state.context.appSpec as Arc32AppSpec,
        standard: AppSpecStandard.ARC32,
      })
    } else if (isArc4AppSpec(state.context.appSpec)) {
      await createAppInterface({
        ...common,
        appSpec: state.context.appSpec as Arc4AppSpec,
        standard: AppSpecStandard.ARC4,
      })
    } else {
      throw new Error('App spec standard is not supported')
    }

    toast.success(`App interface '${common.name}' has been created`)
  }, [
    createAppInterface,
    state.context.appSpec,
    state.context.applicationId,
    state.context.name,
    state.context.roundFirstValid,
    state.context.roundLastValid,
  ])

  useEffect(() => {
    if (state.matches('finished')) {
      create().then(() => navigate(Urls.AppLab.build({})))
    }
  }, [create, navigate, state])

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
    return <CreateFromAppId machine={machine} />
  } else if (state.matches('fromAppDeployment')) {
    return <CreateFromDeployment machine={machine} />
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
