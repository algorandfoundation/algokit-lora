import { Button } from '@/features/common/components/button'
import { Dialog, DialogContent, DialogHeader, MediumSizeDialogBody } from '@/features/common/components/dialog'
import { useToggle } from '@/features/common/hooks/use-toggle'
import { NewContractForm } from '@/features/app-lab/components/new-contract-form'
import { useCallback, useState } from 'react'
import { Arc32AppSpec } from '@/features/app-interfaces/data/types'
import { SelectAppSpecForm } from '@/features/app-lab/components/select-app-spec-form'

export function NewContractButton() {
  const { on, off, state: dialogOpen } = useToggle(false)

  return (
    <div className="absolute bottom-0 right-0">
      <Button variant="outline-secondary" onClick={on}>
        Upload App Spec
      </Button>
      <Dialog open={dialogOpen} onOpenChange={(open) => (open ? on() : off())} modal={true}>
        {dialogOpen && (
          <DialogContent className="bg-card">
            <DialogHeader className="flex-row items-center space-y-0">
              <h2 className="pb-0">New contract</h2>
            </DialogHeader>
            <MediumSizeDialogBody>
              <NewContractDialogBody onSuccess={off} />
            </MediumSizeDialogBody>
          </DialogContent>
        )}
      </Dialog>
    </div>
  )
}

type NewContractDialogBodyProps = {
  onSuccess: () => void
}
function NewContractDialogBody({ onSuccess }: NewContractDialogBodyProps) {
  const [appSpecFile, setAppSpecFile] = useState<File | undefined>()
  const [appSpec, setAppSpec] = useState<Arc32AppSpec | undefined>()

  const onFileSelected = useCallback((file: File, appSpec: Arc32AppSpec) => {
    setAppSpecFile(file)
    setAppSpec(appSpec)
  }, [])

  return !appSpec || !appSpecFile ? (
    <SelectAppSpecForm onFileSelected={onFileSelected} />
  ) : (
    <NewContractForm appSpec={appSpec} appSpecFile={appSpecFile} onSuccess={onSuccess} />
  )
}
