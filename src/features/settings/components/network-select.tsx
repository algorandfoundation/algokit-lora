import { networksConfigs, useSelectedNetwork } from '@/features/settings/data'
import { Label } from '@/features/common/components/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/features/common/components/select'
import { cn } from '@/features/common/utils'
import { useAtom, useAtomValue } from 'jotai'
import { settingsStore } from '@/features/settings/data'
import { useWallet } from '@txnlab/use-wallet'
import { useCallback } from 'react'

// 1. Network is changed whilst the app is loaded
// 2. Network is change before the app is loaded

// const useNetworkChange = () => {
//   const selectedNetwork = useAtomValue(selectedNetworkAtom, { store: settingsStore })
//   const { providers, activeAccount } = useWallet()

//   await Promise.all(
//     providers?.forEach(async (provider) => {
//       await provider.disconnect()
//     }) ?? []
//   )
// }

export function NetworkSelect() {
  const [selectedNetwork, setSelectedNetwork] = useSelectedNetwork()

  const handleNetworkChange = useCallback(
    async (value: string) => {
      await setSelectedNetwork(value)
    },
    [setSelectedNetwork]
  )

  return (
    <div className={cn('flex w-48 flex-col')}>
      <Label htmlFor="network" className={cn('text-xs ml-0.5')}>
        Network
      </Label>
      <Select onValueChange={handleNetworkChange} value={selectedNetwork}>
        <SelectTrigger id="network" className={cn('h-7')}>
          <SelectValue placeholder="Select network" />
        </SelectTrigger>
        <SelectContent className={cn('bg-card text-card-foreground')}>
          {networksConfigs.map((item) => (
            <SelectItem key={item.id} value={item.id}>
              {item.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
