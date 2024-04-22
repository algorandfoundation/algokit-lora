import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/features/common/components/tabs'
import { AppCallTransactionModel, GlobalStateDelta, InnerAppCallTransactionModel, LocalStateDelta } from '../models'
import { cn } from '@/features/common/utils'
import { useMemo } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { DataTable } from '@/features/common/components/data-table'
import { transactionSenderLabel } from './transaction-view-table'
import { DescriptionList } from '@/features/common/components/description-list'
import { ellipseAddress } from '@/utils/ellipse-address'

type Props = {
  transaction: AppCallTransactionModel | InnerAppCallTransactionModel
}

const applicationArgsTabId = 'application-args'
const foreignAccountsTabId = 'foreign-accounts'
const foreignApplicationsTabId = 'foreign-applications'
const foreignAssetsTabId = 'foreign-assets'
const globalStateDeltaTabId = 'global-state'
const localStateDeltaTabId = 'local-state'

export const applicationArgsTabLabel = 'Application Args'
export const foreignAccountsTabLabel = 'Foreign Accounts'
export const foreignApplicationsTabLabel = 'Foreign Applications'
export const foreignAssetsTabLabel = 'Foreign Assets'
export const globalStateDeltaTabLabel = 'Global State Delta'
export const localStateDeltaTabLabel = 'Local State Delta'

export const appCallTransactionDetailsLabel = 'App Call Transaction Details'
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
        children: <ApplicationArgs transaction={transaction} />,
      },
      {
        id: foreignAccountsTabId,
        label: foreignAccountsTabLabel,
        children: <ForeignAccounts transaction={transaction} />,
      },
      {
        id: foreignApplicationsTabId,
        label: foreignApplicationsTabLabel,
        children: <ForeignApplications transaction={transaction} />,
      },
      {
        id: foreignAssetsTabId,
        label: foreignAssetsTabLabel,
        children: <ForeignAssets transaction={transaction} />,
      },
      {
        id: globalStateDeltaTabId,
        label: globalStateDeltaTabLabel,
        children: <GlobalStateDeltas transaction={transaction} />,
      },
      {
        id: localStateDeltaTabId,
        label: localStateDeltaTabLabel,
        children: <LocalStateDeltas transaction={transaction} />,
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
            {tab.children}
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

function ForeignAccounts({ transaction }: Props) {
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

export const globalStateDeltaTableColumns: ColumnDef<GlobalStateDelta>[] = [
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

export const localStateDeltaTableColumns: ColumnDef<LocalStateDelta>[] = [
  {
    accessorKey: 'address',
    header: 'Address',
    cell: (c) => ellipseAddress(c.getValue<string>()),
  },
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

function LocalStateDeltas({ transaction }: Props) {
  return <DataTable columns={localStateDeltaTableColumns} data={transaction.localStateDeltas} />
}
