import { Card, CardContent } from '@/features/common/components/card'
import { Group } from '../models'
import { cn } from '@/features/common/utils'
import { DescriptionList } from '@/features/common/components/description-list'
import { useMemo } from 'react'
import { Badge } from '@/features/common/components/badge'
import { dateFormatter } from '@/utils/format'
import { BlockLink } from '@/features/blocks/components/block-link'
import { GroupViewVisual } from './group-view-visual'

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
          <>
            {group.transactionsSummary.count}
            {group.transactionsSummary.countByType.map(([type, count]) => (
              <Badge key={type} variant="outline">
                {type}={count}
              </Badge>
            ))}
          </>
        ),
      },
      {
        dt: timestampLabel,
        dd: dateFormatter.asLongDateTime(new Date(group.timestamp)),
      },
    ],
    [group.id, group.round, group.timestamp, group.transactionsSummary.count, group.transactionsSummary.countByType]
  )

  return (
    <div className={cn('space-y-6 pt-7')}>
      <Card className={cn('p-4')}>
        <CardContent className={cn('text-sm space-y-2')}>
          <DescriptionList items={groupItems} />
        </CardContent>
      </Card>
      <Card className={cn('p-4')}>
        <CardContent className={cn('text-sm space-y-2')}>
          <h1 className={cn('text-2xl text-primary font-bold')}>{transactionsLabel}</h1>
        </CardContent>
        <GroupViewVisual group={group} />
      </Card>
    </div>
  )
}
