import { VersionDisplay } from '@/features/common/components/version-display'
import { ClearCache } from './clear-cache'
import { NetworkConfigsTable } from '@/features/network/components/network-configs-table'

export function Settings() {
  return (
    <div className="flex flex-col space-y-8">
      <NetworkConfigsTable />
      <ClearCache />
      <div className="flex flex-col items-end space-y-2">
        <VersionDisplay showDetails showEnvironment />
      </div>
    </div>
  )
}
