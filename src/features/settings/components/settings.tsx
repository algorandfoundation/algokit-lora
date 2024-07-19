import { NetworkSelect } from '@/features/network/components/network-select'
import { ClearCache } from './clear-cache'
import { NetworkConfigsTable } from '@/features/network/components/network-configs-table'

export function Settings() {
  return (
    <div className="flex flex-col space-y-8">
      <NetworkSelect />
      <NetworkConfigsTable />
      <ClearCache />
    </div>
  )
}
