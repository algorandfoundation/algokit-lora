import { LatestBlocks } from '@/features/blocks/components/latest-blocks'
import { cn } from '@/features/common/utils'
import { LatestTransactions } from '@/features/transactions/components/latest-transactions'

export const indexPageTitle = 'Home'

export function IndexPage() {
  return (
    <div>
      <h1 className={cn('text-2xl text-primary font-bold')}>{indexPageTitle}</h1>
      <div className={cn('grid grid-cols-2 gap-4')}>
        <LatestBlocks />
        <LatestTransactions />
      </div>
    </div>
  )
}
