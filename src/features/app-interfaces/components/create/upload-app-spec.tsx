import { useCallback, useMemo } from 'react'
import { z } from 'zod'
import { Form } from '@/features/forms/components/form'
import { zfd } from 'zod-form-data'
import { AppSpecStandard } from '@/features/app-interfaces/data/types'
import { useCreateAppInterfaceStateMachine, useUpdateAppInterfaceStateMachine } from '@/features/app-interfaces/data'
import { FormActions } from '@/features/forms/components/form-actions'
import { SubmitButton } from '@/features/forms/components/submit-button'
import { Button } from '@/features/common/components/button'
import { ArrowLeft } from 'lucide-react'
import { parseAsAppSpec } from '../../mappers'

const selectAppSpecFormSchema = zfd.formData({
  file: z.instanceof(File, { message: 'Required' }).refine((file) => file.type === 'application/json', 'Only JSON files are allowed'),
})

type Props = {
  machine: ReturnType<typeof useCreateAppInterfaceStateMachine> | ReturnType<typeof useUpdateAppInterfaceStateMachine>
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
