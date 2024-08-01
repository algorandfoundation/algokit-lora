import { Application } from '@/features/applications/models'
import { useSetAppSpec } from '@/features/abi-methods/data'
import { useCallback } from 'react'
import { z } from 'zod'
import { readFile } from '@/utils/read-file'
import { Form } from '@/features/forms/components/form'
import { FormActions } from '@/features/forms/components/form-actions'
import { CancelButton } from '@/features/forms/components/cancel-button'
import { SubmitButton } from '@/features/forms/components/submit-button'
import { zfd } from 'zod-form-data'

const addAppSpecFormSchema = zfd.formData({
  file: z.instanceof(File, { message: 'Required' }).refine((file) => file.type === 'application/json', 'Only JSON files are allowed'),
})

type UploadAppSpecFormProps = {
  application: Application
  onSuccess: () => void
}

export function UploadAppSpecForm({ application, onSuccess }: UploadAppSpecFormProps) {
  const setAppSpec = useSetAppSpec(application.id, 'ARC-32')

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
