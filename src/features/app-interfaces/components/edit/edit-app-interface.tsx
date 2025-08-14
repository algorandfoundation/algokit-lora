import { ApplicationLink } from '@/features/applications/components/application-link'
import { DescriptionList } from '@/features/common/components/description-list'
import { AppInterfaceEntity } from '@/features/common/data/indexed-db'
import { useCallback, useMemo } from 'react'
import { AppSpecsTable } from './app-specs-table'
import { Button } from '@/features/common/components/button'
import { ArrowLeft, Pencil } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Urls } from '@/routes/urls'
import { useSelectedNetwork } from '@/features/network/data'
import { TemplatedNavLink } from '@/features/routing/components/templated-nav-link/templated-nav-link'

type Props = {
  appInterface: AppInterfaceEntity
  refreshAppInterface: () => void
}

export function EditAppInterface({ appInterface, refreshAppInterface }: Props) {
  const navigate = useNavigate()
  const [selectedNetwork] = useSelectedNetwork()

  const back = useCallback(() => navigate(Urls.Network.AppLab.build({ networkId: selectedNetwork })), [navigate, selectedNetwork])

  const items = useMemo(() => {
    return [
      {
        dt: 'Name',
        dd: appInterface.name,
      },
      {
        dt: 'App ID',
        dd: (
          <div className="flex gap-1">
            <ApplicationLink applicationId={appInterface.applicationId} />
            <TemplatedNavLink
              urlTemplate={Urls.Network.AppLab.Edit.ById.UpdateApp}
              urlParams={{ networkId: selectedNetwork, applicationId: appInterface.applicationId.toString() }}
            >
              <Button size="icon" icon={<Pencil size={16} />} title="Update" />
            </TemplatedNavLink>
          </div>
        ),
      },
    ]
  }, [appInterface.applicationId, appInterface.name])

  return (
    <div className="flex flex-col gap-6 text-sm">
      <DescriptionList items={items} />
      <AppSpecsTable appInterface={appInterface} refreshAppInterface={refreshAppInterface} />
      <Button type="button" variant="outline" className="mr-auto w-24" onClick={back} icon={<ArrowLeft size={16} />}>
        Back
      </Button>
    </div>
  )
}
