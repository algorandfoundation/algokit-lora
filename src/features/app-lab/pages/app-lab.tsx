import { PageTitle } from '@/features/common/components/page-title'
import { Card, CardContent } from '@/features/common/components/card'
import { CreateAppInterfaceButton } from '@/features/app-interfaces/components/create-app-interface-button'

export const appLabPageTitle = 'App Lab'
export const createAppInterfaceLabel = 'Create App Interface'

export function AppLab() {
  return (
    <>
      <PageTitle title={appLabPageTitle} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardContent className="flex min-h-44 flex-col ">
            <h2>{createAppInterfaceLabel}</h2>
            <div className="flex grow flex-col justify-between gap-4">
              <p>Create an app interface by uploading an App Spec file</p>
              <CreateAppInterfaceButton />
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
