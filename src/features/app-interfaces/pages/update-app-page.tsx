import { PageTitle } from '@/features/common/components/page-title'
import { useAppInterface, useUpdateAppInterfaceStateMachine } from '../data'
import { PageLoader } from '@/features/common/components/page-loader'
import { UrlParams, Urls } from '@/routes/urls'
import { invariant } from '@/utils/invariant'
import { useTitle } from '@/utils/use-title'
import { useSelectedNetwork } from '@/features/network/data'
import { useRequiredParam } from '@/features/common/hooks/use-required-param'
import { isInteger } from '@/utils/is-integer'
import { appInterfaceFailedToLoadMessage, appInterfaceNotFoundMessage, applicationInvalidIdMessage, updateAppPageTitle } from './labels'
import { RenderLoadable } from '@/features/common/components/render-loadable'
import { AppInterfaceEntity } from '@/features/common/data/indexed-db'
import { UploadAppSpec } from '../components/create/upload-app-spec'
import { AppSpecStandard } from '../data/types'
import { useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { DeploymentDetails } from '../components/create/deployment-details'
import { Arc56Contract } from '@algorandfoundation/algokit-utils/types/app-arc56'
import { AlgoAppSpec, AbiContract } from '../data/types/arc-32/application'

function UpdateAppInner({ appInterface }: { appInterface: AppInterfaceEntity }) {
  const navigate = useNavigate()
  const [selectedNetwork] = useSelectedNetwork()
  const machine = useUpdateAppInterfaceStateMachine(appInterface)
  const [state, send] = machine

  const onAppSpecUploaded = useCallback((file: File, appSpec: AlgoAppSpec | AbiContract | Arc56Contract) => {
    send({
      type: 'appSpecUploadCompleted',
      file,
      appSpec,
    })
  }, [])
  const onAppSpecCanceled = useCallback(() => {
    send({ type: 'appSpecUploadCancelled' })
  }, [])

  useEffect(() => {
    if (state.matches('canceled')) {
      navigate(Urls.Network.AppLab.Edit.ById.build({ networkId: selectedNetwork, applicationId: appInterface.applicationId.toString() }))
    }
  }, [navigate, selectedNetwork, state])

  if (state.matches('appSpec')) {
    return (
      <UploadAppSpec
        supportedStandards={[AppSpecStandard.ARC32, AppSpecStandard.ARC56]}
        onCompleted={onAppSpecUploaded}
        onCanceled={onAppSpecCanceled}
      />
    )
  } else if (state.matches('appDetails')) {
    return <DeploymentDetails machine={machine} />
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
  const [loadableAppInterface] = useAppInterface(applicationId)

  return (
    <>
      <PageTitle title={updateAppPageTitle} />
      <RenderLoadable loadable={loadableAppInterface} transformError={transformError} fallback={<PageLoader />}>
        {(appInterface) => <UpdateAppInner appInterface={appInterface} />}
      </RenderLoadable>
    </>
  )
}
