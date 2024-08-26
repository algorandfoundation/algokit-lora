import { zfd } from 'zod-form-data'
import { z } from 'zod'
import { useCallback, useEffect, useMemo } from 'react'
import { Form } from '@/features/forms/components/form'
import { FormActions } from '@/features/forms/components/form-actions'
import { CancelButton } from '@/features/forms/components/cancel-button'
import { SubmitButton } from '@/features/forms/components/submit-button'
import { toast } from 'react-toastify'
import { Arc32AppSpec } from '@/features/app-interfaces/data/types'
import { useCreateAppInterface } from '@/features/app-interfaces/data'
import { useActiveWalletAccount } from '@/features/wallet/data/active-wallet-account'
import { Button } from '@/features/common/components/button'
import { FormFieldHelper } from '@/features/forms/components/form-field-helper'
import { useFormContext } from 'react-hook-form'
import { useCreateAppInterfaceStateMachine } from '@/features/app-interfaces/data/state-machine'

export const createAppInterfaceFormSchema = zfd.formData({
  file: z.instanceof(File, { message: 'Required' }).refine((file) => file.type === 'application/json', 'Only JSON files are allowed'),
  name: zfd.text(),
  applicationId: zfd.numeric(),
})

// TODO: I think we need to do something with the default values
type Props = {
  className?: string
  appSpecFile: File
  appSpec: Arc32AppSpec
  onSuccess: () => void
}

export function CreateAppInterfaceForm({ className, appSpecFile, appSpec, onSuccess }: Props) {
  const createAppInterface = useCreateAppInterface()

  const save = useCallback(
    async (values: z.infer<typeof createAppInterfaceFormSchema>) => {
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

  return (
    <Form
      schema={createAppInterfaceFormSchema}
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
      className={className}
    >
      {(helper) => <FormInner helper={helper} />}
    </Form>
  )
}
type FormInnerProps = {
  helper: FormFieldHelper<z.infer<typeof createAppInterfaceFormSchema>>
}

function FormInner({ helper }: FormInnerProps) {
  const [snapshot, send] = useCreateAppInterfaceStateMachine()
  const { setValue, getValues } = useFormContext<z.infer<typeof createAppInterfaceFormSchema>>()
  const activeAccount = useActiveWalletAccount()

  const canDeploy = useMemo(() => {
    const result = activeAccount && activeAccount.algoHolding.amount > 1000
    return Boolean(result)
  }, [activeAccount])

  useEffect(() => {
    if (snapshot.context.name) setValue('name', snapshot.context.name)
    if (snapshot.context.applicationId) setValue('applicationId', snapshot.context.applicationId)
  }, [snapshot.context.name, snapshot.context.applicationId, setValue])

  const foo = useCallback(() => {
    const values = getValues()
    // TODO: these values could be undefined
    send({ type: 'create_new_app_requested', name: values.name, applicationId: values.applicationId })
  }, [getValues, send])

  return (
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
        <Button disabled={!canDeploy} onClick={foo}>
          Deploy App
        </Button>
      </div>
    </>
  )
}
