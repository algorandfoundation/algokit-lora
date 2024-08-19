import { useCallback, useEffect } from 'react'
import { z } from 'zod'
import { Form } from '@/features/forms/components/form'
import { zfd } from 'zod-form-data'
import { useFormContext, useWatch } from 'react-hook-form'
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
  const onSubmit = useCallback(async (values: z.infer<typeof uploadAppSpecFormSchema>) => {
    const appSpec = await readFileIntoAppSpec(values.file)
    return {
      file: values.file,
      appSpec,
    }
  }, [])

  const onSuccess = useCallback(
    ({ file, appSpec }: { file: File; appSpec: Arc32AppSpec }) => {
      onFileSelected(file, appSpec)
    },
    [onFileSelected]
  )

  return (
    <Form schema={uploadAppSpecFormSchema} onSubmit={onSubmit} onSuccess={onSuccess} formAction={<></>}>
      {(helper, handleSubmit) => <FormInner helper={helper} handleSubmit={handleSubmit} />}
    </Form>
  )
}

type FormInnerProps = {
  helper: FormFieldHelper<z.infer<typeof uploadAppSpecFormSchema>>
  handleSubmit: () => Promise<void> | void
}
function FormInner({ helper, handleSubmit }: FormInnerProps) {
  const { control } = useFormContext<z.infer<typeof uploadAppSpecFormSchema>>()
  const file = useWatch({ name: 'file', control })

  useEffect(() => {
    if (!file) return
    handleSubmit()
  }, [file, handleSubmit])

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
