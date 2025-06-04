import { cn } from '@/features/common/utils'
import { Button } from '../../common/components/button'
import { useCallback, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, MediumSizeDialogBody } from '@/features/common/components/dialog'
import { Description } from '@radix-ui/react-dialog'
import QRCode from 'react-qr-code'
import { QrCodeIcon } from 'lucide-react'

type Props = {
  address: string
  className?: string
}

const addressQRCodeLabel = 'Address QR Code'

export function OpenAddressQRDialogButton({ address, className }: Props) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const openAddressViewDialog = useCallback(() => {
    setDialogOpen(true)
  }, [setDialogOpen])

  return (
    <>
      <Button
        variant="no-style"
        onClick={openAddressViewDialog}
        size="icon"
        className={cn('align-middle ml-1 size-4 hover:text-foreground/60', className)}
        aria-label={addressQRCodeLabel}
      >
        <QrCodeIcon size={16} />
      </Button>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen} modal={true}>
        {dialogOpen && (
          <DialogContent className="bg-card">
            <Description hidden={true}>{addressQRCodeLabel}</Description>

            <DialogHeader>
              <DialogTitle asChild>
                <h2>{addressQRCodeLabel}</h2>
              </DialogTitle>

            </DialogHeader>
            <MediumSizeDialogBody className='md:w-[640px]'>
              <div className="flex flex-col items-center space-y-4">
                <div className="flex w-full max-w-full items-center justify-center">
                  <span className="max-w-full truncate text-center">{address}</span>
                </div>
                <QRCode className='w-full' value={`algorand://${address}`} />
                <p>Scan the QR code to copy the address</p>
              </div>
            </MediumSizeDialogBody>
          </DialogContent>
        )}
      </Dialog>
    </>
  )
}
