import { Card, CardContent } from '@/features/common/components/card'
import { DescriptionList } from '@/features/common/components/description-list'
import { Application } from '../models'
import { useMemo } from 'react'
import {
  applicationAccountLabel,
  applicationBoxesLabel,
  applicationCreatorAccountLabel,
  applicationDetailsLabel,
  applicationGlobalStateByteLabel,
  applicationStateLabel,
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
  applicationBoxesTabId,
  applicationGlobalStateTabId,
  applicationGlobalStateLabel,
  applicationAbiMethodDefinitionsLabel,
} from './labels'
import { ApplicationGlobalStateTable } from './application-global-state-table'
import { ApplicationBoxes } from './application-boxes'
import { OverflowAutoTabsContent, Tabs, TabsList, TabsTrigger } from '@/features/common/components/tabs'
import { ApplicationLiveTransactions } from './application-live-transactions'
import { ApplicationTransactionHistory } from './application-transaction-history'
import { AccountLink } from '@/features/accounts/components/account-link'
import { OpenJsonViewDialogButton } from '@/features/common/components/json-view-dialog-button'
import { Badge } from '@/features/common/components/badge'
import { CopyButton } from '@/features/common/components/copy-button'
import { ApplicationProgramsButton } from './application-programs-button'
import { useLoadableApplicationAbiMethodDefinitions } from '../data/application-method-definitions'
import { RenderLoadable } from '@/features/common/components/render-loadable'
import { ApplicationMethodDefinitions } from './application-method-definitions'

type Props = {
  application: Application
}

const expandApplicationJsonLevel = (level: number) => {
  return level < 2
}

export function ApplicationDetails({ application }: Props) {
  const applicationItems = useMemo(
    () => [
      {
        dt: applicationIdLabel,
        dd: (
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center overflow-hidden">
              <span className="truncate">{application.id}</span>
              <CopyButton value={application.id.toString()} />
            </div>
            {application.isDeleted && <Badge variant="outline">Deleted</Badge>}
          </div>
        ),
      },
      ...(application.name
        ? [
            {
              dt: applicationNameLabel,
              dd: application.name,
            },
          ]
        : []),
      {
        dt: applicationCreatorAccountLabel,
        dd: <AccountLink address={application.creator} showCopyButton={true} />,
      },
      {
        dt: applicationAccountLabel,
        dd: <AccountLink address={application.account} showCopyButton={true} />,
      },
      ...(application.globalStateSchema
        ? [
            {
              dt: applicationGlobalStateByteLabel,
              dd: application.globalStateSchema.numByteSlice,
            },
          ]
        : []),
      ...(application.localStateSchema
        ? [
            {
              dt: applicationLocalStateByteLabel,
              dd: application.localStateSchema.numByteSlice,
            },
          ]
        : []),
      ...(application.globalStateSchema
        ? [
            {
              dt: applicationGlobalStateUintLabel,
              dd: application.globalStateSchema.numUint,
            },
          ]
        : []),
      ...(application.localStateSchema
        ? [
            {
              dt: applicationLocalStateUintLabel,
              dd: application.localStateSchema.numUint,
            },
          ]
        : []),
    ],
    [
      application.id,
      application.isDeleted,
      application.name,
      application.creator,
      application.account,
      application.globalStateSchema,
      application.localStateSchema,
    ]
  )

  const applicationAbiMethodsLoadable = useLoadableApplicationAbiMethodDefinitions(application)

  return (
    <div className="space-y-4">
      <Card aria-label={applicationDetailsLabel}>
        <CardContent>
          <div className="flex gap-2">
            <DescriptionList items={applicationItems} />
            <div className="ml-auto hidden flex-col-reverse justify-end gap-2 md:flex lg:flex-row">
              <ApplicationProgramsButton application={application} />
              <OpenJsonViewDialogButton json={application.json} expandJsonLevel={expandApplicationJsonLevel} />
            </div>
          </div>
        </CardContent>
      </Card>
      <RenderLoadable loadable={applicationAbiMethodsLoadable} fallback={<></>}>
        {(applicationAbiMethods) =>
          applicationAbiMethods &&
          applicationAbiMethods.methods.length > 0 && (
            <Card aria-label={applicationAbiMethodDefinitionsLabel}>
              <CardContent className="space-y-1">
                <h2>{applicationAbiMethodDefinitionsLabel}</h2>
                <ApplicationMethodDefinitions applicationId={application.id} abiMethods={applicationAbiMethods} />
              </CardContent>
            </Card>
          )
        }
      </RenderLoadable>
      <Card aria-label={applicationStateLabel}>
        <CardContent className="space-y-1">
          <h2>{applicationStateLabel}</h2>
          <Tabs defaultValue={applicationGlobalStateTabId}>
            <TabsList aria-label={applicationStateLabel}>
              <TabsTrigger className="w-fit px-4" value={applicationGlobalStateTabId}>
                {applicationGlobalStateLabel}
              </TabsTrigger>
              <TabsTrigger className="w-fit px-4" value={applicationBoxesTabId}>
                {applicationBoxesLabel}
              </TabsTrigger>
            </TabsList>
            <OverflowAutoTabsContent value={applicationGlobalStateTabId}>
              <ApplicationGlobalStateTable application={application} />
            </OverflowAutoTabsContent>
            <OverflowAutoTabsContent value={applicationBoxesTabId}>
              <ApplicationBoxes applicationId={application.id} />
            </OverflowAutoTabsContent>
          </Tabs>
        </CardContent>
      </Card>
      <Card aria-label={applicationTransactionsLabel}>
        <CardContent className="space-y-1">
          <h2>{applicationTransactionsLabel}</h2>
          <Tabs defaultValue={applicationLiveTransactionsTabId}>
            <TabsList aria-label={applicationTransactionsLabel}>
              <TabsTrigger className="w-56" value={applicationLiveTransactionsTabId}>
                {applicationLiveTransactionsTabLabel}
              </TabsTrigger>
              <TabsTrigger className="w-56" value={applicationHistoricalTransactionsTabId}>
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
