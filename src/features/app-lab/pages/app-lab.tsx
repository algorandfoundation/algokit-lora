import { PageTitle } from '@/features/common/components/page-title'
import { Card, CardContent } from '@/features/common/components/card'
import { CreateAppInterfaceButton } from '@/features/app-interfaces/components/create-app-interface-button'

export const appLabPageTitle = 'App Lab'
export const newAppInterfaceLabel = 'New app interface'

export function AppLab() {
  return (
    <>
      <PageTitle title={appLabPageTitle} />
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="relative min-h-44 space-y-1">
            <h2>{newAppInterfaceLabel}</h2>
            <p>Upload an ARC-32 JSON file</p>
            <CreateAppInterfaceButton />
          </CardContent>
        </Card>
      </div>
    </>
  )
}
