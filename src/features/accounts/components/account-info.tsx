import { useMemo } from 'react'
import { Account } from '../models'
import { Card, CardContent } from '@/features/common/components/card'
import { DescriptionList } from '@/features/common/components/description-list'
import { cn } from '@/features/common/utils'
import { AccountVisualTabs } from './account-visual-tabs'

export const accountAddressLabel = 'Address'
export const accountBalanceLabel = 'Balance'
export const accountMinBalanceLabel = 'Min Balance'
export const accountHoldingAssetsLabel = 'Holding assets'
export const accountCreatedAssetsLabel = 'Created assets'
export const accountCreatedApplicationsLabel = 'Created applications'
export const accountOptedApplicationsLabel = 'opted applications'
export const accountRekeyedToLabel = 'Rekeyed to'
export const activityLabel = 'Activity'
export const accountJsonLabel = 'Acount JSON'

export function AccountInfo({ account }: { account: Account }) {
  const accountInfoItems = useMemo(() => {
    const items = [
      {
        dt: accountAddressLabel,
        dd: account.address,
      },
      {
        dt: accountBalanceLabel,
        dd: account.balance,
      },
      {
        dt: accountMinBalanceLabel,
        dd: account.minBalance,
      },
      {
        dt: accountHoldingAssetsLabel,
        dd: account.totalHeldAssets,
      },
      {
        dt: accountCreatedAssetsLabel,
        dd: account.totalCreatedAssets ? account.totalCreatedAssets : 0,
      },
      {
        dt: accountCreatedApplicationsLabel,
        dd: account.totalCreatedApps ? account.totalCreatedApps : 0,
      },
      {
        dt: accountOptedApplicationsLabel,
        dd: account.totalAssetsOptedIn ? account.totalAssetsOptedIn : 0,
      },
    ]

    if (account.rekeyedTo) {
      items.push({
        dt: accountRekeyedToLabel,
        dd: account.rekeyedTo,
      })
    }

    return items
  }, [
    account.address,
    account.balance,
    account.minBalance,
    account.totalHeldAssets,
    account.totalCreatedAssets,
    account.totalCreatedApps,
    account.totalAssetsOptedIn,
    account.rekeyedTo,
  ])

  return (
    <div className={cn('space-y-6 pt-7')}>
      <Card className={cn('p-4')}>
        <CardContent className={cn('text-sm space-y-2')}>
          <DescriptionList items={accountInfoItems} />
        </CardContent>
      </Card>
      <Card className={cn('p-4')}>
        <CardContent className={cn('text-sm space-y-2')}>
          <h1 className={cn('text-2xl text-primary font-bold')}>{activityLabel}</h1>
          <div className={cn('border-solid border-2 border-border h-96 grid')}>
            <AccountVisualTabs account={account} />
          </div>
        </CardContent>
      </Card>
      <Card className={cn('p-4')}>
        <CardContent className={cn('text-sm space-y-2')}>
          <h1 className={cn('text-2xl text-primary font-bold')}>{accountJsonLabel}</h1>
          <div className={cn('border-solid border-2 border-border h-96 grid')}>
            <pre className={cn('overflow-scroll p-4')}>{JSON.stringify(account.json, null, 2)}</pre>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
