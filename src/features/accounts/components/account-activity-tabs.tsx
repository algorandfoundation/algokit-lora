import { OverflowAutoTabsContent, Tabs, TabsList, TabsTrigger } from '@/features/common/components/tabs'
import { cn } from '@/features/common/utils'
import { useMemo } from 'react'
import { AccountAssetsHeld } from './account-assets-held'
import { Account } from '../models'
import { AccountTransactionHistory } from './account-transaction-history'
import { AccountLiveTransactions } from './account-live-transactions'
import {
  accountActivityLabel,
  accountLiveTransactionsTabId,
  accountCreatedApplicationsTabId,
  accountCreatedAssetsTabId,
  accountHeldAssetsTabId,
  accountHistoricalTransactionsTabId,
  accountOptedApplicationsTabId,
  accountLiveTransactionsTabLabel,
  accountHistoricalTransactionsTabLabel,
  accountHeldAssetsTabLabel,
  accountCreatedAssetsTabLabel,
  accountCreatedApplicationsTabLabel,
  accountOptedApplicationsTabLabel,
  accountOptedAssetsTabId,
  accountOptedAssetsTabLabel,
} from './labels'
import { AccountAssetsCreated } from './account-assets-created'
import { AccountAssetsOpted } from './account-assets-opted'

type Props = {
  account: Account
}

export function AccountActivityTabs({ account }: Props) {
  const tabs = useMemo(
    () => [
      {
        id: accountLiveTransactionsTabId,
        label: accountLiveTransactionsTabLabel,
        children: <AccountLiveTransactions address={account.address} />,
      },
      {
        id: accountHistoricalTransactionsTabId,
        label: accountHistoricalTransactionsTabLabel,
        children: <AccountTransactionHistory address={account.address} />,
      },
      {
        id: accountHeldAssetsTabId,
        label: accountHeldAssetsTabLabel,
        children: <AccountAssetsHeld assetsHeld={account.assetsHeld} />,
      },
      {
        id: accountCreatedAssetsTabId,
        label: accountCreatedAssetsTabLabel,
        children: <AccountAssetsCreated assetsCreated={account.assetsCreated} />,
      },
      {
        id: accountOptedAssetsTabId,
        label: accountOptedAssetsTabLabel,
        children: <AccountAssetsOpted assetsOpted={account.assetsOpted} />,
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
    [account.address, account.assetsCreated, account.assetsHeld, account.assetsOpted]
  )
  return (
    <Tabs defaultValue={accountHistoricalTransactionsTabId}>
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
