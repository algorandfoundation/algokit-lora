import { useCallback } from 'react'
import { z } from 'zod'
import { Form } from '@/features/forms/components/form'
import { zfd } from 'zod-form-data'
import { Arc32AppSpec, Arc4AppSpec } from '@/features/app-interfaces/data/types'
import { readFile } from '@/utils/read-file'
import { jsonAsArc32AppSpec, jsonAsArc4AppSpec } from '@/features/abi-methods/mappers'
import { FormFieldHelper } from '@/features/forms/components/form-field-helper'
import { useCreateAppInterfaceStateMachine } from '@/features/app-interfaces/data/create-app-interface'
import { FormActions } from '@/features/forms/components/form-actions'
import { SubmitButton } from '@/features/forms/components/submit-button'
import { Button } from '@/features/common/components/button'

const selectAppSpecFormSchema = zfd.formData({
  file: z.instanceof(File, { message: 'Required' }).refine((file) => file.type === 'application/json', 'Only JSON files are allowed'),
})

type Props = {
  snapshot: ReturnType<typeof useCreateAppInterfaceStateMachine>
}

export function WIPSelectAppSpecForm({ snapshot }: Props) {
  const [_, send] = snapshot
  const parseAppSpec = useCallback(async (values: z.infer<typeof selectAppSpecFormSchema>) => {
    const appSpec = await readFileIntoAppSpec(values.file)
    return {
      file: values.file,
      appSpec,
    }
  }, [])

  const completeUpload = useCallback(
    ({ file, appSpec }: { file: File; appSpec: Arc32AppSpec | Arc4AppSpec }) => {
      send({ type: 'appSpecUploadCompleted', file, appSpec })
    },
    [send]
  )

  const cancelUpload = useCallback(() => {
    send({ type: 'appSpecUploadCancelled' })
  }, [send])

  return (
    <Form
      schema={selectAppSpecFormSchema}
      onSubmit={parseAppSpec}
      onSuccess={completeUpload}
      formAction={
        <FormActions>
          <Button type="button" variant="outline" className="w-28" onClick={cancelUpload}>
            Back
          </Button>
          <SubmitButton className="w-28">Next</SubmitButton>
        </FormActions>
      }
    >
      {(helper) => <FormInner helper={helper} />}
    </Form>
  )
}

type FormInnerProps = {
  helper: FormFieldHelper<z.infer<typeof selectAppSpecFormSchema>>
}
function FormInner({ helper }: FormInnerProps) {
  return helper.fileField({
    accept: 'application/json',
    label: 'JSON app spec file',
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
