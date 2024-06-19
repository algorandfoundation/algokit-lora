import { Tabs, OverflowAutoTabsContent, TabsList, TabsTrigger } from '@/features/common/components/tabs'
import { useMemo } from 'react'
import { AccountAssetsHeld } from './account-assets-held'
import { Account } from '../models'
import {
  accountCreatedAssetsTabId,
  accountHeldAssetsTabId,
  accountHeldAssetsTabLabel,
  accountCreatedAssetsTabLabel,
  accountOptedAssetsTabId,
  accountOptedAssetsTabLabel,
  accountAssetLabel,
} from './labels'
import { AccountAssetsCreated } from './account-assets-created'
import { AccountAssetsOpted } from './account-assets-opted'

type Props = {
  account: Account
}

export function AccountAssetTabs({ account }: Props) {
  const tabs = useMemo(
    () => [
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
    ],
    [account.assetsCreated, account.assetsHeld, account.assetsOpted]
  )
  return (
    <Tabs defaultValue={accountHeldAssetsTabId}>
      <TabsList aria-label={accountAssetLabel}>
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
