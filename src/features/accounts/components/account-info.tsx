import { useMemo } from 'react'
import { Account } from '../models'
import { Card, CardContent } from '@/features/common/components/card'
import { DescriptionList } from '@/features/common/components/description-list'
import { cn } from '@/features/common/utils'
import { DisplayAlgo } from '@/features/common/components/display-algo'
import { AccountLink } from './account-link'
import {
  accountAddressLabel,
  accountApplicationsCreatedLabel,
  accountApplicationsOptedInLabel,
  accountAssetsCreatedLabel,
  accountAssetsHeldLabel,
  accountAssetsOptedInLabel,
  accountBalanceLabel,
  accountInformationLabel,
  accountMinBalanceLabel,
  accountRekeyedToLabel,
} from './labels'

type Props = {
  account: Account
}

export function AccountInfo({ account }: Props) {
  const totalAssetsHeld = account.assetsHeld.length
  const totalAssetsCreated = account.assetsCreated.length
  const totalAssetsOptedIn = account.assetsHeld.length + account.assetsOpted.length
  const totalApplicationsCreated = account.applicationsCreated.length
  const totalApplicationsOptedIn = account.applicationsOpted.length

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
        dd: totalAssetsHeld,
      },
      {
        dt: accountAssetsCreatedLabel,
        dd: totalAssetsCreated,
      },
      {
        dt: accountAssetsOptedInLabel,
        dd: totalAssetsOptedIn,
      },
      {
        dt: accountApplicationsCreatedLabel,
        dd: totalApplicationsCreated,
      },
      {
        dt: accountApplicationsOptedInLabel,
        dd: totalApplicationsOptedIn,
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
    account.rekeyedTo,
    totalAssetsHeld,
    totalAssetsCreated,
    totalAssetsOptedIn,
    totalApplicationsCreated,
    totalApplicationsOptedIn,
  ])
  return (
    <Card aria-label={accountInformationLabel} className={cn('p-4')}>
      <CardContent className={cn('text-sm space-y-2')}>
        <DescriptionList items={accountInfoItems} />
      </CardContent>
    </Card>
  )
}
