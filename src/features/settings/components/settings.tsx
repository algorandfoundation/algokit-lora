import { NetworkSelect } from '@/features/settings/components/network-select'
import { NetworksTable } from '@/features/settings/components/networks-table'

export function Settings() {
  return (
    <div className={'grid gap-4'}>
      <NetworkSelect />
      <NetworksTable />
    </div>
  )
}
