import { Card, CardContent } from '@/features/common/components/card'
import { Account } from '../models'
import { cn } from '@/features/common/utils'
import { AccountActivityTabs } from './account-activity-tabs'
import { AccountInfo } from './account-info'

type Props = {
  account: Account
}

export const activityLabel = 'Activity'
export const accountJsonLabel = 'Acount JSON'

export function AccountDetails({ account }: Props) {
  return (
    <div className={cn('space-y-6 pt-7')}>
      <AccountInfo account={account} />
      <Card aria-label={activityLabel} className={cn('p-4')}>
        <CardContent className={cn('text-sm space-y-2')}>
          <h1 className={cn('text-2xl text-primary font-bold')}>{activityLabel}</h1>
          <div className={cn('border-solid border-2 border-border grid')}>
            <AccountActivityTabs />
          </div>
        </CardContent>
      </Card>
      <Card className={cn('p-4')}>
        <CardContent aria-label={accountJsonLabel} className={cn('text-sm space-y-2')}>
          <h1 className={cn('text-2xl text-primary font-bold')}>{accountJsonLabel}</h1>
          <div className={cn('border-solid border-2 border-border h-96 grid')}>
            <pre className={cn('overflow-scroll p-4')}>{account.json}</pre>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
