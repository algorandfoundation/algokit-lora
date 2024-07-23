import { Application } from '@/features/applications/models'
import { Dialog, DialogContent, DialogHeader, MediumSizeDialogBody } from '@/features/common/components/dialog'
import { Button } from '@/features/common/components/button'
import { useEffect, useState } from 'react'
import { FileField } from '@/features/forms/components/file-field'

type Props = {
  application: Application
}

export function InvokeApplicationButton({ application }: Props) {
  const [dialogOpen, setDialogOpen] = useState(false)
  return (
    <>
      <Button variant="default" onClick={() => setDialogOpen(true)}>
        Call Application
      </Button>
      <InvokeApplicationDialog dialogOpen={dialogOpen} application={application} setDialogOpen={setDialogOpen} />
    </>
  )
}

type DialogProps = {
  dialogOpen: boolean
  application: Application
  setDialogOpen: (open: boolean) => void
}
function InvokeApplicationDialog({ dialogOpen, setDialogOpen }: DialogProps) {
  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen} modal={true}>
      {dialogOpen && (
        <DialogContent className="bg-card">
          <DialogHeader className="flex-row items-center space-y-0">
            <h2 className="pb-0">Call App</h2>
          </DialogHeader>
          <MediumSizeDialogBody>
            <Body />
          </MediumSizeDialogBody>
        </DialogContent>
      )}
    </Dialog>
  )
}

function Body() {
  const [file, setFile] = useState<File | undefined>(undefined)
  useEffect(() => {
    ;(async () => {
      if (file) {
        const content = await readFile(file!)
        console.log(content)
      }
    })()
  }, [file])

  return <FileField value={file} onChange={setFile} accept="application/json" placeholder="Select a ARC32 JSON file" />
}

const readFile = async (file: File) => {
  const reader = new FileReader()
  return new Promise((resolve, reject) => {
    reader.onload = () => {
      resolve(reader.result)
    }
    reader.onerror = (error) => {
      reject(error)
    }
    reader.readAsText(file)
  })
}
