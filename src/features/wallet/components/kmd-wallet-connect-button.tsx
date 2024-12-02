import { Button } from '@/features/common/components/button'
import { Wallet } from '@txnlab/use-wallet-react'
import { cn } from '@/features/common/utils'
import { Loader2 as Loader, Wallet as WalletIcon } from 'lucide-react'
import { defaultKmdWallet, selectedKmdWalletAtom } from '../data/selected-kmd-wallet'
import { useAtom } from 'jotai'
import { useCallback } from 'react'
import { RenderLoadable } from '@/features/common/components/render-loadable'
import { Label } from '@/features/common/components/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/features/common/components/select'
import { WalletConnectButton } from './wallet-connect-button'
import { useLoadableAvailableKmdWallets } from '../data/kmd-wallets'

type Props = {
  wallet: Wallet
  onConnect: () => Promise<void>
  className?: string
}

export function KmdWalletConnectButton({ wallet, onConnect }: Props) {
  const loadableAvailableKmdWallets = useLoadableAvailableKmdWallets()
  const [selectedKmdWallet, setSelectedKmdWallet] = useAtom(selectedKmdWalletAtom)

  const disabledKmdButton = (
    <Button disabled={true} className={'ml-auto'}>
      <WalletIcon className={cn('size-6 rounded object-contain mr-2')} />
      <span className="ml-1">Connect {wallet.metadata.name}</span>
    </Button>
  )

  const transformError = useCallback(() => {
    return (
      <div className="flex">
        <div className="flex items-center">
          <p>Connection to KMD failed</p>
        </div>
        {disabledKmdButton}
      </div>
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <RenderLoadable
      loadable={loadableAvailableKmdWallets}
      fallback={
        <div className="flex">
          <div className="flex items-center">
            <Loader className="size-8 animate-spin" />
          </div>
          {disabledKmdButton}
        </div>
      }
      transformError={transformError}
    >
      {(availableKmdWallets) => (
        <div className="grid grid-cols-[auto_min-content] gap-2">
          <Label hidden={true} htmlFor="kmd-wallet" className="hidden">
            KMD Wallet
          </Label>
          <Select onValueChange={setSelectedKmdWallet} value={selectedKmdWallet ?? defaultKmdWallet}>
            <SelectTrigger id="kmd-wallet" className="min-w-0">
              <SelectValue placeholder="Select KMD wallet" />
            </SelectTrigger>
            <SelectContent className={cn('bg-card text-card-foreground')}>
              {availableKmdWallets.map((item) => (
                <SelectItem key={item.name} value={item.name}>
                  {item.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <WalletConnectButton wallet={wallet} onConnect={onConnect} />
        </div>
      )}
    </RenderLoadable>
  )
}
