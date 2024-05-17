import { Card, CardContent } from '@/features/common/components/card'
import { cn } from '@/features/common/utils'
import { applicationBoxDetailsLabel, applicationBoxNameLabel, applicationBoxValueLabel, applicationIdLabel } from './labels'
import { useMemo } from 'react'
import { DescriptionList } from '@/features/common/components/description-list'
import { ApplicationBox } from '../models'
import { ApplicationLink } from './application-link'
import { ApplicationId } from '../data/types'

type Props = {
  applicationId: ApplicationId
  applicationBox: ApplicationBox
}

export function ApplicationBoxDetails({ applicationId, applicationBox }: Props) {
  const items = useMemo(
    () => [
      {
        dt: applicationIdLabel,
        dd: <ApplicationLink applicationId={applicationId} />,
      },
      {
        dt: applicationBoxNameLabel,
        dd: applicationBox.name,
      },
      {
        dt: applicationBoxValueLabel,
        dd: (
          <div className="grid">
            <div className="overflow-y-auto break-words"> {applicationBox.value}</div>
          </div>
        ),
      },
    ],
    [applicationBox.name, applicationBox.value, applicationId]
  )

  return (
    <div className={cn('space-y-6 pt-7')}>
      <Card aria-label={applicationBoxDetailsLabel} className={cn('p-4')}>
        <CardContent className={cn('text-sm space-y-2')}>
          <h1 className={cn('text-2xl text-primary font-bold')}>{applicationBoxDetailsLabel}</h1>
          <DescriptionList items={items} />
        </CardContent>
      </Card>
    </div>
  )
}
