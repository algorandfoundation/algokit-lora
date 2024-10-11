import { useCreateAppInterfaceStateMachine } from '../data/create-app-interface'

type Props = {
  machine: ReturnType<typeof useCreateAppInterfaceStateMachine>
}

export function CreateFromAppId({ machine }: Props) {
  const [_state, _send] = machine
  return <span>fromAppId</span>
}
