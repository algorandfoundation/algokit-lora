import { useCreateAppInterfaceStateMachine } from '../../data'
import { UploadAppSpec } from './upload-app-spec'
import { DeployApp } from './deploy-app'
import { DeploymentDetails } from './deployment-details'
import { AppSpecStandard } from '../../data/types'

type Props = {
  machine: ReturnType<typeof useCreateAppInterfaceStateMachine>
}

export function FromDeploymentWorkflow({ machine }: Props) {
  const [state] = machine

  if (state.matches({ fromAppDeployment: 'appSpec' })) {
    return <UploadAppSpec machine={machine} supportedStandards={[AppSpecStandard.ARC32]} />
  } else if (state.matches({ fromAppDeployment: 'appDetails' })) {
    return <DeploymentDetails machine={machine} />
  } else if (state.matches({ fromAppDeployment: 'deployment' })) {
    return <DeployApp machine={machine} />
  }
  return undefined
}
