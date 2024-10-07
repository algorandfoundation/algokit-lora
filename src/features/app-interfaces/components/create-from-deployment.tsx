import { useCreateAppInterfaceStateMachine } from '../data/create-app-interface'
import { WIPSelectAppSpecForm } from './wip-select-app-spec-form'
import { WIPDeployApp } from './wip-deploy-app'
import { WIPDetails } from './wip-details'

type Props = {
  snapshot: ReturnType<typeof useCreateAppInterfaceStateMachine>
}

// TODO: NC - Handle state machine being reset when connecting a wallet (maybe block buttons until a wallet is connected?)

export function CreateFromDeployment({ snapshot }: Props) {
  const [state] = snapshot

  if (state.matches({ fromAppDeployment: 'appSpec' })) {
    return <WIPSelectAppSpecForm snapshot={snapshot} />
  } else if (state.matches({ fromAppDeployment: 'appDetails' })) {
    return <WIPDetails snapshot={snapshot} />
  } else if (state.matches({ fromAppDeployment: 'deployment' })) {
    return (
      <WIPDeployApp snapshot={snapshot} />
      // <div>
      //   <span>fromAppDeployment 3</span>
      //   <Button onClick={() => send({ type: 'deploymentCancelled' })}>Back</Button>
      //   <Button onClick={() => send({ type: 'deploymentCompleted', applicationId: 1234 })}>Deploy</Button>
      // </div>
    )
  }

  throw new Error('Not implemented')
}
