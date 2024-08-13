import { Application } from '@/features/applications/models'
import { Dialog, DialogContent, DialogHeader, MediumSizeDialogBody } from '@/features/common/components/dialog'
import { Button } from '@/features/common/components/button'
import { useState } from 'react'
import { UploadAppSpecForm } from '@/features/applications/components/upload-app-spec-form'

type Props = {
  application: Application
}

export function UploadAppSpecButton({ application }: Props) {
  const [dialogOpen, setDialogOpen] = useState(false)
  return (
    <div className="">
      <Button variant="default" onClick={() => setDialogOpen(true)}>
        Upload App Spec
      </Button>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen} modal={true}>
        {dialogOpen && (
          <DialogContent className="bg-card">
            <DialogHeader className="flex-row items-center space-y-0">
              <h2 className="pb-0">Upload App Spec</h2>
            </DialogHeader>
            <MediumSizeDialogBody>
              <UploadAppSpecForm application={application} onSuccess={() => setDialogOpen(false)} />
            </MediumSizeDialogBody>
          </DialogContent>
        )}
      </Dialog>
    </div>
  )
}
