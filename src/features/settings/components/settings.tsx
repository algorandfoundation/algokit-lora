import { NetworkSelect } from '@/features/network/components/network-select'
import { ClearCache } from './clear-cache'
import { NetworksConfigsTable } from '@/features/network/components/networks-configs-table'

export function Settings() {
  return (
    <div className="space-y-3">
      <NetworkSelect />
      <NetworksConfigsTable />
      <ClearCache />
    </div>
  )
}
