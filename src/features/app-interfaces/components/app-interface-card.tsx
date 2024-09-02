import { AppInterfaceEntity } from '@/features/common/data/indexed-db'
import { useMemo } from 'react'
import { Card, CardContent } from '@/features/common/components/card'
import { DescriptionList } from '@/features/common/components/description-list'
import { dateFormatter } from '@/utils/format'
import { DeleteAppInterfaceButton } from '@/features/app-interfaces/components/delete-app-interface-button'
import { appIdLabel, contractNameLabel, methodsLabel } from '@/features/app-interfaces/components/labels'
import { ApplicationLink } from '@/features/applications/components/application-link'

type Props = {
  appInterface: AppInterfaceEntity
  onDelete: () => void
}

export function AppInterfaceCard({ appInterface, onDelete }: Props) {
  const items = useMemo(() => {
    // Pick the first item in the array because we don't support multiple versions yet
    const latestAppSpecVersion = appInterface.appSpecVersions[0]
    return [
      {
        dt: contractNameLabel,
        dd: latestAppSpecVersion.appSpec.contract.name,
      },
      {
        dt: methodsLabel,
        dd: latestAppSpecVersion.appSpec.contract.methods.length,
      },
      {
        dt: appIdLabel,
        dd: <ApplicationLink applicationId={appInterface.applicationId} />,
      },
    ]
  }, [appInterface])

  return (
    <Card>
      <CardContent className="flex min-h-44 flex-col">
        <h2>{appInterface.name}</h2>
        <div className="flex grow flex-col justify-between gap-4">
          <DescriptionList items={items} />
          <div className="flex items-center justify-between">
            <p>Last modified: {dateFormatter.asShortDate(new Date(appInterface.lastModified))}</p>
            <DeleteAppInterfaceButton appInterface={appInterface} onDelete={onDelete} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
