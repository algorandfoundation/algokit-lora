import { cn } from '@/features/common/utils'
import { Settings } from '../components/settings'

export function SettingsPage() {
  return (
    <div>
      <h1 className={cn('text-2xl text-primary font-bold')}>Settings</h1>
      <Settings />
    </div>
  )
}
