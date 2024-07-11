import { useNetworkConfigs, useSelectedNetwork } from '@/features/settings/data'
import { Label } from '@/features/common/components/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/features/common/components/select'
import { cn } from '@/features/common/utils'
import { useCallback } from 'react'

export function NetworkSelect() {
  const [selectedNetwork, setSelectedNetwork] = useSelectedNetwork()
  const networkConfigs = useNetworkConfigs()

  const handleNetworkChange = useCallback(
    async (value: string) => {
      await setSelectedNetwork(value)
    },
    [setSelectedNetwork]
  )

  return (
    <div className={cn('flex w-48 flex-col')}>
      <Label htmlFor="network" className={cn('ml-0.5 mb-2')}>
        Network
      </Label>
      <Select onValueChange={handleNetworkChange} value={selectedNetwork}>
        <SelectTrigger id="network">
          <SelectValue placeholder="Select network" />
        </SelectTrigger>
        <SelectContent className={cn('bg-card text-card-foreground')}>
          {Object.entries(networkConfigs).map(([id, config]) => (
            <SelectItem key={id} value={id}>
              {config.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
