import { Button } from '@/features/common/components/button'
import { Dialog, DialogContent, DialogHeader, MediumSizeDialogBody } from '@/features/common/components/dialog'
import { useToggle } from '@/features/common/hooks/use-toggle'
import { CreateAppInterfaceDialogBody } from '@/features/app-interfaces/components/create-app-interface-dialog-body'
import { createAppInterfaceLabel } from '@/features/app-lab/pages/app-lab'

export function CreateAppInterfaceButton() {
  const { on, off, state: dialogOpen } = useToggle(false)

  return (
    <div className="flex justify-end">
      <Button variant="outline-secondary" onClick={on}>
        Create
      </Button>
      <Dialog open={dialogOpen} onOpenChange={(open) => (open ? on() : off())} modal={true}>
        {dialogOpen && (
          <DialogContent className="bg-card">
            <DialogHeader className="flex-row items-center space-y-0">
              <h2 className="pb-0">{createAppInterfaceLabel}</h2>
            </DialogHeader>
            <MediumSizeDialogBody>
              <CreateAppInterfaceDialogBody onSuccess={off} />
            </MediumSizeDialogBody>
          </DialogContent>
        )}
      </Dialog>
    </div>
  )
}
