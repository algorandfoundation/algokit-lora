import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/features/common/components/tabs'
import { AppCallTransactionModel } from '../models'
import { cn } from '@/features/common/utils'
import { useMemo } from 'react'

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

export function AppCallTransactionInfo({ transaction }: Props) {
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
        element: <>{globalStateSchemaTabLabel}</>,
      },
      {
        id: localStateSchemaTabId,
        label: localStateSchemaTabLabel,
        element: <>{localStateSchemaTabLabel}</>,
      },
    ],
    [transaction]
  )

  return (
    <Tabs defaultValue={applicationArgsTabId}>
      <TabsList aria-label={appCallTransactionDetailsLabel}>
        {tabs.map((tab) => (
          <TabsTrigger key={tab.id} className={cn('data-[state=active]:border-primary data-[state=active]:border-b-2 w-44')} value={tab.id}>
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
