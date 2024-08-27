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
import { FormFieldHelper } from '@/features/forms/components/form-field-helper'
import { useFormContext, useWatch } from 'react-hook-form'
import { useCreateAppInterfaceStateMachine } from '@/features/app-interfaces/data'
import { useActiveWalletAccount } from '@/features/wallet/data/active-wallet-account'
import { Button } from '@/features/common/components/button'
import { deployToNetworkLabel } from '@/features/app-interfaces/components/labels'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/features/common/components/tooltip'

const formSchema = zfd.formData({
  file: z.instanceof(File, { message: 'Required' }).refine((file) => file.type === 'application/json', 'Only JSON files are allowed'),
  name: zfd.text(),
  applicationId: zfd.numeric(z.number({ required_error: 'Required', invalid_type_error: 'Required' })),
})

type Props = {
  appSpecFile: File
  appSpec: Arc32AppSpec
  onSuccess: () => void
}

export function CreateAppInterfaceForm({ appSpecFile, appSpec, onSuccess }: Props) {
  const createAppInterface = useCreateAppInterface()
  const [snapshot] = useCreateAppInterfaceStateMachine()

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

  const defaultValues = useMemo(
    () => ({
      file: appSpecFile,
      name: snapshot.context.name ?? appSpec.contract.name,
      applicationId: snapshot.context.applicationId,
    }),
    [appSpec.contract.name, appSpecFile, snapshot.context.applicationId, snapshot.context.name]
  )

  return (
    <div className="duration-300 animate-in fade-in-20">
      <Form
        schema={formSchema}
        onSubmit={save}
        onSuccess={onSuccess}
        defaultValues={defaultValues}
        formAction={
          <FormActions>
            <CancelButton onClick={onSuccess} className="w-28" />
            <SubmitButton className="w-28">Create</SubmitButton>
          </FormActions>
        }
      >
        {(helper) => <FormInner helper={helper} />}
      </Form>
    </div>
  )
}

type FormInnerProps = {
  helper: FormFieldHelper<z.infer<typeof formSchema>>
}

function FormInner({ helper }: FormInnerProps) {
  const [_, send] = useCreateAppInterfaceStateMachine()

  const { getValues, control } = useFormContext<z.infer<typeof formSchema>>()
  const appId = useWatch({ name: 'applicationId', control })

  const activeAccount = useActiveWalletAccount()
  const hasValidAccount = useMemo(() => {
    return activeAccount && activeAccount.algoHolding.amount > 1000
  }, [activeAccount])

  const onDeployButtonClick = useCallback(() => {
    const values = getValues()
    send({ type: 'deployAppRequested', name: values.name, applicationId: values.applicationId })
  }, [getValues, send])

  const { deployButtonDisabled, reason } = useMemo(() => {
    if (!hasValidAccount) {
      return {
        deployButtonDisabled: true,
        reason: 'Please connect a wallet with min 0.001 ALGO',
      }
    }
    if (appId) {
      return {
        deployButtonDisabled: true,
        reason: 'The application ID field is already set',
      }
    }
    return {
      deployButtonDisabled: false,
      reason: undefined,
    }
  }, [appId, hasValidAccount])

  const deployButton = useMemo(
    () => (
      <Button
        type="button"
        variant="outline-secondary"
        disabled={!hasValidAccount || Boolean(appId)}
        className="w-fit "
        aria-label={deployToNetworkLabel}
        onClick={onDeployButtonClick}
      >
        {deployToNetworkLabel}
      </Button>
    ),
    [appId, hasValidAccount, onDeployButtonClick]
  )

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
        <div className="grid sm:mt-[1.375rem]">
          {!deployButtonDisabled && deployButton}
          {deployButtonDisabled && (
            <Tooltip delayDuration={400}>
              <TooltipTrigger asChild>
                <div tabIndex={0}>{deployButton}</div>
              </TooltipTrigger>
              <TooltipContent>
                <span>{reason}</span>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>
    </>
  )
}
