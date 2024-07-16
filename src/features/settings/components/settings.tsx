import { NetworkSelect } from '@/features/settings/components/network-select'
import { ClearCache } from './clear-cache'

export function Settings() {
  return (
    <div className="space-y-3">
      <NetworkSelect />
      <ClearCache />
    </div>
  )
}
