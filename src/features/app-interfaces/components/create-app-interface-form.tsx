import { zfd } from 'zod-form-data'
import { z } from 'zod'
import { useCallback, useMemo } from 'react'
import { Form } from '@/features/forms/components/form'
import { FormActions } from '@/features/forms/components/form-actions'
import { CancelButton } from '@/features/forms/components/cancel-button'
import { SubmitButton } from '@/features/forms/components/submit-button'
import { toast } from 'react-toastify'
import { Arc32AppSpec } from '@/features/app-interfaces/data/types'
import { useCreateAppInterface } from '@/features/app-interfaces/data'
import { useActiveWalletAccount } from '@/features/wallet/data/active-wallet-account'
import { DeployAppButton } from '@/features/app-interfaces/components/deploy-app-button'
import { ApplicationId } from '@/features/applications/data/types'

const formSchema = zfd.formData({
  file: z.instanceof(File, { message: 'Required' }).refine((file) => file.type === 'application/json', 'Only JSON files are allowed'),
  name: zfd.text(),
  applicationId: zfd.numeric(),
})

type Props = {
  appSpecFile: File
  appSpec: Arc32AppSpec
  onSuccess: () => void
}

export function CreateAppInterfaceForm({ appSpecFile, appSpec, onSuccess }: Props) {
  const createAppInterface = useCreateAppInterface()
  const activeAccount = useActiveWalletAccount()

  const save = useCallback(
    async (values: z.infer<typeof formSchema>) => {
      await createAppInterface({
        name: values.name,
        standard: 'ARC-32',
        appSpec: appSpec,
        roundFirstValid: undefined,
        roundLastValid: undefined,
        applicationId: values.applicationId,
      })
      toast.success(`App interface ${values.name} was saved successfully`)
    },
    [appSpec, createAppInterface]
  )

  const canDeploy = useMemo(() => {
    const result = activeAccount && activeAccount.algoHolding.amount > 1000
    return Boolean(result)
  }, [activeAccount])

  const onAppCreated = useCallback((appId: ApplicationId) => {
    console.log(appId)
  }, [])

  return (
    <Form
      schema={formSchema}
      onSubmit={save}
      onSuccess={onSuccess}
      defaultValues={{
        file: appSpecFile,
        name: appSpec.contract.name,
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
            label: 'App spec',
          })}
          {helper.textField({
            field: 'name',
            label: 'Name',
          })}
          <div className="flex flex-col sm:flex-row sm:items-start sm:gap-4">
            {helper.numberField({
              field: 'applicationId',
              label: 'Application ID',
            })}
            <div className="h-10 content-center sm:mt-[1.375rem]">OR</div>
            <DeployAppButton canDeploy={canDeploy} appSpec={appSpec} onSuccess={onAppCreated} />
          </div>
        </>
      )}
    </Form>
  )
}
