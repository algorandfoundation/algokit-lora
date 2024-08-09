import { Settings } from '../components/settings'
import { PageTitle } from '@/features/common/components/page-title'

export const settingsPageTitle = 'Settings'

export function SettingsPage() {
  return (
    <>
      <PageTitle title={settingsPageTitle} />
      <Settings />
    </>
  )
}
