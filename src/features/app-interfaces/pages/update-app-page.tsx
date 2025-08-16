import { PageTitle } from '@/features/common/components/page-title'
import { useLoadbleUpdateAppContext, useUpdateAppInterfaceStateMachine } from '../data'
import { PageLoader } from '@/features/common/components/page-loader'
import { UrlParams, Urls } from '@/routes/urls'
import { invariant } from '@/utils/invariant'
import { useTitle } from '@/utils/use-title'
import { useSelectedNetwork } from '@/features/network/data'
import { useRequiredParam } from '@/features/common/hooks/use-required-param'
import { isInteger } from '@/utils/is-integer'
import { appInterfaceFailedToLoadMessage, appInterfaceNotFoundMessage, applicationInvalidIdMessage, updateAppPageTitle } from './labels'
import { RenderLoadable } from '@/features/common/components/render-loadable'
import { UploadAppSpec } from '../components/create/upload-app-spec'
import { AppSpec, AppSpecStandard, UpdateAppContext } from '../data/types'
import { useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { DeploymentDetails, DeploymentDetailsFormData, DeploymentMode } from '../components/create/deployment-details'
import { algorandClient } from '@/features/common/data/algo-client'
import { asArc56AppSpec } from '@/features/applications/mappers'
import { asTealTemplateParams } from '../mappers'
import { calculateExtraProgramPages } from '@/features/common/utils'
import { DeployApp } from '../components/edit/deploy-app'

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

  const onDeploymentDetailsCompleted = useCallback(
    async (data: DeploymentDetailsFormData) => {
      const appManager = algorandClient.app

      invariant(state.context.appSpec, 'AppSpec is not set')
      const arc56AppSpec = asArc56AppSpec(state.context.appSpec)
      invariant(arc56AppSpec.source?.approval, 'Approval program is not set')
      invariant(arc56AppSpec.source?.clear, 'Clear program is not set')

      const tealTemplateParams = asTealTemplateParams(state.context.templateParams)
      // TODO: refactor this out
      const newCompiledApprovalProgram = await appManager.compileTealTemplate(
        Buffer.from(arc56AppSpec.source.approval, 'base64').toString('utf-8'),
        tealTemplateParams,
        {
          updatable: state.context.updatable,
          deletable: state.context.deletable,
        }
      )
      const newCompiledClearStateProgram = await appManager.compileTealTemplate(
        Buffer.from(arc56AppSpec.source.clear, 'base64').toString('utf-8'),
        tealTemplateParams
      )

      const existingApprovalBytes = context.current.application.params.approvalProgram
      const existingClearStateBytes = context.current.application.params.clearStateProgram
      const existingApproval = Buffer.from(existingApprovalBytes).toString('base64')
      const existingClear = Buffer.from(existingClearStateBytes).toString('base64')
      const existingExtraPages = calculateExtraProgramPages(existingApprovalBytes, existingClearStateBytes)

      const newApprovalBytes = newCompiledApprovalProgram.compiledBase64ToBytes
      const newClearBytes = newCompiledClearStateProgram.compiledBase64ToBytes
      const newExtraPages = calculateExtraProgramPages(newApprovalBytes, newClearBytes)

      const isUpdate = newCompiledApprovalProgram.compiled !== existingApproval || newCompiledClearStateProgram.compiled !== existingClear
      const isSchemaBreak =
        (context.current.application.params.globalStateSchema?.numUint ?? 0) < arc56AppSpec.state.schema.global.ints ||
        (context.current.application.params.localStateSchema?.numUint ?? 0) < arc56AppSpec.state.schema.local.ints ||
        (context.current.application.params.globalStateSchema?.numByteSlice ?? 0) < arc56AppSpec.state.schema.global.bytes ||
        (context.current.application.params.localStateSchema?.numByteSlice ?? 0) < arc56AppSpec.state.schema.local.bytes ||
        existingExtraPages < newExtraPages

      send({
        type: 'detailsCompleted',
        version: data.version,
        updatable: data.updatable,
        deletable: data.deletable,
        templateParams: data.templateParams,
      })
    },
    [state]
  )

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
  } else if (state.matches('deployment')) {
    return <DeployApp />
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
