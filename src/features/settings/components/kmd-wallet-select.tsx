import { Label } from '@/features/common/components/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/features/common/components/select'
import { cn } from '@/features/common/utils'
import { useAtom } from 'jotai'
import { defaultKmdWallet, selectedKmdWalletAtom, useAvailableKmdWallets } from '@/features/wallet/data/kmd'
import { RenderLoadable } from '@/features/common/components/render-loadable'
import { Button } from '@/features/common/components/button'

export function KmdWalletSelect() {
  // TODO: NC - Wire in a refresh button
  // TODO: NC - Even better, do as part of connect then we don't need it.
  const [loadableAvailableKmdWallets, refreshAvailableKmdWallets] = useAvailableKmdWallets()
  const [selectedKmdWallet, setSelectedKmdWallet] = useAtom(selectedKmdWalletAtom)

  return (
    <RenderLoadable loadable={loadableAvailableKmdWallets}>
      {(availableKmdWallets) => (
        <div className={cn('flex w-48 flex-col')}>
          <Label htmlFor="kmd-wallet" className={cn('text-xs ml-0.5')}>
            KMD Wallet
          </Label>
          <Select onValueChange={(value) => setSelectedKmdWallet(value)} value={selectedKmdWallet ?? defaultKmdWallet}>
            <SelectTrigger id="kmd-wallet" className={cn('h-7')}>
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
          <Button variant="outline" onClick={() => refreshAvailableKmdWallets()}>
            Refresh
          </Button>
        </div>
      )}
    </RenderLoadable>
  )
}
