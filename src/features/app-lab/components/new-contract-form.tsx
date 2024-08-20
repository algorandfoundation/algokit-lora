import { zfd } from 'zod-form-data'
import { z } from 'zod'
import { useCallback } from 'react'
import { Form } from '@/features/forms/components/form'
import { FormActions } from '@/features/forms/components/form-actions'
import { CancelButton } from '@/features/forms/components/cancel-button'
import { SubmitButton } from '@/features/forms/components/submit-button'
import { toast } from 'react-toastify'
import { Arc32AppSpec } from '@/features/app-interfaces/data/types'
import { useCreateAppInterface } from '@/features/app-interfaces/data'

const newContractFormSchema = zfd.formData({
  file: z.instanceof(File, { message: 'Required' }).refine((file) => file.type === 'application/json', 'Only JSON files are allowed'),
  contractName: zfd.text(),
  applicationId: zfd.numeric(),
})

type Props = {
  appSpecFile: File
  appSpec: Arc32AppSpec
  onSuccess: () => void
}

export function NewContractForm({ appSpecFile, appSpec, onSuccess }: Props) {
  const setContractEntity = useCreateAppInterface()

  const save = useCallback(
    async (values: z.infer<typeof newContractFormSchema>) => {
      await setContractEntity({
        name: values.contractName,
        standard: 'ARC-32',
        appSpec: appSpec,
        roundFirstValid: undefined,
        roundLastValid: undefined,
        applicationId: values.applicationId,
      })
      toast.success(`Contract ${values.contractName} was saved successfully`)
    },
    [appSpec, setContractEntity]
  )

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
            field: 'applicationId',
            label: 'App ID',
          })}
        </>
      )}
    </Form>
  )
}
