import { PageTitle } from '@/features/common/components/page-title'
import { getAppInterface, useUpdateAppInterfaceStateMachine } from '../data'
import { PageLoader } from '@/features/common/components/page-loader'
import { UrlParams, Urls } from '@/routes/urls'
import { invariant } from '@/utils/invariant'
import { useTitle } from '@/utils/use-title'
import { useSelectedNetwork } from '@/features/network/data'
import { useRequiredParam } from '@/features/common/hooks/use-required-param'
import { isInteger } from '@/utils/is-integer'
import { appInterfaceFailedToLoadMessage, appInterfaceNotFoundMessage, applicationInvalidIdMessage, updateAppPageTitle } from './labels'
import { RenderLoadable } from '@/features/common/components/render-loadable'
import { dbConnectionAtom } from '@/features/common/data/indexed-db'
import { UploadAppSpec } from '../components/create/upload-app-spec'
import { AppSpec, AppSpecStandard, UpdateAppContext } from '../data/types'
import { useCallback, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { DeploymentDetails, DeploymentDetailsFormData, DeploymentMode } from '../components/create/deployment-details'
import { getApplicationResultAtom } from '@/features/applications/data'
import { atom, useAtomValue } from 'jotai'
import { loadable } from 'jotai/utils'
import { ApplicationId } from '@/features/applications/data/types'

function UpdateAppInner({ context }: { context: UpdateAppContext }) {
  const navigate = useNavigate()
  const [selectedNetwork] = useSelectedNetwork()
  const machine = useUpdateAppInterfaceStateMachine(context)
  const [state, send] = machine

  const onAppSpecUploaded = useCallback((file: File, appSpec: AppSpec) => {
    send({
      type: 'appSpecUploadCompleted',
      file,
      appSpec,
    })
  }, [])
  const onAppSpecCanceled = useCallback(() => {
    send({ type: 'appSpecUploadCancelled' })
  }, [])

  const onDeploymentDetailsCompleted = useCallback((data: DeploymentDetailsFormData) => {
    send({
      type: 'detailsCompleted',
      version: data.version,
      updatable: data.updatable,
      deletable: data.deletable,
      templateParams: data.templateParams,
    })
  }, [])
  const onDeploymentDetailsCanceled = useCallback(() => {
    send({ type: 'detailsCancelled' })
  }, [])

  useEffect(() => {
    if (state.matches('canceled')) {
      navigate(
        Urls.Network.AppLab.Edit.ById.build({
          networkId: selectedNetwork,
          applicationId: context.current.appInterface.applicationId.toString(),
        })
      )
    }
  }, [navigate, selectedNetwork, state])

  if (state.matches('appSpec')) {
    return (
      <UploadAppSpec
        supportedStandards={[AppSpecStandard.ARC32, AppSpecStandard.ARC56]}
        file={state.context.file}
        onCompleted={onAppSpecUploaded}
        onCanceled={onAppSpecCanceled}
      />
    )
  } else if (state.matches('appDetails') && state.context.appSpec) {
    return (
      <DeploymentDetails
        mode={DeploymentMode.Update}
        appSpec={state.context.appSpec}
        formData={{
          name: state.context.current.appInterface.name,
          version: state.context.version,
          updatable: state.context.updatable,
          deletable: state.context.deletable,
          templateParams: state.context.templateParams,
        }}
        onCompleted={onDeploymentDetailsCompleted}
        onCanceled={onDeploymentDetailsCanceled}
      />
    )
  }

  return <PageLoader />
}

const transformError = (e: Error & { status?: number }) => {
  // This is needed because the App interface not found doesn't return a 404 status code
  if (e.message.includes(appInterfaceNotFoundMessage)) {
    e.message = appInterfaceNotFoundMessage
    e.status = 404
    return e
  }

  // eslint-disable-next-line no-console
  console.error(e)
  return new Error(appInterfaceFailedToLoadMessage)
}

export function UpdateAppPage() {
  useTitle(updateAppPageTitle)
  const { applicationId: _applicationId } = useRequiredParam(UrlParams.ApplicationId)
  invariant(isInteger(_applicationId), applicationInvalidIdMessage)

  const applicationId = BigInt(_applicationId)
  const [loadableUpdateAppContext] = useLoadbleUpdateAppContext(applicationId)

  return (
    <>
      <PageTitle title={updateAppPageTitle} />
      <RenderLoadable loadable={loadableUpdateAppContext} transformError={transformError} fallback={<PageLoader />}>
        {(appInterface) => <UpdateAppInner context={appInterface} />}
      </RenderLoadable>
    </>
  )
}

const useLoadbleUpdateAppContext = (applicationId: ApplicationId) => {
  const fooAtom = useMemo(() => {
    return atom(async (get) => {
      const dbConnection = await get(dbConnectionAtom)

      const appInterface = await getAppInterface(dbConnection, applicationId)
      invariant(appInterface, appInterfaceNotFoundMessage)

      const applicationResult = await get(getApplicationResultAtom(applicationId))

      return {
        current: {
          appInterface,
          application: applicationResult,
        },
      } satisfies UpdateAppContext
    })
  }, [applicationId])
  return [useAtomValue(loadable(fooAtom))] as const
}
