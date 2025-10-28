import { OverflowAutoTabsContent, Tabs, TabsList, TabsTrigger } from '@/features/common/components/tabs'
import {
  AppCallTransaction,
  GlobalStateDelta,
  InnerAppCallTransaction,
  LocalStateDelta,
  RawGlobalStateDelta,
  RawLocalStateDelta,
} from '../models'
import { cn } from '@/features/common/utils'
import { useMemo } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { DataTable } from '@/features/common/components/data-table'
import { DescriptionList } from '@/features/common/components/description-list'
import { AccountLink } from '@/features/accounts/components/account-link'
import { ApplicationLink } from '@/features/applications/components/application-link'
import { applicationIdLabel } from '@/features/applications/components/labels'
import { abiMethodNameLabel, transactionSenderLabel } from './labels'
import { AssetIdLink } from '@/features/assets/components/asset-link'
import { useAtomValue } from 'jotai'
import { loadable } from 'jotai/utils'
import { RenderLoadable } from '@/features/common/components/render-loadable'
import { DecodedAbiMethod as DecodedAbiMethodModel } from '@/features/abi-methods/models'
import { DecodedAbiMethod } from '@/features/abi-methods/components/decoded-abi-method'
import { RenderAsyncAtom } from '@/features/common/components/render-async-atom'
import { DecodedAbiStorageValue } from '@/features/abi-methods/components/decoded-abi-storage-value'
import { DecodedAbiStorageKey } from '@/features/abi-methods/components/decoded-abi-storage-key'
import { Method } from '@algorandfoundation/algokit-utils/types/app-arc56'

type Props = {
  transaction: AppCallTransaction | InnerAppCallTransaction
}

const applicationArgsTabId = 'application-args'
const foreignAccountsTabId = 'foreign-accounts'
const foreignApplicationsTabId = 'foreign-applications'
const foreignAssetsTabId = 'foreign-assets'
const globalStateDeltaTabId = 'global-state'
const localStateDeltaTabId = 'local-state'
const decodedAbiMethodTabId = 'decoded-app-call'

export const applicationArgsTabLabel = 'Application Args'
export const foreignAccountsTabLabel = 'Foreign Accounts'
export const foreignApplicationsTabLabel = 'Foreign Applications'
export const foreignAssetsTabLabel = 'Foreign Assets'
export const globalStateDeltaTabLabel = 'Global State Delta'
export const localStateDeltaTabLabel = 'Local State Delta'
export const decodedAbiMethodTabLabel = 'ABI Method'
export const appCallTransactionDetailsLabel = 'App Call Transaction Details'
export const onCompletionLabel = 'On Completion'

export function AppCallTransactionInfo({ transaction }: Props) {
  const loadableAbiMethod = useAtomValue(loadable(transaction.abiMethod))

  return (
    <div className={cn('space-y-2')}>
      <div className={cn('flex items-center justify-between')}>
        <h2>Application Call</h2>
      </div>
      <RenderLoadable loadable={loadableAbiMethod}>
        {(abiMethod) => (
          <>
            <AppCallDescriptionList transaction={transaction} abiMethod={abiMethod} />
            <AppCallTransactionTabs transaction={transaction} abiMethod={abiMethod} />
          </>
        )}
      </RenderLoadable>
    </div>
  )
}

function AppCallDescriptionList({
  transaction,
  abiMethod,
}: {
  transaction: AppCallTransaction | InnerAppCallTransaction
  abiMethod: DecodedAbiMethodModel | undefined
}) {
  const items = useMemo(
    () => [
      {
        dt: transactionSenderLabel,
        dd: <AccountLink address={transaction.sender} showCopyButton={true} showQRButton={true} />,
      },
      {
        dt: applicationIdLabel,
        dd: <ApplicationLink applicationId={transaction.applicationId} showCopyButton={true} />,
      },
      ...(abiMethod ? [{ dt: abiMethodNameLabel, dd: abiMethod.name }] : []),
      {
        dt: onCompletionLabel,
        dd: transaction.onCompletion,
      },
    ],
    [abiMethod, transaction.applicationId, transaction.onCompletion, transaction.sender]
  )
  return <DescriptionList items={items} />
}

function AppCallTransactionTabs({
  transaction,
  abiMethod,
}: {
  transaction: AppCallTransaction | InnerAppCallTransaction
  abiMethod: DecodedAbiMethodModel | undefined
}) {
  const tabs = useMemo(
    () => [
      ...(abiMethod
        ? [
            {
              id: decodedAbiMethodTabId,
              label: decodedAbiMethodTabLabel,
              children: <DecodedAbiMethod abiMethod={abiMethod} />,
            },
          ]
        : []),
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
    [abiMethod, transaction]
  )

  return (
    <Tabs defaultValue={abiMethod ? decodedAbiMethodTabId : applicationArgsTabId}>
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
        transaction.applicationAccounts.map((address, index) => (
          <AccountLink key={index} address={address} showCopyButton={true} showQRButton={true} />
        ))}
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

const rawGlobalStateDeltaTableColumns: ColumnDef<RawGlobalStateDelta>[] = [
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

const decodedGlobalStateDeltaTableColumns: ColumnDef<GlobalStateDelta>[] = [
  {
    header: 'Key',
    accessorFn: (item) => item,
    cell: (c) => {
      const key = c.getValue<GlobalStateDelta>().key

      if (typeof key === 'string') {
        return key
      }

      return key.name
    },
  },
  {
    header: 'Decoded Key',
    accessorFn: (item) => item,
    cell: (c) => {
      const key = c.getValue<GlobalStateDelta>().key

      if (typeof key === 'string') {
        return undefined
      }

      return <DecodedAbiStorageKey storageKey={key} />
    },
  },
  {
    accessorKey: 'action',
    header: 'Action',
  },
  {
    header: 'Value',
    accessorFn: (item) => item,
    cell: (c) => {
      const globalState = c.getValue<GlobalStateDelta>()

      if ('type' in globalState) {
        return globalState.value.toString()
      }

      return <DecodedAbiStorageValue value={globalState.value} />
    },
  },
]

function GlobalStateDeltas({ transaction }: Props) {
  return <RenderAsyncAtom atom={transaction.globalStateDeltas}>{(data) => <GlobalStateTable data={data} />}</RenderAsyncAtom>
}

function GlobalStateTable({ data }: { data: GlobalStateDelta[] }) {
  const component = useMemo(() => {
    if (data.every((item) => 'type' in item)) {
      return <DataTable columns={rawGlobalStateDeltaTableColumns} data={data} dataContext="applicationState" />
    }
    return <DataTable columns={decodedGlobalStateDeltaTableColumns} data={data} dataContext="applicationState" />
  }, [data])

  return component
}

const rawLocalStateDeltaTableColumns: ColumnDef<RawLocalStateDelta>[] = [
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

const decodedLocalStateDeltaTableColumns: ColumnDef<LocalStateDelta>[] = [
  {
    accessorKey: 'address',
    header: 'Address',
    cell: (c) => <AccountLink address={c.getValue<string>()} short={true} />,
  },
  {
    header: 'Key',
    accessorFn: (item) => item,
    cell: (c) => {
      const key = c.getValue<LocalStateDelta>().key

      if (typeof key === 'string') {
        return key
      }

      return key.name
    },
  },
  {
    header: 'Decoded Key',
    accessorFn: (item) => item,
    cell: (c) => {
      const key = c.getValue<LocalStateDelta>().key

      if (typeof key === 'string') {
        return undefined
      }

      return <DecodedAbiStorageKey storageKey={key} />
    },
  },
  {
    accessorKey: 'action',
    header: 'Action',
  },
  {
    header: 'Value',
    accessorFn: (item) => item,
    cell: (c) => {
      const localState = c.getValue<LocalStateDelta>()

      if ('type' in localState) {
        return localState.value.toString()
      }

      return <DecodedAbiStorageValue value={localState.value} />
    },
  },
]

function LocalStateDeltas({ transaction }: Props) {
  return <RenderAsyncAtom atom={transaction.localStateDeltas}>{(data) => <LocalStateTable data={data} />}</RenderAsyncAtom>
}

function LocalStateTable({ data }: { data: LocalStateDelta[] }) {
  const component = useMemo(() => {
    if (data.every((item) => 'type' in item)) {
      return <DataTable columns={rawLocalStateDeltaTableColumns} data={data} dataContext="applicationState" />
    }
    return <DataTable columns={decodedLocalStateDeltaTableColumns} data={data} dataContext="applicationState" />
  }, [data])

  return component
}
