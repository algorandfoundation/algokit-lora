import { Card, CardContent } from '@/features/common/components/card'
import { Group } from '../models'
import { cn } from '@/features/common/utils'
import { DescriptionList } from '@/features/common/components/description-list'
import { useMemo } from 'react'
import { Badge } from '@/features/common/components/badge'
import { BlockLink } from '@/features/blocks/components/block-link'
import { GroupTransactionsViewTabs } from './group-transactions-view-tabs'
import { DateFormatted } from '@/features/common/components/date-formatted'

type Props = {
  group: Group
}

export const groupIdLabel = 'Group ID'
export const blockLabel = 'Block'
export const transactionsLabel = 'Transactions'
export const timestampLabel = 'Timestamp'

export function GroupDetails({ group }: Props) {
  const groupItems = useMemo(
    () => [
      {
        dt: groupIdLabel,
        dd: group.id,
      },
      {
        dt: blockLabel,
        dd: <BlockLink round={group.round} />,
      },
      {
        dt: transactionsLabel,
        dd: (
          <div className="flex items-center gap-2">
            <span>{group.transactionsSummary.count}</span>
            {group.transactionsSummary.countByType.map(([type, count]) => (
              <Badge key={type} variant={type}>
                {type}={count}
              </Badge>
            ))}
          </div>
        ),
      },
      {
        dt: timestampLabel,
        dd: <DateFormatted date={new Date(group.timestamp)} />,
      },
    ],
    [group.id, group.round, group.timestamp, group.transactionsSummary.count, group.transactionsSummary.countByType]
  )

  return (
    <div className={cn('space-y-4')}>
      <Card className={cn('p-4')}>
        <CardContent className={cn('text-sm space-y-2')}>
          <DescriptionList items={groupItems} />
        </CardContent>
      </Card>
      <Card className={cn('p-4')}>
        <CardContent className={cn('text-sm space-y-2')}>
          <h2>{transactionsLabel}</h2>
          <GroupTransactionsViewTabs group={group} />
        </CardContent>
      </Card>
    </div>
  )
}
