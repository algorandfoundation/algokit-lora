import { useCallback, useEffect } from 'react'
import { z } from 'zod'
import { Form } from '@/features/forms/components/form'
import { zfd } from 'zod-form-data'
import { useFormContext, useWatch } from 'react-hook-form'
import { Arc32AppSpec } from '@/features/app-interfaces/data/types'
import { readFile } from '@/utils/read-file'
import { jsonAsArc32AppSpec } from '@/features/abi-methods/mappers'
import { FormFieldHelper } from '@/features/forms/components/form-field-helper'
import { useCreateAppInterfaceStateMachine } from '@/features/app-interfaces/data/state-machine'

const selectAppSpecFormSchema = zfd.formData({
  file: z.instanceof(File, { message: 'Required' }).refine((file) => file.type === 'application/json', 'Only JSON files are allowed'),
})

export function SelectAppSpecForm() {
  const [_, send] = useCreateAppInterfaceStateMachine()

  const onSubmit = useCallback(async (values: z.infer<typeof selectAppSpecFormSchema>) => {
    const appSpec = await readFileIntoAppSpec(values.file)
    return {
      file: values.file,
      appSpec,
    }
  }, [])

  const onSuccess = useCallback(
    ({ file, appSpec }: { file: File; appSpec: Arc32AppSpec }) => {
      send({ type: 'file_selected', file, appSpec })
    },
    [send]
  )

  return (
    <Form schema={selectAppSpecFormSchema} onSubmit={onSubmit} onSuccess={onSuccess} formAction={<></>}>
      {(helper, handleSubmit) => <FormInner helper={helper} handleSubmit={handleSubmit} />}
    </Form>
  )
}

type FormInnerProps = {
  helper: FormFieldHelper<z.infer<typeof selectAppSpecFormSchema>>
  handleSubmit: () => Promise<void> | void
}
function FormInner({ helper, handleSubmit }: FormInnerProps) {
  const { control } = useFormContext<z.infer<typeof selectAppSpecFormSchema>>()
  const file = useWatch({ name: 'file', control })

  useEffect(() => {
    if (!file) return
    handleSubmit()
  }, [file, handleSubmit])

  return helper.fileField({
    accept: 'application/json',
    label: 'JSON app spec file',
    field: 'file',
    placeholder: 'Select an ARC-32 JSON app spec file',
  })
}

const readFileIntoAppSpec = async (file: File): Promise<Arc32AppSpec> => {
  const content = await readFile(file)
  try {
    return jsonAsArc32AppSpec(JSON.parse(content as string))
  } catch (e) {
    throw new Error('The file is not a valid ARC-32 app spec')
  }
}
