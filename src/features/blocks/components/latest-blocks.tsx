import { cn } from '@/features/common/utils'
import { BlockLink } from './block-link'
import { Card, CardContent } from '@/features/common/components/card'
import { dateFormatter } from '@/utils/format'
import SvgBlock from '@/features/common/components/icons/block'
import { useLatestBlockSummaries } from '../data'

export const latestBlocksTitle = 'Latest Blocks'

export function LatestBlocks() {
  const latestBlocks = useLatestBlockSummaries()

  return (
    <div className={cn('space-y-6 pt-7')}>
      <Card className={cn('p-4')}>
        <CardContent className={cn('text-sm space-y-2')}>
          <h2 className={cn('text-xl text-primary font-bold')}>{latestBlocksTitle}</h2>
          <div className={cn('grid grid-cols-1 gap-3')}>
            {latestBlocks.map((block) => (
              <BlockLink key={block.round} round={block.round}>
                <Card className={cn('p-4')}>
                  <CardContent className={cn('text-sm flex')}>
                    <SvgBlock className={cn('size-6')} />
                    <div className={cn('mx-2')}>
                      <h3 className={cn('text-xl leading-none font-bold mb-2')}>{block.round}</h3>
                      <span>{dateFormatter.asLongDateTime(new Date(block.timestamp))}</span>
                    </div>
                    <span className={cn('ml-auto')}>
                      {block.transactionsSummary.count} transaction{block.transactionsSummary.count === 1 ? '' : 's'}
                    </span>
                  </CardContent>
                </Card>
              </BlockLink>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
