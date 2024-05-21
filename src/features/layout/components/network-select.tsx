import { settingsStore, selectedNetworkAtom, networksConfigs } from '@/features/common/data'
import { Label } from '@/features/common/components/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/features/common/components/select'
import { cn } from '@/features/common/utils'
import { useAtom } from 'jotai'

export function NetworkSelect() {
  const [networkId, setNetworkId] = useAtom(selectedNetworkAtom, { store: settingsStore })

  return (
    <div className={cn('flex w-48 flex-col')}>
      <Label htmlFor="network" className={cn('text-xs ml-0.5')}>
        Network
      </Label>
      <Select onValueChange={(value) => setNetworkId(value)} value={networkId}>
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
