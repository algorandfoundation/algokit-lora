import { OverflowAutoTabsContent, Tabs, TabsList, TabsTrigger } from '@/features/common/components/tabs'
import { cn } from '@/features/common/utils'
import { useMemo } from 'react'
import { AccountAssetHeld } from './account-assets-held'
import { Account } from '../models'
import { AccountTransactionHistory } from './account-transaction-history'
import { accountActivityLabel } from './account-details'

const accountLiveTransactionsTabId = 'live-transactions'
const accountHistoricalTransactionsTabId = 'historical-transactions'
const accountHeldAssetsTabId = 'held-assets'
const accountCreatedAssetsTabId = 'created-assets'
const accountCreatedApplicationsTabId = 'created-applications'
const accountOptedApplicationsTabId = 'opted-applications'

export const accountLiveTransactionsTabLabel = 'Live Transactions'
export const accountHistoricalTransactionsTabLabel = 'Historical Transactions'
export const accountHeldAssetsTabLabel = 'Held Assets'
export const accountCreatedAssetsTabLabel = 'Created Assets'
export const accountCreatedApplicationsTabLabel = 'Created Applications'
export const accountOptedApplicationsTabLabel = 'Opted Applications'

type Props = {
  account: Account
}

export function AccountActivityTabs({ account }: Props) {
  const tabs = useMemo(
    () => [
      {
        id: accountLiveTransactionsTabId,
        label: accountLiveTransactionsTabLabel,
        children: '',
      },
      {
        id: accountHistoricalTransactionsTabId,
        label: accountHistoricalTransactionsTabLabel,
        children: <AccountTransactionHistory address={account.address} />,
      },
      {
        id: accountHeldAssetsTabId,
        label: accountHeldAssetsTabLabel,
        children: <AccountAssetHeld address={account.address} />,
      },
      {
        id: accountCreatedAssetsTabId,
        label: accountCreatedAssetsTabLabel,
        children: '',
      },
      {
        id: accountCreatedApplicationsTabId,
        label: accountCreatedApplicationsTabLabel,
        children: '',
      },
      {
        id: accountOptedApplicationsTabId,
        label: accountOptedApplicationsTabLabel,
        children: '',
      },
    ],
    [account.address]
  )
  return (
    <Tabs defaultValue={accountLiveTransactionsTabId}>
      <TabsList aria-label={accountActivityLabel}>
        {tabs.map((tab) => (
          <TabsTrigger key={tab.id} className={cn('data-[state=active]:border-primary data-[state=active]:border-b-2 w-44')} value={tab.id}>
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {tabs.map((tab) => (
        <OverflowAutoTabsContent key={tab.id} value={tab.id} className={cn('border-solid border-2 border-border')}>
          <div className="grid">
            <div className="overflow-auto p-4">{tab.children}</div>
          </div>
        </OverflowAutoTabsContent>
      ))}
    </Tabs>
  )
}
