import { useCallback, useMemo } from 'react'
import { z } from 'zod'
import { Form } from '@/features/forms/components/form'
import { zfd } from 'zod-form-data'
import { AppSpecStandard } from '@/features/app-interfaces/data/types'
import { FormActions } from '@/features/forms/components/form-actions'
import { SubmitButton } from '@/features/forms/components/submit-button'
import { Button } from '@/features/common/components/button'
import { ArrowLeft } from 'lucide-react'
import { parseAsAppSpec } from '../../mappers'
import { Arc56Contract } from '@algorandfoundation/algokit-utils/types/app-arc56'
import { AlgoAppSpec, AbiContract } from '../../data/types/arc-32/application'

const selectAppSpecFormSchema = zfd.formData({
  file: z.instanceof(File, { message: 'Required' }).refine((file) => file.type === 'application/json', 'Only JSON files are allowed'),
})

type Props = {
  supportedStandards: AppSpecStandard[]
  onCompleted: (file: File, appSpec: AlgoAppSpec | AbiContract | Arc56Contract) => void
  onCanceled: () => void
  file?: File
}

export function UploadAppSpec({ supportedStandards, onCompleted, onCanceled, file }: Props) {
  const uploadPlaceholder = useMemo(() => {
    return `Select an ${supportedStandards.join(' or ')} JSON app spec file`
  }, [supportedStandards])

  const next = useCallback(
    async (values: z.infer<typeof selectAppSpecFormSchema>) => {
      const appSpec = await parseAsAppSpec(values.file, supportedStandards)
      onCompleted(values.file, appSpec)
    },
    [onCompleted, supportedStandards]
  )

  const back = useCallback(() => {
    onCanceled()
  }, [onCanceled])

  return (
    <Form
      className="duration-300 animate-in fade-in-20"
      schema={selectAppSpecFormSchema}
      defaultValues={{ file: file }}
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
