import { useArc89Migration } from '@/features/assets/data/arc89-migrate'
import { ArrowUpToLine } from 'lucide-react'
import { AsyncActionButton } from '@/features/common/components/button'
import { Asset } from '@/features/assets/models'
import { useCallback, useState } from 'react'
import { Arc89MigrateDialog } from './arc89-migrate-dialog'

const migrateLabel = 'Migrate'

export function Arc89MigrateButton({ asset }: { asset: Asset }) {
  const { migrate } = useArc89Migration(asset)
  const [dialogOpen, setDialogOpen] = useState(false)

  const handleMigrate = useCallback(async () => {
    await migrate()
    setDialogOpen(false)
  }, [migrate])

  return (
    <>
      <AsyncActionButton
        className="w-32"
        variant="outline-secondary"
        icon={<ArrowUpToLine size={16} />}
        onClick={() => {
          setDialogOpen(true)
          return Promise.resolve()
        }}
      >
        {migrateLabel}
      </AsyncActionButton>

      <Arc89MigrateDialog
        assetDisplayName={asset.name ?? asset.id.toString()}
        hasMetadataHash={asset.hasMetadataHash}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onConfirm={handleMigrate}
      />
    </>
  )
}
