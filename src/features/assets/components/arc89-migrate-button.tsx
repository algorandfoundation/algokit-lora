import { useArc89Migration } from '@/features/assets/data/arc89-migrate'
import { RenderLoadable } from '@/features/common/components/render-loadable'
import { ArrowUpToLine } from 'lucide-react'
import { AsyncActionButton } from '@/features/common/components/button'
import { Asset } from '@/features/assets/models'
import { useCallback, useState } from 'react'
import { Arc89MigrateDialog } from './arc89-migrate-dialog'

const migrateLabel = 'Migrate'

export function Arc89MigrateButton({ asset }: { asset: Asset }) {
  const { canMigrate: canMigrateLoadable, migrate } = useArc89Migration(asset)
  const [dialogOpen, setDialogOpen] = useState(false)

  const handleMigrate = useCallback(async () => {
    await migrate()
    setDialogOpen(false)
  }, [migrate])

  return (
    <RenderLoadable loadable={canMigrateLoadable}>
      {(canMigrate) => {
        if (!canMigrate) return null

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
              open={dialogOpen}
              onOpenChange={setDialogOpen}
              onConfirm={handleMigrate}
            />
          </>
        )
      }}
    </RenderLoadable>
  )
}
