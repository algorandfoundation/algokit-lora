import { Button } from '@/features/common/components/button'
import { Dialog, DialogContent, DialogHeader, MediumSizeDialogBody } from '@/features/common/components/dialog'
import { useToggle } from '@/features/common/hooks/use-toggle'
import { NewAppInterfaceDialogBody } from '@/features/app-interfaces/components/new-app-interface-dialog-body'

export function NewAppInterfaceButton() {
  const { on, off, state: dialogOpen } = useToggle(false)

  return (
    <div className="absolute bottom-0 right-0">
      <Button variant="outline-secondary" onClick={on}>
        Create
      </Button>
      <Dialog open={dialogOpen} onOpenChange={(open) => (open ? on() : off())} modal={true}>
        {dialogOpen && (
          <DialogContent className="bg-card">
            <DialogHeader className="flex-row items-center space-y-0">
              <h2 className="pb-0">New app interface</h2>
            </DialogHeader>
            <MediumSizeDialogBody>
              <NewAppInterfaceDialogBody onSuccess={off} />
            </MediumSizeDialogBody>
          </DialogContent>
        )}
      </Dialog>
    </div>
  )
}
