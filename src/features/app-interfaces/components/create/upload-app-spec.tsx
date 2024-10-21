import { useCallback, useMemo } from 'react'
import { z } from 'zod'
import { Form } from '@/features/forms/components/form'
import { zfd } from 'zod-form-data'
import { AppSpecStandard, Arc32AppSpec, Arc4AppSpec } from '@/features/app-interfaces/data/types'
import { readFile } from '@/utils/read-file'
import { jsonAsArc32AppSpec, jsonAsArc4AppSpec } from '@/features/abi-methods/mappers'
import { useCreateAppInterfaceStateMachine } from '@/features/app-interfaces/data'
import { FormActions } from '@/features/forms/components/form-actions'
import { SubmitButton } from '@/features/forms/components/submit-button'
import { Button } from '@/features/common/components/button'
import { ArrowLeft } from 'lucide-react'

const selectAppSpecFormSchema = zfd.formData({
  file: z.instanceof(File, { message: 'Required' }).refine((file) => file.type === 'application/json', 'Only JSON files are allowed'),
})

type Props = {
  machine: ReturnType<typeof useCreateAppInterfaceStateMachine>
  supportedStandards: AppSpecStandard[]
}

export function UploadAppSpec({ machine, supportedStandards }: Props) {
  const [state, send] = machine

  const uploadPlaceholder = useMemo(() => {
    return `Select an ${supportedStandards.join(' or ')} JSON app spec file`
  }, [supportedStandards])

  const next = useCallback(
    async (values: z.infer<typeof selectAppSpecFormSchema>) => {
      const appSpec = await parseAsAppSpec(values.file, supportedStandards)
      send({
        type: 'appSpecUploadCompleted',
        file: values.file,
        appSpec,
      })
    },
    [send, supportedStandards]
  )

  const back = useCallback(() => {
    send({ type: 'appSpecUploadCancelled' })
  }, [send])

  return (
    <Form
      className="duration-300 animate-in fade-in-20"
      schema={selectAppSpecFormSchema}
      defaultValues={{ file: state.context.file }}
      onSubmit={next}
      formAction={
        <FormActions>
          <Button type="button" variant="outline" className="mr-auto w-24" onClick={back} icon={<ArrowLeft size={16} />}>
            Back
          </Button>
          <SubmitButton className="w-24">Next</SubmitButton>
        </FormActions>
      }
    >
      {(helper) =>
        helper.fileField({
          accept: 'application/json',
          label: 'JSON app spec file',
          field: 'file',
          placeholder: uploadPlaceholder,
        })
      }
    </Form>
  )
}

const parseAsAppSpec = async (file: File, supportedStandards: AppSpecStandard[]): Promise<Arc32AppSpec | Arc4AppSpec> => {
  try {
    const content = await readFile(file)
    const jsonData = JSON.parse(content as string)

    if (supportedStandards.includes(AppSpecStandard.ARC32) && 'contract' in jsonData) {
      return jsonAsArc32AppSpec(jsonData)
    } else if (supportedStandards.includes(AppSpecStandard.ARC4)) {
      return jsonAsArc4AppSpec(jsonData)
    }

    throw new Error('Not supported')
  } catch (e) {
    throw new Error(`The file is not a valid ${supportedStandards.join(' or ')} app spec`)
  }
}
