import { Button } from '@/features/common/components/button'
import { Provider } from '@txnlab/use-wallet'
import { cn } from '@/features/common/utils'
import { Loader2 as Loader, Wallet } from 'lucide-react'
import { defaultKmdWallet, selectedKmdWalletAtom, useLoadableAvailableKmdWallets } from '../data/kmd'
import { useAtom } from 'jotai'
import { useCallback } from 'react'
import { RenderLoadable } from '@/features/common/components/render-loadable'
import { Label } from '@/features/common/components/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/features/common/components/select'
import { ProviderConnectButton } from './provider-connect-button'

type Props = {
  provider: Provider
  onConnect: () => Promise<void>
  className?: string
}

export function KmdProviderConnectButton({ provider, onConnect }: Props) {
  const loadableAvailableKmdWallets = useLoadableAvailableKmdWallets()
  const [selectedKmdWallet, setSelectedKmdWallet] = useAtom(selectedKmdWalletAtom)

  const disabledKmdButton = (
    <Button disabled={true} className={'ml-auto'}>
      <Wallet className={cn('size-6 rounded object-contain mr-2')} />
      <span className="ml-1">Connect {provider.metadata.name}</span>
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
          <ProviderConnectButton provider={provider} onConnect={onConnect} />
        </div>
      )}
    </RenderLoadable>
  )
}
