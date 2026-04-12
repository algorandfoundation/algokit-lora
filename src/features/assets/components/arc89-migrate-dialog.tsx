import { Button, AsyncActionButton } from '@/features/common/components/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, MediumSizeDialogBody } from '@/features/common/components/dialog'
import { Description } from '@radix-ui/react-dialog'

const migrateDialogTitle = 'Migrate to ASA Metadata Registry (ARC-89)'

interface Props {
  assetDisplayName: string
  hasMetadataHash: boolean
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => Promise<void>
}

export function Arc89MigrateDialog({ assetDisplayName, hasMetadataHash, open, onOpenChange, onConfirm }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal={true}>
      {open && (
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
                This will duplicate the existing metadata for asset <strong>{assetDisplayName}</strong> to the on-chain ARC-89 metadata
                registry.
              </p>
              <p className="text-muted-foreground text-sm">
                The original metadata will remain unchanged. This operation requires a transaction signed by the asset manager.
              </p>
              {hasMetadataHash && (
                <p className="text-yellow-500 text-sm font-medium">
                  The existing ASA has a metadata hash, so it will be migrated as immutable.
                </p>
              )}
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <AsyncActionButton variant="default" onClick={onConfirm}>
                  Confirm Migration
                </AsyncActionButton>
              </div>
            </div>
          </MediumSizeDialogBody>
        </DialogContent>
      )}
    </Dialog>
  )
}
