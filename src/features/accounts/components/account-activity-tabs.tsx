import { OverflowAutoTabsContent, Tabs, TabsList, TabsTrigger } from '@/features/common/components/tabs'
import { useMemo } from 'react'
import { Account } from '../models'
import { AccountTransactionHistory } from './account-transaction-history'
import { AccountLiveTransactions } from './account-live-transactions'
import {
  accountActivityLabel,
  accountLiveTransactionsTabId,
  accountHistoricalTransactionsTabId,
  accountLiveTransactionsTabLabel,
  accountHistoricalTransactionsTabLabel,
} from './labels'

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
    ],
    [account.address]
  )
  return (
    <Tabs defaultValue={accountLiveTransactionsTabId}>
      <TabsList aria-label={accountActivityLabel}>
        {tabs.map((tab) => (
          <TabsTrigger key={tab.id} className="w-56" value={tab.id}>
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {tabs.map((tab) => (
        <OverflowAutoTabsContent key={tab.id} value={tab.id}>
          {tab.children}
        </OverflowAutoTabsContent>
      ))}
    </Tabs>
  )
}
