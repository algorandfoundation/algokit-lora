import { cn } from '@/features/common/utils'
import { Button } from '../../common/components/button'
import { useCallback, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/features/common/components/dialog'
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
            <Description hidden={true}>Address QR Code</Description>

            <DialogHeader>
              <div>
                <DialogTitle asChild>
                  <h2>Address QR Code</h2>
                </DialogTitle>
              </div>

              <span>
                {address}
              </span>
            </DialogHeader>

            <div>
              <div className="flex items-center justify-center">
                <QRCode value={address} />
              </div>

              <p className="mt-4 text-center ">Scan the QR code to copy the address</p>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </>
  )
}
