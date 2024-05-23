import { selectedNetworkAtom, networksConfigs } from '@/features/settings/data'
import { Label } from '@/features/common/components/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/features/common/components/select'
import { cn } from '@/features/common/utils'
import { useAtom } from 'jotai'
import { settingsStore } from '@/features/settings/data'

export function NetworkSelect() {
  const [selectedNetwork, setSelectedNetwork] = useAtom(selectedNetworkAtom, { store: settingsStore })

  return (
    <div className={cn('flex w-48 flex-col')}>
      <Label htmlFor="network" className={cn('text-xs ml-0.5')}>
        Network
      </Label>
      <Select onValueChange={(value) => setSelectedNetwork(value)} value={selectedNetwork}>
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
