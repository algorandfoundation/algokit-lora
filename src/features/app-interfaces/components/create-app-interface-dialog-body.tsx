import { useCallback, useState } from 'react'
import { Arc32AppSpec } from '@/features/app-interfaces/data/types'
import { SelectAppSpecForm } from '@/features/app-interfaces/components/select-app-spec-form'
import { CreateAppInterfaceForm } from '@/features/app-interfaces/components/create-app-interface-form'

type Props = {
  onSuccess: () => void
}

export function CreateAppInterfaceDialogBody({ onSuccess }: Props) {
  const [appSpecFile, setAppSpecFile] = useState<File | undefined>()
  const [appSpec, setAppSpec] = useState<Arc32AppSpec | undefined>()

  const onFileSelected = useCallback((file: File, appSpec: Arc32AppSpec) => {
    setAppSpecFile(file)
    setAppSpec(appSpec)
  }, [])

  return !appSpec || !appSpecFile ? (
    <SelectAppSpecForm onFileSelected={onFileSelected} />
  ) : (
    <CreateAppInterfaceForm appSpec={appSpec} appSpecFile={appSpecFile} onSuccess={onSuccess} />
  )
}
