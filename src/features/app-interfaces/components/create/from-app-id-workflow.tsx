import { useCreateAppInterfaceStateMachine } from '../../data'
import { AppSpecStandard } from '../../data/types'
import { AppDetails } from './app-details'
import { UploadAppSpec } from './upload-app-spec'

type Props = {
  machine: ReturnType<typeof useCreateAppInterfaceStateMachine>
}

export function FromAppIdWorkflow({ machine }: Props) {
  const [state] = machine

  if (state.matches({ fromAppId: 'appSpec' })) {
    return <UploadAppSpec machine={machine} supportedStandards={[AppSpecStandard.ARC32, AppSpecStandard.ARC4]} />
  } else if (state.matches({ fromAppId: 'appDetails' })) {
    return <AppDetails machine={machine} />
  }
  return undefined
}
