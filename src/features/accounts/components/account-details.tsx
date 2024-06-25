import { Card, CardContent } from '@/features/common/components/card'
import { Account } from '../models'
import { cn } from '@/features/common/utils'
import { AccountActivityTabs } from './account-activity-tabs'
import { AccountInfo } from './account-info'
import { accountActivityLabel, accountApplicationLabel, accountAssetLabel } from './labels'
import { AccountAssetTabs } from './account-asset-tabs'
import { AccountApplicationTabs } from './account-application-tabs'

type Props = {
  account: Account
}

export function AccountDetails({ account }: Props) {
  return (
    <div className={cn('space-y-4')}>
      <AccountInfo account={account} />
      <Card>
        <CardContent className={cn('space-y-1')}>
          <h2>{accountActivityLabel}</h2>
          <AccountActivityTabs account={account} />
        </CardContent>
      </Card>

      <Card>
        <CardContent className={cn('space-y-1')}>
          <h2>{accountAssetLabel}</h2>
          <AccountAssetTabs account={account} />
        </CardContent>
      </Card>
      <Card>
        <CardContent className={cn('space-y-1')}>
          <h2>{accountApplicationLabel}</h2>
          <AccountApplicationTabs account={account} />
        </CardContent>
      </Card>
    </div>
  )
}
