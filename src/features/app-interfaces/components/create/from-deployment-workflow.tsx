import { useCreateAppInterfaceStateMachine } from '../../data'
import { UploadAppSpec } from './upload-app-spec'
import { DeployApp } from './deploy-app'
import { DeploymentDetails } from './deployment-details'
import { AppSpecStandard } from '../../data/types'
import { useCallback } from 'react'
import { Arc56Contract } from '@algorandfoundation/algokit-utils/types/app-arc56'
import { AlgoAppSpec, AbiContract } from '../../data/types/arc-32/application'

type Props = {
  machine: ReturnType<typeof useCreateAppInterfaceStateMachine>
}

export function FromDeploymentWorkflow({ machine }: Props) {
  const [state, send] = machine

  // TODO: a union type for all 3
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

  if (state.matches({ fromAppDeployment: 'appSpec' })) {
    return (
      <UploadAppSpec
        supportedStandards={[AppSpecStandard.ARC32, AppSpecStandard.ARC56]}
        onCompleted={onAppSpecUploaded}
        onCanceled={onAppSpecCanceled}
      />
    )
  } else if (state.matches({ fromAppDeployment: 'appDetails' })) {
    return <DeploymentDetails machine={machine} />
  } else if (state.matches({ fromAppDeployment: 'deployment' })) {
    return <DeployApp machine={machine} />
  }
  return undefined
}
