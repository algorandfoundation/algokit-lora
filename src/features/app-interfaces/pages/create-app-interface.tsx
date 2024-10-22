import { PageTitle } from '@/features/common/components/page-title'
import { cn, isArc32AppSpec, isArc4AppSpec } from '@/features/common/utils'
import { useCreateAppInterfaceStateMachine } from '../data'
import { FromAppIdWorkflow } from '../components/create/from-app-id-workflow'
import { FromDeploymentWorkflow } from '../components/create/from-deployment-workflow'
import { PageLoader } from '@/features/common/components/page-loader'
import { useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Urls } from '@/routes/urls'
import { toast } from 'react-toastify'
import { invariant } from '@/utils/invariant'
import { AppSpecStandard, Arc32AppSpec, Arc4AppSpec } from '../data/types'
import { useCreateAppInterface } from '../data'
import { FromAppIdCard } from '../components/create/from-app-id-card'
import { FromDeploymentCard } from '../components/create/from-deployment-card'
import { asError } from '@/utils/error'

export const createAppInterfacePageTitle = 'Create App Interface'

function CreateAppInterfaceInner() {
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
      roundFirstValid: state.context.roundFirstValid !== undefined ? Number(state.context.roundFirstValid) : undefined,
      roundLastValid: state.context.roundLastValid !== undefined ? Number(state.context.roundLastValid) : undefined,
    }

    try {
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
    } catch (e: unknown) {
      const err = asError(e)
      toast.error(err.message)
      send({ type: 'createFailed' })
      return
    }

    toast.success(`App interface '${common.name}' has been created`)
    send({ type: 'createCompleted' })
  }, [
    createAppInterface,
    send,
    state.context.appSpec,
    state.context.applicationId,
    state.context.name,
    state.context.roundFirstValid,
    state.context.roundLastValid,
  ])

  useEffect(() => {
    if (state.matches({ fromAppId: 'create' }) || state.matches({ fromAppDeployment: 'create' })) {
      create()
    } else if (state.matches('finished')) {
      navigate(Urls.AppLab.build({}))
    }
  }, [create, navigate, state])

  if (state.matches('createAppInterface')) {
    return (
      <div className={cn('xl:w-3/4 grid grid-cols-1 lg:grid-cols-2 gap-4')}>
        <FromAppIdCard machine={machine} />
        <FromDeploymentCard machine={machine} />
      </div>
    )
  } else if (state.matches('fromAppId')) {
    return (
      <div className="xl:w-3/4">
        <FromAppIdWorkflow machine={machine} />
      </div>
    )
  } else if (state.matches('fromAppDeployment')) {
    return (
      <div className="xl:w-3/4">
        <FromDeploymentWorkflow machine={machine} />
      </div>
    )
  }

  return <PageLoader />
}

export function CreateAppInterface() {
  return (
    <>
      <PageTitle title={createAppInterfacePageTitle} />
      <CreateAppInterfaceInner />
    </>
  )
}
