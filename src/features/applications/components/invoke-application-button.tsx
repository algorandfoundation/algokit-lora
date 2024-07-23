import { Application } from '@/features/applications/models'
import { Dialog, DialogContent, DialogHeader, MediumSizeDialogBody } from '@/features/common/components/dialog'
import { Button } from '@/features/common/components/button'
import { useCallback, useState } from 'react'
import { zfd } from 'zod-form-data'
import { z } from 'zod'
import { Form } from '@/features/forms/components/form'
import { FormActions } from '@/features/forms/components/form-actions'
import { CancelButton } from '@/features/forms/components/cancel-button'
import { SubmitButton } from '@/features/forms/components/submit-button'

type Props = {
  application: Application
}

export function InvokeApplicationButton({ application }: Props) {
  const [dialogOpen, setDialogOpen] = useState(false)
  return (
    <>
      <Button variant="default" onClick={() => setDialogOpen(true)}>
        Upload App Spec
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
            <Body onSuccess={() => setDialogOpen(false)} />
          </MediumSizeDialogBody>
        </DialogContent>
      )}
    </Dialog>
  )
}

export const fileSchema = z.instanceof(File, { message: 'Required' })

export const addAppSpecFormSchema = zfd.formData({
  file: fileSchema.refine((file) => file.type === 'application/json', 'Only JSON files are allowed'),
})

type BodyProps = {
  onSuccess: () => void
}
function Body({ onSuccess }: BodyProps) {
  // const [file, setFile] = useState<File | undefined>(undefined)
  // useEffect(() => {
  //   ;(async () => {
  //     if (file) {
  //       const content = await readFile(file!)
  //       console.log(content)
  //     }
  //   })()
  // }, [file])

  const save = useCallback(async (values: z.infer<typeof addAppSpecFormSchema>) => {
    const content = await readFile(values.file)
    console.log(content)
  }, [])

  return (
    <Form
      schema={addAppSpecFormSchema}
      onSubmit={save}
      onSuccess={onSuccess}
      // TODO: default values when edit
      formAction={
        <FormActions>
          <CancelButton onClick={onSuccess} className="w-28" />
          <SubmitButton className="w-28">Save</SubmitButton>
        </FormActions>
      }
    >
      {(helper) => (
        <>
          {helper.fileField({
            accept: 'application/json',
            label: 'ARC32 JSON file',
            field: 'file',
            placeholder: 'Select a ARC32 JSON file',
          })}
        </>
      )}
    </Form>
  )
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
