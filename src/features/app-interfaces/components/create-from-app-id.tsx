import { useCreateAppInterfaceStateMachine } from '../data/create-app-interface'

type Props = {
  snapshot: ReturnType<typeof useCreateAppInterfaceStateMachine>
}

export function CreateFromAppId({ snapshot: [state, send] }: Props) {
  return <span>fromAppId</span>
}
