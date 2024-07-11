import { useCallback, useState } from 'react'
import { Button, ButtonProps } from '@/features/common/components/button'
import { Dialog, DialogContent, SmallSizeDialogBody } from '@/features/common/components/dialog'
import { CancelButton } from '@/features/forms/components/cancel-button'

interface Props extends Omit<ButtonProps, 'onClick'> {
  dialogContent: React.ReactNode
  onConfirm: () => void
}

export function ConfirmButton({ children, dialogContent, onConfirm, ...props }: Props) {
  const [dialogOpen, setDialogOpen] = useState(false)

  const openDialog = useCallback(() => {
    setDialogOpen(true)
  }, [setDialogOpen])

  return (
    <>
      <Button className="ml-auto hidden w-28 md:flex" variant="outline" onClick={openDialog} {...props}>
        {children}
      </Button>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen} modal={true}>
        {dialogOpen && (
          <DialogContent className="bg-card">
            <SmallSizeDialogBody>
              {dialogContent}
              <div className="mt-4 flex justify-end gap-2">
                <Button variant="default" onClick={onConfirm}>
                  Confirm
                </Button>
                <CancelButton onClick={() => setDialogOpen(false)} />
              </div>
            </SmallSizeDialogBody>
          </DialogContent>
        )}
      </Dialog>
    </>
  )
}
