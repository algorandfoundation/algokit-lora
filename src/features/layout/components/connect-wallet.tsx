import { Button } from '@/features/common/components/button'
import { cn } from '@/features/common/utils'
import { useState } from 'react'
import { useWallet } from '@txnlab/use-wallet'

interface CustomDialogProps {
  open: boolean
  onClose: () => void
  title: string
  content: React.ReactNode
}

const CustomDialog: React.FC<CustomDialogProps> = ({ open, onClose, title, content }) => {
  if (!open) return null

  return (
    <div className="fixed inset-0 flex items-center justify-center" onClick={onClose}>
      <div className="w-full max-w-lg rounded-lg shadow-lg" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button className="text-gray-600 hover:text-gray-800" onClick={onClose}>
            &times;
          </button>
        </div>
        <div className="p-4">{content}</div>
      </div>
    </div>
  )
}

export function ConnectWallet() {
  const [dialogOpen, setDialogOpen] = useState(false)

  const handleOpenDialog = () => {
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
  }

  const { activeAddress, providers } = useWallet()

  return (
    <div className={cn('mt-1')}>
      <Button onClick={handleOpenDialog}>connect wallet</Button>
      <CustomDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        title="Select Algorand Wallet Provider."
        content={
          <div className="flex flex-col space-y-2">
            {!activeAddress &&
              providers?.map((provider) => (
                <Button
                  key={`provider-${provider.metadata.id}`}
                  onClick={async () => {
                    if (provider.isConnected) {
                      provider.setActiveProvider()
                    } else {
                      await provider.connect()
                    }
                    handleCloseDialog()
                  }}
                >
                  <img src={provider.metadata.icon} alt={`${provider.metadata.name} icon`} className="h-auto w-6 rounded object-contain" />
                  <span>{provider.metadata.name}</span>
                </Button>
              ))}
          </div>
        }
      />
    </div>
  )
}
