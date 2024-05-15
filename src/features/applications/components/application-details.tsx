import { assetDetailsLabel } from '@/features/assets/components/labels'
import { Card, CardContent } from '@/features/common/components/card'
import { DescriptionList } from '@/features/common/components/description-list'
import { cn } from '@/features/common/utils'
import { Application } from '../models'
import { useMemo } from 'react'
import {
  applicationAccountLabel,
  applicationCreatorAccountLabel,
  applicationGlobalStateByteLabel,
  applicationGlobalStateUintLabel,
  applicationIdLabel,
  applicationLocalStateByteLabel,
  applicationLocalStateUintLabel,
} from './labels'
import { isDefined } from '@/utils/is-defined'

type Props = {
  application: Application
}

export function ApplicationDetails({ application }: Props) {
  const applicationItems = useMemo(
    () => [
      {
        dt: applicationIdLabel,
        dd: application.id,
      },
      {
        dt: applicationCreatorAccountLabel,
        dd: application.creator,
      },
      {
        dt: applicationAccountLabel,
        dd: application.account,
      },
      application.globalStateSchema
        ? {
            dt: applicationGlobalStateByteLabel,
            dd: application.globalStateSchema.numByteSlice,
          }
        : undefined,
      application.localStateSchema
        ? {
            dt: applicationLocalStateByteLabel,
            dd: application.localStateSchema.numByteSlice,
          }
        : undefined,
      application.globalStateSchema
        ? {
            dt: applicationGlobalStateUintLabel,
            dd: application.globalStateSchema.numUint,
          }
        : undefined,
      application.localStateSchema
        ? {
            dt: applicationLocalStateUintLabel,
            dd: application.localStateSchema.numUint,
          }
        : undefined,
    ],
    [application.id, application.creator, application.account, application.globalStateSchema, application.localStateSchema]
  ).filter(isDefined)

  return (
    <div className={cn('space-y-6 pt-7')}>
      <Card aria-label={assetDetailsLabel} className={cn('p-4')}>
        <CardContent className={cn('text-sm space-y-2')}>
          <DescriptionList items={applicationItems} />
        </CardContent>
      </Card>
    </div>
  )
}
