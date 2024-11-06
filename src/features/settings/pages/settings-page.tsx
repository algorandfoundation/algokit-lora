import { useTitle } from '@/utils/use-title'
import { Settings } from '../components/settings'
import { PageTitle } from '@/features/common/components/page-title'

export const settingsPageTitle = 'Settings'

export function SettingsPage() {
  useTitle('Settings')
  return (
    <>
      <PageTitle title={settingsPageTitle} />
      <Settings />
    </>
  )
}
