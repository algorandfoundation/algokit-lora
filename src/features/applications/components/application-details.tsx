import { Card, CardContent } from '@/features/common/components/card'
import { DescriptionList } from '@/features/common/components/description-list'
import { cn } from '@/features/common/utils'
import { Application } from '../models'
import { useMemo } from 'react'
import {
  applicationAccountLabel,
  applicationApprovalProgramLabel,
  applicationApprovalProgramTabsListAriaLabel,
  applicationClearStateProgramLabel,
  applicationClearStateProgramTabsListAriaLabel,
  applicationCreatorAccountLabel,
  applicationDetailsLabel,
  applicationGlobalStateByteLabel,
  applicationGlobalStateLabel,
  applicationGlobalStateUintLabel,
  applicationIdLabel,
  applicationLocalStateByteLabel,
  applicationLocalStateUintLabel,
  applicationProgramsLabel,
} from './labels'
import { isDefined } from '@/utils/is-defined'
import { ApplicationProgram } from './application-program'
import { ApplicationGlobalStateTable } from './application-global-state-table'

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
      <Card aria-label={applicationDetailsLabel} className={cn('p-4')}>
        <CardContent className={cn('text-sm space-y-2')}>
          <h1 className={cn('text-2xl text-primary font-bold')}>{applicationDetailsLabel}</h1>
          <DescriptionList items={applicationItems} />
        </CardContent>
      </Card>
      <Card aria-label={applicationProgramsLabel} className={cn('p-4')}>
        <CardContent className={cn('text-sm space-y-2')}>
          <h1 className={cn('text-2xl text-primary font-bold')}>{applicationProgramsLabel}</h1>
          <h1 className={cn('text-xl font-bold')}>{applicationApprovalProgramLabel}</h1>
          <ApplicationProgram tabsListAriaLabel={applicationApprovalProgramTabsListAriaLabel} base64Program={application.approvalProgram} />
          <h1 className={cn('text-xl font-bold')}>{applicationClearStateProgramLabel}</h1>
          <ApplicationProgram
            tabsListAriaLabel={applicationClearStateProgramTabsListAriaLabel}
            base64Program={application.clearStateProgram}
          />
        </CardContent>
      </Card>
      <Card aria-label={applicationGlobalStateLabel} className={cn('p-4')}>
        <CardContent className={cn('text-sm space-y-2')}>
          <h1 className={cn('text-2xl text-primary font-bold')}>{applicationGlobalStateLabel}</h1>
          <ApplicationGlobalStateTable application={application} />
        </CardContent>
      </Card>
    </div>
  )
}
