import { AppInterfaceEntity } from '@/features/common/data/indexed-db'
import { Card, CardContent } from '@/features/common/components/card'
import { AppInterfaceCard } from '@/features/app-interfaces/components/app-interface-card'
import { CreateAppInterfaceButton } from '@/features/app-interfaces/components/create-app-interface-button'

export const createAppInterfaceLabel = 'Create App Interface'

type Props = {
  appInterfaces: AppInterfaceEntity[]
  refreshAppInterfaces: () => void
}
export function AppInterfaces({ appInterfaces, refreshAppInterfaces }: Props) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardContent className="flex min-h-44 flex-col">
          <h2>{createAppInterfaceLabel}</h2>
          <div className="flex grow flex-col justify-between gap-4">
            <p>Create an app interface by uploading an App Spec file</p>
            <CreateAppInterfaceButton onSuccess={refreshAppInterfaces} />
          </div>
        </CardContent>
      </Card>
      {appInterfaces.map((appInterface, index) => (
        <AppInterfaceCard key={index} appInterface={appInterface} onDelete={refreshAppInterfaces} />
      ))}
    </div>
  )
}
