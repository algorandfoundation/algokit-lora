import { useCreateAppInterfaceStateMachine } from '../../data'
import { UploadAppSpec } from './upload-app-spec'
import { DeployApp } from './deploy-app'
import { DeploymentDetails, DeploymentDetailsFormData, DeploymentMode } from './deployment-details'
import { AppSpec, AppSpecStandard } from '../../data/types'
import { useCallback } from 'react'

type Props = {
  machine: ReturnType<typeof useCreateAppInterfaceStateMachine>
}

export function FromDeploymentWorkflow({ machine }: Props) {
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
      name: data.name,
      version: data.version,
      updatable: data.updatable,
      deletable: data.deletable,
      templateParams: data.templateParams,
    })
  }, [])
  const onDeploymentDetailsCanceled = useCallback(() => {
    send({ type: 'detailsCancelled' })
  }, [])

  if (state.matches({ fromAppDeployment: 'appSpec' })) {
    return (
      <UploadAppSpec
        supportedStandards={[AppSpecStandard.ARC32, AppSpecStandard.ARC56]}
        file={state.context.file}
        onCompleted={onAppSpecUploaded}
        onCanceled={onAppSpecCanceled}
      />
    )
  } else if (state.matches({ fromAppDeployment: 'appDetails' }) && state.context.appSpec) {
    return (
      <DeploymentDetails
        mode={DeploymentMode.Create}
        appSpec={state.context.appSpec}
        formData={{
          name: state.context.name,
          version: state.context.version,
          updatable: state.context.updatable,
          deletable: state.context.deletable,
          templateParams: state.context.templateParams,
        }}
        onCompleted={onDeploymentDetailsCompleted}
        onCanceled={onDeploymentDetailsCanceled}
      />
    )
  } else if (state.matches({ fromAppDeployment: 'deployment' })) {
    return <DeployApp machine={machine} />
  }
  return undefined
}
