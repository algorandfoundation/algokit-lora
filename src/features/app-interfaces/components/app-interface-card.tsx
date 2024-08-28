import { AppInterfaceEntity } from '@/features/common/data/indexed-db'
import { useMemo } from 'react'
import { Card, CardContent } from '@/features/common/components/card'
import { DescriptionList } from '@/features/common/components/description-list'
import { dateFormatter } from '@/utils/format'
import { DeleteAppInterfaceButton } from '@/features/app-interfaces/components/delete-app-interface-button'
import { appIdLabel, contractNameLabel, methodsLabel } from '@/features/app-interfaces/components/labels'
import { AppSpecStandard } from '../data/types'

type Props = {
  appInterface: AppInterfaceEntity
  onDelete: () => void
}

export function AppInterfaceCard({ appInterface, onDelete }: Props) {
  const items = useMemo(() => {
    return appInterface.appSpecVersions
      .map((version, _) => {
        const contractName = version.standard === AppSpecStandard.ARC32 ? version.appSpec.contract.name : version.appSpec.name

        const methodsCount =
          version.standard === AppSpecStandard.ARC32 ? version.appSpec.contract.methods.length : version.appSpec.methods.length

        return [
          {
            dt: contractNameLabel,
            dd: contractName,
          },
          {
            dt: methodsLabel,
            dd: methodsCount,
          },
          {
            dt: appIdLabel,
            dd: appInterface.applicationId,
          },
        ]
      })
      .flat()
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
