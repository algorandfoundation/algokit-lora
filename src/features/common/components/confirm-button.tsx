import { useCallback, useState } from 'react'
import { Button, ButtonProps } from '@/features/common/components/button'
import { Dialog, DialogContent, SmallSizeDialogBody } from '@/features/common/components/dialog'
import { CancelButton } from '@/features/forms/components/cancel-button'

interface Props extends Omit<ButtonProps, 'onClick'> {
  dialogContent: React.ReactNode
  onConfirm: () => void
}

export function ConfirmButton({ children, dialogContent, onConfirm: onConfirmProp, ...props }: Props) {
  const [dialogOpen, setDialogOpen] = useState(false)

  const openDialog = useCallback(() => {
    setDialogOpen(true)
  }, [setDialogOpen])

  const onConfirm = useCallback(() => {
    onConfirmProp?.()
    setDialogOpen(false)
  }, [onConfirmProp, setDialogOpen])

  return (
    <>
      <Button variant="outline" onClick={openDialog} {...props}>
        {children}
      </Button>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen} modal={true}>
        <DialogContent className="bg-card">
          <SmallSizeDialogBody>
            {dialogContent}
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="default" onClick={onConfirm}>
                Confirm
              </Button>
              <CancelButton onClick={() => setDialogOpen(false)} className="w-28" />
            </div>
          </SmallSizeDialogBody>
        </DialogContent>
      </Dialog>
    </>
  )
}
