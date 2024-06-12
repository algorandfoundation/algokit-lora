import { LatestBlocks } from '@/features/blocks/components/latest-blocks'
import { PageTitle } from '@/features/common/components/page-title'
import { cn } from '@/features/common/utils'
import { LatestTransactions } from '@/features/transactions/components/latest-transactions'

export const explorePageTitle = 'Explore'

export function ExplorePage() {
  return (
    <>
      <PageTitle title={explorePageTitle} />
      <div className={cn('grid grid-cols-2 gap-4')}>
        <LatestBlocks />
        <LatestTransactions />
      </div>
    </>
  )
}
