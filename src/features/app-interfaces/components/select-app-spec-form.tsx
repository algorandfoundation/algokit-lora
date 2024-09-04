import { useCallback, useEffect } from 'react'
import { z } from 'zod'
import { Form } from '@/features/forms/components/form'
import { zfd } from 'zod-form-data'
import { useFormContext, useWatch } from 'react-hook-form'
import { Arc32AppSpec, Arc4AppSpec } from '@/features/app-interfaces/data/types'
import { readFile } from '@/utils/read-file'
import { jsonAsArc32AppSpec, jsonAsArc4AppSpec } from '@/features/abi-methods/mappers'
import { FormFieldHelper } from '@/features/forms/components/form-field-helper'
import { useCreateAppInterfaceStateMachine } from '@/features/app-interfaces/data'
import { appSpecFileInputLabel } from '@/features/app-interfaces/components/labels'

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
    ({ file, appSpec }: { file: File; appSpec: Arc32AppSpec | Arc4AppSpec }) => {
      send({ type: 'fileSelected', file, appSpec })
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
    label: appSpecFileInputLabel,
    field: 'file',
    placeholder: 'Select an ARC-32 or ARC-4 JSON app spec file',
  })
}

const readFileIntoAppSpec = async (file: File): Promise<Arc32AppSpec | Arc4AppSpec> => {
  const content = await readFile(file)
  try {
    const jsonData = JSON.parse(content as string)
    if ('contract' in jsonData) {
      return jsonAsArc32AppSpec(jsonData)
    } else {
      return jsonAsArc4AppSpec(jsonData)
    }
  } catch (e) {
    throw new Error('The file is not a valid ARC-32 or ARC-4 app spec')
  }
}
