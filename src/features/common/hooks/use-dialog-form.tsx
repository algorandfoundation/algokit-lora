import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, MediumSizeDialogBody } from '../components/dialog'

export type DialogBodyProps<TDataIn, TDataOut> = {
  data: TDataIn
  onSubmit: (data: TDataOut) => void
  onCancel: () => void
}

type Options<TDataIn, TDataOut> = {
  dialogHeader: string
  dialogBody: React.ComponentType<DialogBodyProps<TDataIn, TDataOut>>
}

export function useDialogForm<TDataIn, TDataOut>({ dialogHeader, dialogBody: DialogBodyComponent }: Options<TDataIn, TDataOut>) {
  const [isOpen, setIsOpen] = useState(false)
  const [dialogData, setDialogData] = useState<TDataIn | null>(null)
  const [resolvePromise, setResolvePromise] = useState<((value: TDataOut | undefined) => void) | null>(null)

  const handleSubmit = (data: TDataOut) => {
    if (resolvePromise) {
      resolvePromise(data)
    }
    setIsOpen(false)
  }

  const handleCancel = () => {
    if (resolvePromise) {
      resolvePromise(undefined)
    }
    setIsOpen(false)
  }

  const dialog = (
    <Dialog open={isOpen} onOpenChange={(open) => (open ? setIsOpen(true) : handleCancel())} modal={true}>
      <DialogContent className="bg-card">
        <DialogHeader className="flex-row items-center space-y-0">
          <h2 className="pb-0">{dialogHeader}</h2>
        </DialogHeader>
        <MediumSizeDialogBody>
          {dialogData && <DialogBodyComponent onSubmit={handleSubmit} onCancel={handleCancel} data={dialogData} />}
        </MediumSizeDialogBody>
      </DialogContent>
    </Dialog>
  )

  return {
    open: (dialogData: TDataIn) => {
      setIsOpen(true)
      setDialogData(dialogData)
      return new Promise<TDataOut | undefined>((resolve) => {
        setResolvePromise(() => resolve)
      })
    },
    dialog,
  }
}
