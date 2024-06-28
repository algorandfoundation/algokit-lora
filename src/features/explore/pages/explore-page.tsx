import { LatestBlocks } from '@/features/blocks/components/latest-blocks'
import { PageTitle } from '@/features/common/components/page-title'
import { cn } from '@/features/common/utils'
import { LatestTransactions } from '@/features/transactions/components/latest-transactions'
import { useAtom } from 'jotai'
import { showLiveUpdatesAtom } from '@/features/common/data'
import { Switch } from '@/features/common/components/switch'
import { Label } from '@/features/common/components/label'

export const explorePageTitle = 'Explore'

export function ExplorePage() {
  const [showLiveUpdates, setShowLiveUpdates] = useAtom(showLiveUpdatesAtom)

  return (
    <>
      <div className="flex justify-between">
        <PageTitle title={explorePageTitle} />
        <div className="flex items-center space-x-2">
          <Switch id="live-view-enabled" onCheckedChange={(checked) => setShowLiveUpdates(checked)} checked={showLiveUpdates} />
          <Label htmlFor="live-view-enabled" className="cursor-pointer">
            Show live updates
          </Label>
        </div>
      </div>
      <div className={cn('grid grid-cols-1 lg:grid-cols-2 gap-4')}>
        <LatestBlocks />
        <LatestTransactions />
      </div>
    </>
  )
}
