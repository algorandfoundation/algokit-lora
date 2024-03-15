import { Label } from '@/features/common/components/label'
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/features/common/components/select'
import { cn } from '@/features/common/utils'

export function NetworkSelect() {
  return (
    <div className={cn('flex w-48 flex-col gap-1')}>
      <Label htmlFor="network" className={cn('text-xs')}>
        Network
      </Label>
      <Select>
        <SelectTrigger id="network">Network</SelectTrigger>
        <SelectContent>
          <SelectItem value="localnet">Localnet</SelectItem>
          <SelectItem value="testnet">Testnet</SelectItem>
          <SelectItem value="main">Mainnet</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
