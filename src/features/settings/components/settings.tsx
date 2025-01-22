import { useGetVersion } from '@/features/tauri/use-get-version'
import { ClearCache } from './clear-cache'
import { NetworkConfigsTable } from '@/features/network/components/network-configs-table'

export function Settings() {
  const version = useGetVersion()

  return (
    <div className="flex flex-col space-y-8">
      <NetworkConfigsTable />
      <ClearCache />
      {version && (
        <div className="flex flex-col items-end">
          <p>Version: {version}</p>
        </div>
      )}
    </div>
  )
}
