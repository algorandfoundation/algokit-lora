import { zfd } from 'zod-form-data'
import { z } from 'zod'
import { useCallback } from 'react'
import { Form } from '@/features/forms/components/form'
import { FormActions } from '@/features/forms/components/form-actions'
import { CancelButton } from '@/features/forms/components/cancel-button'
import { SubmitButton } from '@/features/forms/components/submit-button'
import { toast } from 'react-toastify'
import { AlgoAppSpec as Arc32AppSpec } from '@/features/abi-methods/data/types/arc-32/application'

const newContractFormSchema = zfd.formData({
  file: z.instanceof(File, { message: 'Required' }).refine((file) => file.type === 'application/json', 'Only JSON files are allowed'),
  contractName: zfd.text(),
  appId: zfd.numeric(),
})

type Props = {
  appSpecFile: File
  appSpec: Arc32AppSpec
  onSuccess: () => void
}

export function NewContractForm({ appSpecFile, appSpec, onSuccess }: Props) {
  // const setAppSpec = useSetAppSpec(application.id)

  const save = useCallback(async (values: z.infer<typeof newContractFormSchema>) => {
    // const content = await readFile(values.file)
    // await setAppSpec({
    //   standard: 'ARC-32',
    //   json: JSON.parse(content as string),
    //   roundFirstValid: undefined,
    //   roundLastValid: undefined,
    // })
    toast.success('ARC32 app spec saved successfully')
  }, [])

  return (
    <Form
      schema={newContractFormSchema}
      onSubmit={save}
      onSuccess={onSuccess}
      defaultValues={{
        file: appSpecFile,
        contractName: appSpec.contract.name,
      }}
      formAction={
        <FormActions>
          <CancelButton onClick={onSuccess} className="w-28" />
          <SubmitButton className="w-28">Create</SubmitButton>
        </FormActions>
      }
    >
      {(helper) => (
        <>
          {helper.readonlyFileField({
            field: 'file',
            label: 'File name',
          })}
          {helper.textField({
            field: 'contractName',
            label: 'Contract Name',
          })}
          {helper.numberField({
            field: 'appId',
            label: 'App ID',
          })}
        </>
      )}
    </Form>
  )
}
