import { useEffect } from 'react'
import { z } from 'zod'
import { Form } from '@/features/forms/components/form'
import { zfd } from 'zod-form-data'
import { useFormContext } from 'react-hook-form'
import { asError } from '@/utils/error'
import { AlgoAppSpec as Arc32AppSpec } from '@/features/abi-methods/data/types/arc-32/application'
import { readFile } from '@/utils/read-file'
import { jsonAsArc32AppSpec } from '@/features/abi-methods/mappers'
import { FormFieldHelper } from '@/features/forms/components/form-field-helper'

const uploadAppSpecFormSchema = zfd.formData({
  file: z.instanceof(File, { message: 'Required' }).refine((file) => file.type === 'application/json', 'Only JSON files are allowed'),
})

type UploadAppSpecFormProps = {
  onFileSelected: (file: File, appSpec: Arc32AppSpec) => void
}

export function UploadAppSpecForm({ onFileSelected }: UploadAppSpecFormProps) {
  return (
    <Form schema={uploadAppSpecFormSchema} onSubmit={() => {}} onSuccess={() => {}} formAction={<></>}>
      {(helper) => <FormInner helper={helper} onFileSelected={onFileSelected} />}
    </Form>
  )
}

type FormInnerProps = {
  helper: FormFieldHelper<z.infer<typeof uploadAppSpecFormSchema>>
  onFileSelected: (file: File, appSpec: Arc32AppSpec) => void
}
function FormInner({ helper, onFileSelected }: FormInnerProps) {
  const { watch, setError } = useFormContext<z.infer<typeof uploadAppSpecFormSchema>>()
  const file = watch('file')

  useEffect(() => {
    if (!file) return
    ;(async () => {
      try {
        const appSpec = await readFileIntoAppSpec(file)

        onFileSelected(file, appSpec)
      } catch (e: unknown) {
        const error = asError(e)
        setError('file', {
          type: 'custom',
          message: error.message,
        })
      }
    })()
  }, [file, onFileSelected, setError])

  return helper.fileField({
    accept: 'application/json',
    label: 'ARC-32 JSON file',
    field: 'file',
    placeholder: 'Select an ARC-32 JSON file',
  })
}

const readFileIntoAppSpec = async (file: File): Promise<Arc32AppSpec> => {
  const content = await readFile(file)
  try {
    return jsonAsArc32AppSpec(JSON.parse(content as string))
  } catch (e) {
    // ignore
  }
  throw new Error('The file is not a valid ARC-32 app spec')
}
