import { AppInterfaceEntity } from '@/features/common/data/indexed-db'
import { useMemo } from 'react'
import { Card, CardContent } from '@/features/common/components/card'
import { DescriptionList } from '@/features/common/components/description-list'
import { dateFormatter } from '@/utils/format'
import { DeleteAppInterfaceButton } from '@/features/app-interfaces/components/delete-app-interface-button'

type Props = {
  appInterface: AppInterfaceEntity
  onDelete: () => void
}

export function AppInterfaceCard({ appInterface, onDelete }: Props) {
  const items = useMemo(
    () => [
      {
        dt: 'Name',
        dd: appInterface.appSpecVersions[0].appSpec.contract.name,
      },
      {
        dt: 'Methods',
        dd: appInterface.appSpecVersions[0].appSpec.contract.methods.length,
      },
      {
        dt: 'App ID',
        dd: appInterface.applicationId,
      },
    ],
    [appInterface]
  )

  return (
    <Card>
      <CardContent className="flex min-h-44 flex-col">
        <h2>{appInterface.name}</h2>
        <div className="flex grow flex-col justify-between">
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
