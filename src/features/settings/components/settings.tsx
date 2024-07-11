import { NetworkSelect } from '@/features/settings/components/network-select'
import { NetworksConfigsTable } from '@/features/settings/components/networks-configs-table'

export function Settings() {
  return (
    <div className={'grid gap-4'}>
      <NetworkSelect />
      <NetworksConfigsTable />
    </div>
  )
}
