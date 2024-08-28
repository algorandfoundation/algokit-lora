import { zfd } from 'zod-form-data'
import { z } from 'zod'
import { useCallback, useMemo } from 'react'
import { Form } from '@/features/forms/components/form'
import { FormActions } from '@/features/forms/components/form-actions'
import { CancelButton } from '@/features/forms/components/cancel-button'
import { SubmitButton } from '@/features/forms/components/submit-button'
import { toast } from 'react-toastify'
import { AppSpecStandard, Arc32AppSpec, Arc4AppSpec } from '@/features/app-interfaces/data/types'
import { useCreateAppInterface } from '@/features/app-interfaces/data'
import { FormFieldHelper } from '@/features/forms/components/form-field-helper'
import { useFormContext, useWatch } from 'react-hook-form'
import { useCreateAppInterfaceStateMachine } from '@/features/app-interfaces/data'
import { useLoadableActiveWalletAccount } from '@/features/wallet/data/active-wallet-account'
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
  appSpec: Arc32AppSpec | Arc4AppSpec
  onSuccess: () => void
}

export function isArc32AppSpec(appSpec: Arc32AppSpec | Arc4AppSpec): appSpec is Arc32AppSpec {
  return (
    appSpec !== null &&
    typeof appSpec === 'object' &&
    'source' in appSpec &&
    'contract' in appSpec &&
    'schema' in appSpec &&
    'state' in appSpec
  )
}

export function isArc4AppSpec(appSpec: Arc32AppSpec | Arc4AppSpec): appSpec is Arc4AppSpec {
  // Check for properties specific to Arc4AppSpec
  return (
    appSpec !== null &&
    typeof appSpec === 'object' &&
    'methods' in appSpec &&
    Array.isArray(appSpec.methods) &&
    appSpec.methods.length > 0 &&
    typeof appSpec.methods[0] === 'object'
  )
}

export function CreateAppInterfaceForm({ appSpecFile, appSpec, onSuccess }: Props) {
  const createAppInterface = useCreateAppInterface()
  const [snapshot] = useCreateAppInterfaceStateMachine()

  const save = useCallback(
    async (values: z.infer<typeof formSchema>) => {
      if (isArc32AppSpec(appSpec)) {
        await createAppInterface({
          applicationId: values.applicationId,
          name: values.name,
          appSpec: appSpec as Arc32AppSpec,
          roundFirstValid: undefined,
          roundLastValid: undefined,
          standard: AppSpecStandard.ARC32,
        })
      } else if (isArc4AppSpec(appSpec)) {
        await createAppInterface({
          applicationId: values.applicationId,
          name: values.name,
          appSpec: appSpec as Arc4AppSpec,
          roundFirstValid: undefined,
          roundLastValid: undefined,
          standard: AppSpecStandard.ARC4,
        })
      } else {
        throw new Error('Invalid appSpec type')
      }

      toast.success(`App interface ${values.name} was saved successfully`)
    },
    [appSpec, createAppInterface]
  )

  const defaultValues = useMemo(
    () => ({
      file: appSpecFile,
      name: isArc32AppSpec(appSpec) && snapshot.context.name ? appSpec.contract.name : isArc4AppSpec(appSpec) ? appSpec.name : '',
      applicationId: snapshot.context.applicationId,
    }),
    [appSpec, appSpecFile, snapshot.context.applicationId, snapshot.context.name]
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

  const activeAccount = useLoadableActiveWalletAccount()
  const hasValidAccount = useMemo(() => {
    return activeAccount.state === 'hasData' && activeAccount.data && activeAccount.data.algoHolding.amount > 1000
  }, [activeAccount])

  const onDeployButtonClick = useCallback(() => {
    const values = getValues()
    send({ type: 'deployAppRequested', name: values.name, applicationId: values.applicationId })
  }, [getValues, send])

  const deployButtonStatus = useMemo(() => {
    if (appId) {
      return {
        disabled: true,
        reason: 'The application ID field is already set',
      }
    }
    if (!hasValidAccount) {
      return {
        disabled: true,
        reason: 'Please connect a wallet with min 0.001 ALGO',
      }
    }
    return {
      disabled: false,
      reason: undefined,
    }
  }, [appId, hasValidAccount])

  const deployButton = useMemo(
    () => (
      <Button
        type="button"
        variant="outline-secondary"
        disabled={deployButtonStatus.disabled}
        className="w-fit "
        aria-label={deployToNetworkLabel}
        onClick={onDeployButtonClick}
      >
        {deployToNetworkLabel}
      </Button>
    ),
    [deployButtonStatus.disabled, onDeployButtonClick]
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
          {!deployButtonStatus.disabled && deployButton}
          {deployButtonStatus.disabled && (
            <Tooltip delayDuration={400}>
              <TooltipTrigger asChild>
                <div tabIndex={0}>{deployButton}</div>
              </TooltipTrigger>
              <TooltipContent>
                <span>{deployButtonStatus.reason}</span>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>
    </>
  )
}
