import { LatestBlocks } from '@/features/blocks/components/latest-blocks'
import { PageTitle } from '@/features/common/components/page-title'
import { cn } from '@/features/common/utils'
import { LatestTransactions } from '@/features/transactions/components/latest-transactions'
import { Switch } from '@/features/common/components/switch'
import { Label } from '@/features/common/components/label'
import { useLiveExplorer } from '@/features/explore/data/live-explorer'

export const explorePageTitle = 'Explore'

export function ExplorePage() {
  const { showLiveUpdates, setShowLiveUpdates, latestTransactions, latestBlocks } = useLiveExplorer()

  return (
    <>
      <div className="flex gap-2">
        <PageTitle title={explorePageTitle} />
        <div className="ml-auto flex items-center gap-2">
          <Switch id="live-view-enabled" onCheckedChange={(checked) => setShowLiveUpdates(checked)} checked={showLiveUpdates} />
          <Label htmlFor="live-view-enabled" className="cursor-pointer">
            Show live updates
          </Label>
        </div>
      </div>
      <div className={cn('grid grid-cols-1 lg:grid-cols-2 gap-4')}>
        <LatestBlocks latestBlocks={latestBlocks} />
        <LatestTransactions latestTransactions={latestTransactions} />
      </div>
    </>
  )
}
