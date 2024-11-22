import { useCallback, useState } from 'react'
import { Button, ButtonProps } from '@/features/common/components/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, SmallSizeDialogBody } from '@/features/common/components/dialog'
import { CancelButton } from '@/features/forms/components/cancel-button'
import { Description } from '@radix-ui/react-dialog'

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
          <Description hidden={true}>Confirm action</Description>
          <DialogHeader>
            <DialogTitle asChild>
              <h2>{dialogHeaderText}</h2>
            </DialogTitle>
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
