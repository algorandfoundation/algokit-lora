import { Card, CardContent } from '@/features/common/components/card'
import { Account } from '../models'
import { cn } from '@/features/common/utils'
import { AccountActivityTabs } from './account-activity-tabs'
import { AccountInfo } from './account-info'
import { accountActivityLabel, accountApplicationLabel, accountAssetLabel, accountJsonLabel } from './labels'
import { JsonView } from '@/features/common/components/json-view'
import { AccountAssetTabs } from './account-asset-tabs'
import { AccountApplicationTabs } from './account-application-tabs'

type Props = {
  account: Account
}

export function AccountDetails({ account }: Props) {
  return (
    <div className={cn('space-y-4')}>
      <AccountInfo account={account} />
      <Card className={cn('p-4')}>
        <CardContent className={cn('text-sm space-y-2')}>
          <h2>{accountActivityLabel}</h2>
          <AccountActivityTabs account={account} />
        </CardContent>
      </Card>

      <Card className={cn('p-4')}>
        <CardContent className={cn('text-sm space-y-2')}>
          <h2>{accountAssetLabel}</h2>
          <AccountAssetTabs account={account} />
        </CardContent>
      </Card>
      <Card className={cn('p-4')}>
        <CardContent className={cn('text-sm space-y-2')}>
          <h2>{accountApplicationLabel}</h2>
          <AccountApplicationTabs account={account} />
        </CardContent>
      </Card>

      <Card className={cn('p-4')}>
        <CardContent aria-label={accountJsonLabel} className={cn('text-sm space-y-2')}>
          <h2>{accountJsonLabel}</h2>
          <div className={cn('border-solid border-2 border-border h-96 grid')}>
            <JsonView json={account.json} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
