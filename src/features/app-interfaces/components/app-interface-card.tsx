import { AppInterfaceEntity } from '@/features/common/data/indexed-db'
import { useMemo } from 'react'
import { Card, CardContent } from '@/features/common/components/card'
import { DescriptionList } from '@/features/common/components/description-list'
import { dateFormatter } from '@/utils/format'
import { DeleteAppInterfaceButton } from '@/features/app-interfaces/components/delete-app-interface-button'
import { appIdLabel, contractNameLabel, methodsLabel } from '@/features/app-interfaces/components/labels'
import { ApplicationLink } from '@/features/applications/components/application-link'
import { AppSpecStandard } from '../data/types'
import { Button } from '@/features/common/components/button'
import { Pencil } from 'lucide-react'
import { getLatestAppSpecVersion } from '../mappers'

type Props = {
  appInterface: AppInterfaceEntity
  onEdit: () => void
  onDelete: () => void
}

export function AppInterfaceCard({ appInterface, onEdit, onDelete }: Props) {
  const items = useMemo(() => {
    const latestAppSpecVersion = getLatestAppSpecVersion(appInterface.appSpecVersions)

    const contract = latestAppSpecVersion
      ? latestAppSpecVersion.standard === AppSpecStandard.ARC32
        ? latestAppSpecVersion.appSpec.contract
        : latestAppSpecVersion.appSpec
      : { name: 'Not available', methods: [] }

    return [
      {
        dt: contractNameLabel,
        dd: contract.name,
      },
      {
        dt: methodsLabel,
        dd: contract.methods.length,
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
        <h2 className="truncate">{appInterface.name}</h2>
        <div className="flex grow flex-col justify-between gap-4">
          <DescriptionList items={items} />
          <div className="flex items-center gap-2">
            <p>Modified: {dateFormatter.asShortDate(new Date(appInterface.lastModified))}</p>
            <div className="ml-auto flex gap-2">
              <Button size="sm" variant="outline" icon={<Pencil size={16} />} onClick={onEdit} />
              <DeleteAppInterfaceButton appInterface={appInterface} onDelete={onDelete} />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
