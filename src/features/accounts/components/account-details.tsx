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
    <div className={cn('space-y-6 pt-7')}>
      <AccountInfo account={account} />
      <Card className={cn('p-4')}>
        <CardContent className={cn('text-sm space-y-2')}>
          <h1 className={cn('text-2xl text-primary font-bold')}>{accountActivityLabel}</h1>
          <div className={cn('border-solid border-2 border-border grid grid-cols-[1fr_max-content]')}>
            <AccountActivityTabs account={account} />
          </div>
        </CardContent>
      </Card>

      <Card className={cn('p-4')}>
        <CardContent className={cn('text-sm space-y-2')}>
          <h1 className={cn('text-2xl text-primary font-bold')}>{accountAssetLabel}</h1>
          <div className={cn('border-solid border-2 border-border grid')}>
            <AccountAssetTabs account={account} />
          </div>
        </CardContent>
      </Card>
      <Card className={cn('p-4')}>
        <CardContent className={cn('text-sm space-y-2')}>
          <h1 className={cn('text-2xl text-primary font-bold')}>{accountApplicationLabel}</h1>
          <div className={cn('border-solid border-2 border-border grid')}>
            <AccountApplicationTabs account={account} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
