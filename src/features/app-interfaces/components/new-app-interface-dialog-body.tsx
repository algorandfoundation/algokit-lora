import { useCallback, useState } from 'react'
import { Arc32AppSpec } from '@/features/app-interfaces/data/types'
import { SelectAppSpecForm } from '@/features/app-interfaces/components/select-app-spec-form'
import { NewAppInterfaceForm } from '@/features/app-interfaces/components/new-app-interface-form'

type Props = {
  onSuccess: () => void
}

export function NewAppInterfaceDialogBody({ onSuccess }: Props) {
  const [appSpecFile, setAppSpecFile] = useState<File | undefined>()
  const [appSpec, setAppSpec] = useState<Arc32AppSpec | undefined>()

  const onFileSelected = useCallback((file: File, appSpec: Arc32AppSpec) => {
    setAppSpecFile(file)
    setAppSpec(appSpec)
  }, [])

  return !appSpec || !appSpecFile ? (
    <SelectAppSpecForm onFileSelected={onFileSelected} />
  ) : (
    <NewAppInterfaceForm appSpec={appSpec} appSpecFile={appSpecFile} onSuccess={onSuccess} />
  )
}
