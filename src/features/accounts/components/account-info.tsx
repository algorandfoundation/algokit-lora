import { useMemo } from 'react'
import { Account } from '../models'
import { Card, CardContent } from '@/features/common/components/card'
import { DescriptionList } from '@/features/common/components/description-list'
import { cn } from '@/features/common/utils'
import { DisplayAlgo } from '@/features/common/components/display-algo'
import { AccountLink } from './account-link'

export const accountAddressLabel = 'Address'
export const accountBalanceLabel = 'Balance'
export const accountMinBalanceLabel = 'Min Balance'
export const accountHoldingAssetsLabel = 'Holding assets'
export const accountCreatedAssetsLabel = 'Created assets'
export const accountCreatedApplicationsLabel = 'Created applications'
export const accountOptedApplicationsLabel = 'Opted applications'
export const accountRekeyedToLabel = 'Rekeyed to'

export function AccountInfo({ account }: { account: Account }) {
  const accountInfoItems = useMemo(() => {
    const items = [
      {
        dt: accountAddressLabel,
        dd: account.address,
      },
      {
        dt: accountBalanceLabel,
        dd: <DisplayAlgo amount={account.balance} />,
      },
      {
        dt: accountMinBalanceLabel,
        dd: <DisplayAlgo amount={account.minBalance} />,
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

    account.rekeyedTo &&
      items.push({
        dt: accountRekeyedToLabel,
        dd: <AccountLink address={account.rekeyedTo}></AccountLink>,
      })

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
    <Card className={cn('p-4')}>
      <CardContent className={cn('text-sm space-y-2')}>
        <DescriptionList items={accountInfoItems} />
      </CardContent>
    </Card>
  )
}
