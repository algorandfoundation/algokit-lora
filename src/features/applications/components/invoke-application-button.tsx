import { Application } from '@/features/applications/models'
import { Dialog, DialogContent, DialogHeader, MediumSizeDialogBody } from '@/features/common/components/dialog'
import { Button } from '@/features/common/components/button'
import { useCallback, useEffect, useState } from 'react'
import { zfd } from 'zod-form-data'
import { z } from 'zod'
import { Form } from '@/features/forms/components/form'
import { FormActions } from '@/features/forms/components/form-actions'
import { CancelButton } from '@/features/forms/components/cancel-button'
import { SubmitButton } from '@/features/forms/components/submit-button'
import { JsonView as ReactJsonView } from 'react-json-view-lite'
import { useFormContext } from 'react-hook-form'
import { FormFieldHelper } from '@/features/forms/components/form-field-helper'
import { useResolvedTheme } from '@/features/settings/data'
import { JsonViewStylesDark, JsonViewStylesLight } from '@/features/common/components/json-view-styles'
import { cn } from '@/features/common/utils'
import { useSetAppSpec } from '@/features/abi-methods/data'
import { mapJsonToAppSpec } from '@/features/abi-methods/mappers'

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
function InvokeApplicationDialog({ dialogOpen, application, setDialogOpen }: DialogProps) {
  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen} modal={true}>
      {dialogOpen && (
        <DialogContent className="bg-card">
          <DialogHeader className="flex-row items-center space-y-0">
            <h2 className="pb-0">Call App</h2>
          </DialogHeader>
          <MediumSizeDialogBody>
            <Body application={application} onSuccess={() => setDialogOpen(false)} />
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
  application: Application
  onSuccess: () => void
}
function Body({ application, onSuccess }: BodyProps) {
  const setAppSpec = useSetAppSpec(application.id)

  const save = useCallback(
    async (values: z.infer<typeof addAppSpecFormSchema>) => {
      const content = await readFile(values.file)
      setAppSpec(JSON.parse(content as string))
    },
    [setAppSpec]
  )

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
      {(helper) => <FormInner helper={helper} />}
    </Form>
  )
}

function FormInner({ helper }: { helper: FormFieldHelper<z.infer<typeof addAppSpecFormSchema>> }) {
  const { watch } = useFormContext<z.infer<typeof addAppSpecFormSchema>>()
  const [json, setJson] = useState<object | undefined>(undefined)
  const theme = useResolvedTheme()
  const currentStyle = theme === 'dark' ? JsonViewStylesDark : JsonViewStylesLight

  const file = watch('file')
  useEffect(() => {
    ;(async () => {
      if (file) {
        const content = await readFile(file!)
        const arc32AppSpec = mapJsonToAppSpec(JSON.parse(content as string))
        setJson(arc32AppSpec)
      }
    })()
  }, [file])

  // TODO: handle parse error
  // TODO: the preview is a big ugly, think about it
  return (
    <>
      {helper.fileField({
        accept: 'application/json',
        label: 'ARC32 JSON file',
        field: 'file',
        placeholder: 'Select a ARC32 JSON file',
      })}
      {json && (
        <div className={'grid  gap-2'}>
          <label>Preview</label>
          <div className={cn('border grid w-auto min-w-[450px] h-[450px] overflow-auto p-4')}>
            <div className="[&>div>div]:m-0">
              <ReactJsonView data={json} style={currentStyle} />
            </div>
          </div>
        </div>
      )}
    </>
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
