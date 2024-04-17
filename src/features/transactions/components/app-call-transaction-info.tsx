import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/features/common/components/tabs'
import { AppCallTransactionModel, StateDelta } from '../models'
import { cn } from '@/features/common/utils'
import { useMemo } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { DataTable } from '@/features/common/components/data-table'
import { transactionSenderLabel } from './transaction-view-table'
import { DescriptionList } from '@/features/common/components/description-list'

type Props = {
  transaction: AppCallTransactionModel
}

const applicationArgsTabId = 'application-args'
const applicationAccountsTabId = 'application-accounts'
const foreignApplicationsTabId = 'foreign-applications'
const foreignAssetsTabId = 'foreign-assets'
const globalStateSchemaTabId = 'global-state'
const localStateSchemaTabId = 'local-state'

const applicationArgsTabLabel = 'Application Args'
const applicationAccountsTabLabel = 'Application Accounts'
const foreignApplicationsTabLabel = 'Foreign Applications'
const foreignAssetsTabLabel = 'Foreign Assets'
const globalStateSchemaTabLabel = 'Global State Schema'
const localStateSchemaTabLabel = 'Local State Schema'

const appCallTransactionDetailsLabel = 'App Call Transaction Details'
export const onCompletionLabel = 'On Completion'
export const actionLabel = 'Action'
export const applicationIdLabel = 'Application Id'

export function AppCallTransactionInfo({ transaction }: Props) {
  const items = useMemo(
    () => [
      {
        dt: transactionSenderLabel,
        dd: (
          <a href="#" className={cn('text-primary underline')}>
            {transaction.sender}
          </a>
        ),
      },
      {
        dt: applicationIdLabel,
        dd: (
          <a href="#" className={cn('text-primary underline')}>
            {transaction.applicationId}
          </a>
        ),
      },
      {
        dt: actionLabel,
        dd: transaction.action,
      },
      {
        dt: onCompletionLabel,
        dd: transaction.onCompletion,
      },
    ],
    [transaction.action, transaction.applicationId, transaction.onCompletion, transaction.sender]
  )
  const tabs = useMemo(
    () => [
      {
        id: applicationArgsTabId,
        label: applicationArgsTabLabel,
        element: <ApplicationArgs transaction={transaction} />,
      },
      {
        id: applicationAccountsTabId,
        label: applicationAccountsTabLabel,
        element: <ApplicationAccounts transaction={transaction} />,
      },
      {
        id: foreignApplicationsTabId,
        label: foreignApplicationsTabLabel,
        element: <ForeignApplications transaction={transaction} />,
      },
      {
        id: foreignAssetsTabId,
        label: foreignAssetsTabLabel,
        element: <ForeignAssets transaction={transaction} />,
      },
      {
        id: globalStateSchemaTabId,
        label: globalStateSchemaTabLabel,
        element: <GlobalStateDeltas transaction={transaction} />,
      },
      {
        id: localStateSchemaTabId,
        label: localStateSchemaTabLabel,
        element: <LocalStateDeltas transaction={transaction} />,
      },
    ],
    [transaction]
  )

  return (
    <>
      <DescriptionList items={items} />

      <Tabs defaultValue={applicationArgsTabId}>
        <TabsList aria-label={appCallTransactionDetailsLabel}>
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.id}
              className={cn('data-[state=active]:border-primary data-[state=active]:border-b-2 w-44')}
              value={tab.id}
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {tabs.map((tab) => (
          <TabsContent key={tab.id} value={tab.id} className={cn('border-solid border-2 border-border p-4')}>
            {tab.element}
          </TabsContent>
        ))}
      </Tabs>
    </>
  )
}

function ApplicationArgs({ transaction }: Props) {
  return (
    <div>
      {transaction.applicationArgs.map((data, index) => (
        <div key={index}>{data}</div>
      ))}
    </div>
  )
}

function ApplicationAccounts({ transaction }: Props) {
  return (
    <div>
      {transaction.applicationAccounts.map((data, index) => (
        <div key={index}>{data}</div>
      ))}
    </div>
  )
}

function ForeignApplications({ transaction }: Props) {
  return (
    <div>
      {transaction.foreignApps.map((data, index) => (
        <div key={index}>{data}</div>
      ))}
    </div>
  )
}

function ForeignAssets({ transaction }: Props) {
  return (
    <div>
      {transaction.foreignAssets.map((data, index) => (
        <div key={index}>{data}</div>
      ))}
    </div>
  )
}

export const globalStateDeltaTableColumns: ColumnDef<StateDelta>[] = [
  {
    accessorKey: 'key',
    header: 'Key',
  },
  {
    accessorKey: 'type',
    header: 'Type',
  },
  {
    accessorKey: 'action',
    header: 'Action',
  },
  {
    accessorKey: 'value',
    header: 'Value',
  },
]

function GlobalStateDeltas({ transaction }: Props) {
  return <DataTable columns={globalStateDeltaTableColumns} data={transaction.globalStateDeltas} />
}

function LocalStateDeltas({ transaction }: Props) {
  return <DataTable columns={globalStateDeltaTableColumns} data={transaction.localStateDeltas} />
}
