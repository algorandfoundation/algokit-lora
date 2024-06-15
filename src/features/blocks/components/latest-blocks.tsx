import { cn } from '@/features/common/utils'
import { BlockLink } from './block-link'
import { Card, CardContent } from '@/features/common/components/card'
import { useLatestBlockSummaries } from '../data'
import { Box } from 'lucide-react'
import { DateFormatted } from '@/features/common/components/date-formatted'

export const latestBlocksTitle = 'Latest Blocks'

export function LatestBlocks() {
  const latestBlocks = useLatestBlockSummaries()

  return (
    <Card className={cn('p-4')}>
      <CardContent className={cn('text-sm')}>
        <h2>{latestBlocksTitle}</h2>
        <ul>
          {latestBlocks.map((block) => (
            <li key={block.round} className="border-b last:border-0">
              <BlockLink round={block.round} className="flex p-3.5 text-sm hover:bg-accent">
                <Box className="hidden text-primary sm:max-lg:block xl:block" />
                <div className={cn('mx-2')}>
                  <h3 className={cn('leading-none mb-2')}>{block.round}</h3>
                  <DateFormatted className="truncate" date={new Date(block.timestamp)} />
                </div>
                <span className={cn('ml-auto tracking-tight truncate')}>
                  {block.transactionsSummary.count} transaction{block.transactionsSummary.count === 1 ? '' : 's'}
                </span>
              </BlockLink>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
