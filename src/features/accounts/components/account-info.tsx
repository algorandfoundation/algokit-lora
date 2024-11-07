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
  accountNfdLabel,
  accountRekeyedToLabel,
} from './labels'
import { OpenJsonViewDialogButton } from '@/features/common/components/json-view-dialog-button'
import { CopyButton } from '@/features/common/components/copy-button'
import { useLoadableReverseLookupNfdResult } from '@/features/nfd/data'

type Props = {
  account: Account
}

export function AccountInfo({ account }: Props) {
  const loadableNfd = useLoadableReverseLookupNfdResult(account.address, true)

  const accountInfoItems = useMemo(() => {
    const items = [
      {
        dt: accountAddressLabel,
        dd: (
          <div className="flex items-center">
            <span className="truncate">{account.address}</span>
            <CopyButton value={account.address} />
          </div>
        ),
      },
      ...(loadableNfd.state === 'hasData' && loadableNfd.data !== null
        ? [
            {
              dt: accountNfdLabel,
              dd: (
                <div className="flex items-center">
                  <span className="truncate">{loadableNfd.data.name}</span>
                </div>
              ),
            },
          ]
        : []),
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
        dd: account.totalAssetsHeld ?? '?',
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
        dd: account.totalApplicationsCreated,
      },
      {
        dt: accountApplicationsOptedInLabel,
        dd: account.totalApplicationsOptedIn,
      },
      ...(account.rekeyedTo
        ? [
            {
              dt: accountRekeyedToLabel,
              dd: <AccountLink address={account.rekeyedTo} showCopyButton={true} />,
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
    loadableNfd,
  ])
  return (
    <Card aria-label={accountInformationLabel}>
      <CardContent>
        <div className={cn('flex gap-2')}>
          <DescriptionList items={accountInfoItems} />
          <OpenJsonViewDialogButton json={account.json} />
        </div>
      </CardContent>
    </Card>
  )
}
