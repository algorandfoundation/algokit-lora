import { useCreateAppInterfaceStateMachine } from '../data/create-app-interface'

type Props = {
  machine: ReturnType<typeof useCreateAppInterfaceStateMachine>
}

export function CreateFromAppId({ machine }: Props) {
  const [state, send] = machine
  return <span>fromAppId</span>
}
