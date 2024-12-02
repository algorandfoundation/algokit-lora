import { Button } from '@/features/common/components/button'
import { WalletId, Wallet } from '@txnlab/use-wallet-react'
import { cn } from '@/features/common/utils'
import { Wallet as WalletIcon } from 'lucide-react'

type Props = {
  wallet: Wallet
  onConnect: () => Promise<void>
  className?: string
}

export function WalletConnectButton({ wallet, onConnect, className }: Props) {
  return (
    <Button key={`wallet-${wallet.id}`} onClick={onConnect} className={className}>
      {[WalletId.KMD, WalletId.MNEMONIC].includes(wallet.id as WalletId) ? (
        <WalletIcon className={cn('size-6 rounded object-contain mr-2')} />
      ) : (
        <img src={wallet.metadata.icon} alt={`${wallet.metadata.name} icon`} className="h-auto w-6 rounded object-contain" />
      )}
      <span className="ml-1">Connect {wallet.metadata.name}</span>
    </Button>
  )
}
