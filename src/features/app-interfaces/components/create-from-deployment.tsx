import { useCreateAppInterfaceStateMachine } from '../data/create-app-interface'
import { WIPUploadAppSpec } from './wip-upload-app-spec'
import { WIPDeployApp } from './wip-deploy-app'
import { WIPDeploymentDetails } from './wip-deployment-details'
import { AppSpecStandard } from '../data/types'

type Props = {
  machine: ReturnType<typeof useCreateAppInterfaceStateMachine>
}

// TODO: NC - Handle state machine being reset when connecting a wallet (maybe block buttons until a wallet is connected?)

export function CreateFromDeployment({ machine }: Props) {
  const [state] = machine

  if (state.matches({ fromAppDeployment: 'appSpec' })) {
    return <WIPUploadAppSpec machine={machine} supportedStandards={[AppSpecStandard.ARC32]} />
  } else if (state.matches({ fromAppDeployment: 'appDetails' })) {
    return <WIPDeploymentDetails machine={machine} />
  } else if (state.matches({ fromAppDeployment: 'deployment' })) {
    return <WIPDeployApp machine={machine} />
  }
  return undefined
}
