import { Tabs, OverflowAutoTabsContent, TabsList, TabsTrigger } from '@/features/common/components/tabs'
import { useMemo } from 'react'
import { Account } from '../models'
import {
  accountCreatedApplicationsTabId,
  accountOptedApplicationsTabId,
  accountCreatedApplicationsTabLabel,
  accountOptedApplicationsTabLabel,
  accountApplicationLabel,
} from './labels'
import { AccountApplications } from './account-applications'

type Props = {
  account: Account
}

export function AccountApplicationTabs({ account }: Props) {
  const tabs = useMemo(
    () => [
      {
        id: accountCreatedApplicationsTabId,
        label: accountCreatedApplicationsTabLabel,
        children: <AccountApplications applications={account.applicationsCreated} />,
      },
      {
        id: accountOptedApplicationsTabId,
        label: accountOptedApplicationsTabLabel,
        children: <AccountApplications applications={account.applicationsOpted} />,
      },
    ],
    [account.applicationsCreated, account.applicationsOpted]
  )
  return (
    <Tabs defaultValue={accountCreatedApplicationsTabId}>
      <TabsList aria-label={accountApplicationLabel}>
        {tabs.map((tab) => (
          <TabsTrigger key={tab.id} className="w-36" value={tab.id}>
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
