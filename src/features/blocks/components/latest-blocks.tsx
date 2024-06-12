import { cn } from '@/features/common/utils'
import { BlockLink } from './block-link'
import { Card, CardContent } from '@/features/common/components/card'
import { dateFormatter } from '@/utils/format'
import { useLatestBlockSummaries } from '../data'
import { Box } from 'lucide-react'

export const latestBlocksTitle = 'Latest Blocks'

export function LatestBlocks() {
  const latestBlocks = useLatestBlockSummaries()

  return (
    <Card className={cn('p-4')}>
      <CardContent className={cn('text-sm space-y-2')}>
        <h2>{latestBlocksTitle}</h2>
        <div className={cn('grid grid-cols-1 gap-3')}>
          {latestBlocks.map((block) => (
            <BlockLink key={block.round} round={block.round}>
              <div className="flex border-b px-2 pb-2 text-sm">
                <Box className="text-primary" />
                <div className={cn('mx-2')}>
                  <h3 className={cn('leading-none mb-2')}>{block.round}</h3>
                  <span>{dateFormatter.asLongDateTime(new Date(block.timestamp))}</span>
                </div>
                <span className={cn('ml-auto')}>
                  {block.transactionsSummary.count} transaction{block.transactionsSummary.count === 1 ? '' : 's'}
                </span>
              </div>
            </BlockLink>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
