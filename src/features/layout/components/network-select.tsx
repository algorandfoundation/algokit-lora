import { Label } from '@/features/common/components/label'
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/features/common/components/select'
import { cn } from '@/features/common/utils'

export function NetworkSelect() {
  return (
    <div className={cn('flex w-48 flex-col')}>
      <Label htmlFor="network" className={cn('text-xs ml-0.5')}>
        Network
      </Label>
      <Select>
        <SelectTrigger id="network" className={cn('h-7')}>
          Network
        </SelectTrigger>
        <SelectContent className={cn('bg-card text-card-foreground')}>
          <SelectItem value="localnet">Localnet</SelectItem>
          <SelectItem value="testnet">Testnet</SelectItem>
          <SelectItem value="main">Mainnet</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
