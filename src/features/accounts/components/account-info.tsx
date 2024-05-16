import { useMemo } from 'react'
import { Account } from '../models'
import { Card, CardContent } from '@/features/common/components/card'
import { DescriptionList } from '@/features/common/components/description-list'
import { cn } from '@/features/common/utils'
import { DisplayAlgo } from '@/features/common/components/display-algo'
import { AccountLink } from './account-link'

export const accountInformationLabel = 'Account Information'
export const accountAddressLabel = 'Address'
export const accountBalanceLabel = 'Balance'
export const accountMinBalanceLabel = 'Min Balance'
export const accountAssetsHeldLabel = 'Holding assets'
export const accountAssetsCreatedLabel = 'Created assets'
export const accountAssetsOptedInLabel = 'Opted assets'
export const accountApplicationsCreatedLabel = 'Created applications'
export const accountApplicationsOptedInLabel = 'Opted applications'
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
        dt: accountAssetsHeldLabel,
        dd: account.totalAssetsHeld,
      },
      {
        dt: accountAssetsCreatedLabel,
        dd: account.totalAssetsCreated,
      },
      {
        dt: accountAssetsOptedInLabel,
        dd: account.totalAssetsOptedIn,
      },
      {
        dt: accountApplicationsCreatedLabel,
        dd: account.totalApplicationsCreated ? account.totalApplicationsCreated : 0,
      },
      {
        dt: accountApplicationsOptedInLabel,
        dd: account.totalApplicationsOptedIn ? account.totalApplicationsOptedIn : 0,
      },
      ...(account.rekeyedTo
        ? [
            {
              dt: accountRekeyedToLabel,
              dd: <AccountLink address={account.rekeyedTo}></AccountLink>,
            },
          ]
        : []),
    ]
    return items
  }, [
    account.address,
    account.balance,
    account.minBalance,
    account.totalAssetsHeld,
    account.totalAssetsCreated,
    account.totalAssetsOptedIn,
    account.totalApplicationsCreated,
    account.totalApplicationsOptedIn,
    account.rekeyedTo,
  ])
  return (
    <Card aria-label={accountInformationLabel} className={cn('p-4')}>
      <CardContent className={cn('text-sm space-y-2')}>
        <DescriptionList items={accountInfoItems} />
      </CardContent>
    </Card>
  )
}
