import { OverflowAutoTabsContent, Tabs, TabsList, TabsTrigger } from '@/features/common/components/tabs'
import { AppCallTransaction, GlobalStateDelta, InnerAppCallTransaction, LocalStateDelta } from '../models'
import { cn } from '@/features/common/utils'
import { useMemo } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { DataTable } from '@/features/common/components/data-table'
import { DescriptionList } from '@/features/common/components/description-list'
import { AccountLink } from '@/features/accounts/components/account-link'
import { ApplicationLink } from '@/features/applications/components/application-link'
import { applicationIdLabel } from '@/features/applications/components/labels'
import { transactionSenderLabel } from './labels'
import { AssetIdLink } from '@/features/assets/components/asset-link'
import { DecodeAppCall } from '@/features/transactions/components/decode-app-call'
import { isDefined } from '@/utils/is-defined'

type Props = {
  transaction: AppCallTransaction | InnerAppCallTransaction
}

const applicationArgsTabId = 'application-args'
const foreignAccountsTabId = 'foreign-accounts'
const foreignApplicationsTabId = 'foreign-applications'
const foreignAssetsTabId = 'foreign-assets'
const globalStateDeltaTabId = 'global-state'
const localStateDeltaTabId = 'local-state'
const decodeAppCallTabId = 'decode-app-call'

export const applicationArgsTabLabel = 'Application Args'
export const foreignAccountsTabLabel = 'Foreign Accounts'
export const foreignApplicationsTabLabel = 'Foreign Applications'
export const foreignAssetsTabLabel = 'Foreign Assets'
export const globalStateDeltaTabLabel = 'Global State Delta'
export const localStateDeltaTabLabel = 'Local State Delta'
export const decodeAppCallTabLabel = 'Decode App Call'

export const appCallTransactionDetailsLabel = 'App Call Transaction Details'
export const onCompletionLabel = 'On Completion'

export function AppCallTransactionInfo({ transaction }: Props) {
  const items = useMemo(
    () => [
      {
        dt: transactionSenderLabel,
        dd: <AccountLink address={transaction.sender} showCopyButton={true} />,
      },
      {
        dt: applicationIdLabel,
        dd: <ApplicationLink applicationId={transaction.applicationId} showCopyButton={true} />,
      },
      {
        dt: onCompletionLabel,
        dd: transaction.onCompletion,
      },
    ],
    [transaction.applicationId, transaction.onCompletion, transaction.sender]
  )
  const tabs = useMemo(
    () =>
      [
        transaction.abiMethods
          ? {
              id: decodeAppCallTabId,
              label: decodeAppCallTabLabel,
              children: <DecodeAppCall transaction={transaction} />,
            }
          : undefined,
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
      ].filter(isDefined),
    [transaction]
  )

  return (
    <div className={cn('space-y-2')}>
      <div className={cn('flex items-center justify-between')}>
        <h2>Application Call</h2>
      </div>
      <DescriptionList items={items} />
      <Tabs defaultValue={transaction.abiMethods ? decodeAppCallTabId : applicationArgsTabId}>
        <TabsList aria-label={appCallTransactionDetailsLabel}>
          {tabs.map((tab) => (
            <TabsTrigger key={tab.id} className="w-44" value={tab.id}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {tabs.map((tab) => (
          <OverflowAutoTabsContent key={tab.id} value={tab.id} className="h-auto">
            {tab.children}
          </OverflowAutoTabsContent>
        ))}
      </Tabs>
    </div>
  )
}

function ApplicationArgs({ transaction }: Props) {
  return (
    <div>
      {transaction.applicationArgs.length === 0 && <span>No application args.</span>}
      {transaction.applicationArgs.length > 0 && (
        <DescriptionList
          items={transaction.applicationArgs.map((data, index) => ({
            dt: `${index + 1}.`,
            dd: <span className="text-wrap break-all">{data}</span>,
          }))}
        />
      )}
    </div>
  )
}

function ForeignAccounts({ transaction }: Props) {
  return (
    <div className="flex flex-col overflow-hidden">
      {transaction.applicationAccounts.length === 0 && <span>No foreign accounts.</span>}
      {transaction.applicationAccounts.length > 0 &&
        transaction.applicationAccounts.map((address, index) => <AccountLink key={index} address={address} showCopyButton={true} />)}
    </div>
  )
}

function ForeignApplications({ transaction }: Props) {
  return (
    <div className="flex flex-col overflow-hidden">
      {transaction.foreignApps.length === 0 && <span>No foreign applications.</span>}
      {transaction.foreignApps.length > 0 &&
        transaction.foreignApps.map((appId, index) => <ApplicationLink key={index} applicationId={appId} showCopyButton={true} />)}
    </div>
  )
}

function ForeignAssets({ transaction }: Props) {
  return (
    <div className="flex flex-col overflow-hidden">
      {transaction.foreignAssets.length === 0 && <span>No foreign assets.</span>}
      {transaction.foreignAssets.length > 0 &&
        transaction.foreignAssets.map((data, index) => <AssetIdLink key={index} assetId={data} showCopyButton={true} />)}
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
    cell: (c) => <AccountLink address={c.getValue<string>()} short={true} />,
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
