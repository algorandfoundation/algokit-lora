import { SelectAppSpecForm } from '@/features/app-interfaces/components/select-app-spec-form'
import { CreateAppInterfaceForm } from '@/features/app-interfaces/components/create-app-interface-form'
import { DeployAppForm } from './deploy-app-form'
import { useCreateAppInterfaceStateMachine } from '@/features/app-interfaces/data/state-machine'

type Props = {
  onSuccess: () => void
}

export function CreateAppInterfaceDialogBody({ onSuccess }: Props) {
  const [snapshot] = useCreateAppInterfaceStateMachine()

  return (
    <>
      {snapshot.value === 'selectAppSpec' && <SelectAppSpecForm />}
      {snapshot.value === 'createAppInterface' && snapshot.context.appSpec && snapshot.context.file && (
        <CreateAppInterfaceForm appSpec={snapshot.context.appSpec} appSpecFile={snapshot.context.file} onSuccess={onSuccess} />
      )}
      {snapshot.value === 'deployApp' && snapshot.context.appSpec && <DeployAppForm appSpec={snapshot.context.appSpec} />}
    </>
  )
}
