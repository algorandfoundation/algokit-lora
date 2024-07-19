import { useCallback, useState } from 'react'
import { Button, ButtonProps } from '@/features/common/components/button'
import { Dialog, DialogContent, DialogHeader, SmallSizeDialogBody } from '@/features/common/components/dialog'
import { CancelButton } from '@/features/forms/components/cancel-button'

interface Props extends Omit<ButtonProps, 'onClick'> {
  dialogHeaderText: string
  dialogContent: React.ReactNode
  onConfirm: () => void
}

export function ConfirmButton({ children, dialogHeaderText, dialogContent, onConfirm: onConfirmProp, ...props }: Props) {
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
          <DialogHeader>
            <h2 className="pb-0">{dialogHeaderText}</h2>
          </DialogHeader>
          <SmallSizeDialogBody>
            {dialogContent}
            <div className="mt-4 flex justify-end gap-2">
              <CancelButton onClick={() => setDialogOpen(false)} className="w-28" />
              <Button variant="default" onClick={onConfirm}>
                Confirm
              </Button>
            </div>
          </SmallSizeDialogBody>
        </DialogContent>
      </Dialog>
    </>
  )
}
