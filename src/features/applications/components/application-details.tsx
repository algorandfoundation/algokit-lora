import { Card, CardContent } from '@/features/common/components/card'
import { DescriptionList } from '@/features/common/components/description-list'
import { cn } from '@/features/common/utils'
import { Application } from '../models'
import { useMemo } from 'react'
import {
  applicationAccountLabel,
  applicationApprovalProgramLabel,
  applicationApprovalProgramTabsListAriaLabel,
  applicationBoxesLabel,
  applicationClearStateProgramLabel,
  applicationClearStateProgramTabsListAriaLabel,
  applicationCreatorAccountLabel,
  applicationDetailsLabel,
  applicationGlobalStateByteLabel,
  applicationGlobalStateLabel,
  applicationGlobalStateUintLabel,
  applicationHistoricalTransactionsTabId,
  applicationHistoricalTransactionsTabLabel,
  applicationIdLabel,
  applicationLiveTransactionsTabId,
  applicationLiveTransactionsTabLabel,
  applicationLocalStateByteLabel,
  applicationLocalStateUintLabel,
  applicationTransactionsLabel,
  applicationNameLabel,
} from './labels'
import { isDefined } from '@/utils/is-defined'
import { ApplicationProgram } from './application-program'
import { ApplicationGlobalStateTable } from './application-global-state-table'
import { ApplicationBoxes } from './application-boxes'
import { OverflowAutoTabsContent, Tabs, TabsList, TabsTrigger } from '@/features/common/components/tabs'
import { ApplicationLiveTransactions } from './application-live-transactions'
import { ApplicationTransactionHistory } from './application-transaction-history'
import { AccountLink } from '@/features/accounts/components/account-link'
import { OpenJsonViewDialogButton } from '@/features/common/components/json-view-dialog-button'

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
      application.name
        ? {
            dt: applicationNameLabel,
            dd: application.name,
          }
        : undefined,
      {
        dt: applicationCreatorAccountLabel,
        dd: <AccountLink address={application.creator}></AccountLink>,
      },
      {
        dt: applicationAccountLabel,
        dd: <AccountLink address={application.account}></AccountLink>,
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
    [
      application.id,
      application.name,
      application.creator,
      application.account,
      application.globalStateSchema,
      application.localStateSchema,
    ]
  ).filter(isDefined)

  return (
    <div className={cn('space-y-4')}>
      <Card aria-label={applicationDetailsLabel} className={cn('p-4')}>
        <CardContent className={cn('text-sm space-y-2')}>
          <div className={cn('grid grid-cols-[1fr_max-content]')}>
            <DescriptionList items={applicationItems} />
            <OpenJsonViewDialogButton json={application.json} />
          </div>
        </CardContent>
      </Card>
      <Card aria-label={applicationApprovalProgramLabel} className={cn('p-4')}>
        <CardContent className={cn('text-sm space-y-2')}>
          <h2>{applicationApprovalProgramLabel}</h2>
          <ApplicationProgram tabsListAriaLabel={applicationApprovalProgramTabsListAriaLabel} base64Program={application.approvalProgram} />
        </CardContent>
      </Card>
      <Card aria-label={applicationClearStateProgramLabel} className={cn('p-4')}>
        <CardContent className={cn('text-sm space-y-2')}>
          <h2>{applicationClearStateProgramLabel}</h2>
          <ApplicationProgram
            tabsListAriaLabel={applicationClearStateProgramTabsListAriaLabel}
            base64Program={application.clearStateProgram}
          />
        </CardContent>
      </Card>
      <Card aria-label={applicationGlobalStateLabel} className={cn('p-4')}>
        <CardContent className={cn('text-sm space-y-2')}>
          <h2>{applicationGlobalStateLabel}</h2>
          <ApplicationGlobalStateTable application={application} />
        </CardContent>
      </Card>
      <Card aria-label={applicationBoxesLabel} className={cn('p-4')}>
        <CardContent className={cn('text-sm space-y-2')}>
          <h2>{applicationBoxesLabel}</h2>
          <ApplicationBoxes applicationId={application.id} />
        </CardContent>
      </Card>
      <Card aria-label={applicationTransactionsLabel} className={cn('p-4')}>
        <CardContent className={cn('text-sm space-y-2')}>
          <h2>{applicationTransactionsLabel}</h2>
          <Tabs defaultValue={applicationLiveTransactionsTabId}>
            <TabsList aria-label={applicationTransactionsLabel}>
              <TabsTrigger className="w-48" value={applicationLiveTransactionsTabId}>
                {applicationLiveTransactionsTabLabel}
              </TabsTrigger>
              <TabsTrigger className="w-48" value={applicationHistoricalTransactionsTabId}>
                {applicationHistoricalTransactionsTabLabel}
              </TabsTrigger>
            </TabsList>
            <OverflowAutoTabsContent value={applicationLiveTransactionsTabId}>
              <ApplicationLiveTransactions applicationId={application.id} />
            </OverflowAutoTabsContent>
            <OverflowAutoTabsContent value={applicationHistoricalTransactionsTabId}>
              <ApplicationTransactionHistory applicationId={application.id} />
            </OverflowAutoTabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
