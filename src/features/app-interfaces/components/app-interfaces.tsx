import { AppInterfaceEntity } from '@/features/common/data/indexed-db'
import { Card, CardContent } from '@/features/common/components/card'
import { AppInterfaceCard } from '@/features/app-interfaces/components/app-interface-card'
import { createAppInterfaceLabel } from '@/features/app-interfaces/components/labels'
import { Urls } from '@/routes/urls'
import { Button } from '@/features/common/components/button'
import { Plus } from 'lucide-react'
import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

type Props = {
  appInterfaces: AppInterfaceEntity[]
  refreshAppInterfaces: () => void
}
export function AppInterfaces({ appInterfaces, refreshAppInterfaces }: Props) {
  const navigate = useNavigate()

  const createAppInterface = useCallback(() => {
    navigate(Urls.AppLab.Create.build({}))
  }, [navigate])

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardContent className="flex min-h-44 flex-col">
          <h2>{createAppInterfaceLabel}</h2>
          <div className="flex grow flex-col justify-between gap-4">
            <p>Create an app interface by uploading an App Spec file</p>
            <div className="flex justify-end">
              <Button onClick={createAppInterface} icon={<Plus size={16} />}>
                Create
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      {appInterfaces.map((appInterface, index) => (
        <AppInterfaceCard key={index} appInterface={appInterface} onDelete={refreshAppInterfaces} />
      ))}
    </div>
  )
}
