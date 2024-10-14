import { useCreateAppInterfaceStateMachine } from '../data/create-app-interface'
import { AppSpecStandard } from '../data/types'
import { WIPAppDetails } from './wip-app-details'
import { WIPUploadAppSpec } from './wip-upload-app-spec'

type Props = {
  machine: ReturnType<typeof useCreateAppInterfaceStateMachine>
}

export function CreateFromAppId({ machine }: Props) {
  const [state] = machine

  if (state.matches({ fromAppId: 'appSpec' })) {
    return <WIPUploadAppSpec machine={machine} supportedStandards={[AppSpecStandard.ARC32, AppSpecStandard.ARC4]} />
  } else if (state.matches({ fromAppId: 'appDetails' })) {
    return <WIPAppDetails machine={machine} />
  }
  return undefined
}
