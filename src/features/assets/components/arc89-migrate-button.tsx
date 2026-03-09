import { useArc89Migration } from '@/features/assets/data/arc89-migrate'
import { RenderLoadable } from '@/features/common/components/render-loadable'
import { ArrowUpToLine, Loader2 as Loader } from 'lucide-react'
import { Button, AsyncActionButton } from '@/features/common/components/button'
import { Asset } from '@/features/assets/models'
import { useCallback, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, MediumSizeDialogBody } from '@/features/common/components/dialog'
import { Description } from '@radix-ui/react-dialog'

const migrateLabel = 'Migrate to Registry'
const migrateDialogTitle = 'Migrate Metadata to ARC-89 Registry'

export function Arc89MigrateButton({ asset }: { asset: Asset }) {
  const { status, migrate } = useArc89Migration(asset)
  const [dialogOpen, setDialogOpen] = useState(false)

  const handleMigrate = useCallback(async () => {
    await migrate()
    setDialogOpen(false)
  }, [migrate])

  return (
    <RenderLoadable
      loadable={status}
      fallback={<Button disabled={true} className="w-40" variant="outline-secondary" icon={<Loader className="size-6 animate-spin" />} />}
    >
      {(s) => {
        if (!s.canMigrate) return null

        return (
          <>
            <AsyncActionButton
              className="w-40"
              variant="outline-secondary"
              icon={<ArrowUpToLine size={16} />}
              onClick={() => {
                setDialogOpen(true)
                return Promise.resolve()
              }}
            >
              {migrateLabel}
            </AsyncActionButton>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen} modal={true}>
              {dialogOpen && (
                <DialogContent className="bg-card">
                  <Description hidden={true}>{migrateDialogTitle}</Description>
                  <DialogHeader>
                    <DialogTitle asChild>
                      <h2>{migrateDialogTitle}</h2>
                    </DialogTitle>
                  </DialogHeader>
                  <MediumSizeDialogBody>
                    <div className="space-y-4">
                      <p>
                        This will duplicate the existing metadata for asset <strong>{asset.name ?? asset.id.toString()}</strong> to the
                        on-chain ARC-89 metadata registry.
                      </p>
                      <p className="text-sm text-muted-foreground">
                        The original metadata will remain unchanged. This operation requires a transaction signed by the asset manager
                        and a small MBR deposit.
                      </p>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setDialogOpen(false)}>
                          Cancel
                        </Button>
                        <AsyncActionButton variant="default" onClick={handleMigrate}>
                          Confirm Migration
                        </AsyncActionButton>
                      </div>
                    </div>
                  </MediumSizeDialogBody>
                </DialogContent>
              )}
            </Dialog>
          </>
        )
      }}
    </RenderLoadable>
  )
}
