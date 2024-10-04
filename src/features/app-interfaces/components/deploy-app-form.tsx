import { ApplicationId } from '@/features/applications/data/types'
import { Form } from '@/features/forms/components/form'
import { FormActions } from '@/features/forms/components/form-actions'
import { CancelButton } from '@/features/forms/components/cancel-button'
import { SubmitButton } from '@/features/forms/components/submit-button'
import { zfd } from 'zod-form-data'
import { z } from 'zod'
import { useCallback, useMemo } from 'react'
import { algorandClient } from '@/features/common/data/algo-client'
import { Arc32AppSpec } from '../data/types'
import { useWallet } from '@txnlab/use-wallet'
import { invariant } from '@/utils/invariant'
import { base64ToUtf8 } from '@/utils/base64-to-utf8'
import { useCreateAppInterfaceStateMachine } from '@/features/app-interfaces/data'
import { useFormContext } from 'react-hook-form'
import { cn } from '@/features/common/utils'
import { FormFieldHelper } from '@/features/forms/components/form-field-helper'
import { Label } from '@/features/common/components/label'
import { Fieldset } from '@/features/forms/components/fieldset'
import { base64ToBytes } from '@/utils/base64-to-bytes'
import { deployButtonLabel } from '@/features/app-interfaces/components/labels'
import { AppManager } from '@algorandfoundation/algokit-utils/types/app-manager'
import { AppSpec } from '@algorandfoundation/algokit-utils/types/app-spec'

export const UPDATABLE_TEMPLATE_VAR_NAME = 'UPDATABLE'
export const DELETABLE_TEMPLATE_VAR_NAME = 'DELETABLE'

type Props = {
  className?: string
  appSpec: Arc32AppSpec
  appName?: string
}

enum TemplateParamType {
  String = 'String',
  Number = 'Number',
  Uint8Array = 'Uint8Array',
}

const templateParam = z.object({
  type: z.nativeEnum(TemplateParamType),
  value: zfd.text(),
})
const formSchema = zfd.formData({
  name: zfd.text(),
  version: zfd.text(),
  deletable: z.boolean().optional(),
  updatable: z.boolean().optional(),
  templateParams: z.array(templateParam),
})
type DeployAppFormData = z.infer<typeof formSchema>
type TemplateParamFields = DeployAppFormData['templateParams']

const getTemplateParamNames = (base64Program: string): string[] => {
  if (!base64Program) {
    return []
  }
  let tealCode = base64ToUtf8(base64Program)
  tealCode = AppManager.stripTealComments(tealCode)

  const regex = /TMPL_[A-Z_]+/g
  return Array.from(new Set([...tealCode.matchAll(regex)].flat().map((str) => str.substring(5))))
}

const getTealTemplateParams = (names: string[], formData: DeployAppFormData) => {
  return names.reduce(
    (acc, name, index) => {
      const type = formData.templateParams[index].type
      const value = formData.templateParams[index].value
      if (type === TemplateParamType.String) {
        acc[name] = value
      }
      if (type === TemplateParamType.Number) {
        acc[name] = Number(value)
      }
      if (type === TemplateParamType.Uint8Array) {
        acc[name] = base64ToBytes(value)
      }
      return acc
    },
    {} as Record<string, string | number | Uint8Array>
  )
}

export function DeployAppForm({ className, appSpec, appName }: Props) {
  const [_, send] = useCreateAppInterfaceStateMachine()
  const { activeAddress } = useWallet()

  const templateParamNames = useMemo(() => {
    const approvalTemplateParams = getTemplateParamNames(appSpec.source?.approval ?? '')
    const clearTemplateParams = getTemplateParamNames(appSpec.source?.clear ?? '')
    return {
      approval: approvalTemplateParams,
      clear: clearTemplateParams,
    }
  }, [appSpec])
  const unifiedTemplateParamNames = Array.from(new Set([...templateParamNames.approval, ...templateParamNames.clear])).filter(
    (x) => ![UPDATABLE_TEMPLATE_VAR_NAME, DELETABLE_TEMPLATE_VAR_NAME].includes(x)
  )
  const enableDeployTimeUpdatabilityControl = templateParamNames.approval.includes(UPDATABLE_TEMPLATE_VAR_NAME)
  const enableDeployTimeDeletabilityControl = templateParamNames.approval.includes(DELETABLE_TEMPLATE_VAR_NAME)

  const deploy = useCallback(
    async (values: DeployAppFormData) => {
      invariant(appSpec.source?.approval, 'Approval program is not set')
      invariant(appSpec.source?.clear, 'Clear program is not set')
      invariant(activeAddress, 'No active wallet account is available')

      const appFactory = algorandClient.client.getAppFactory({
        appSpec: appSpec as AppSpec, // TODO: PD - convert Arc32AppSpec to AppSpec
        defaultSender: activeAddress,
        appName: values.name,
        version: values.version,
        deletable: values.deletable,
        updatable: values.updatable,
      })

      const { result: deployAppResult } = await appFactory.deploy({
        createParams: {
          schema: {
            localInts: appSpec.state?.local.num_uints ?? 0,
            localByteSlices: appSpec.state?.local.num_byte_slices ?? 0,
            globalInts: appSpec.state?.global.num_uints ?? 0,
            globalByteSlices: appSpec.state?.global.num_byte_slices ?? 0,
          },
        },
        onUpdate: 'fail',
        onSchemaBreak: 'fail',
        deployTimeParams: getTealTemplateParams(unifiedTemplateParamNames, values),
        populateAppCallResources: true,
      })

      return Number(deployAppResult.appId)
    },
    [activeAddress, appSpec, unifiedTemplateParamNames]
  )

  const completeDeployment = useCallback(
    (appId: ApplicationId) => {
      send({ type: 'deployAppCompleted', applicationId: appId })
    },
    [send]
  )

  const onCancel = useCallback(() => {
    send({ type: 'deployAppCancelled' })
  }, [send])

  return (
    <div className="duration-300 animate-in fade-in-20">
      <Form
        schema={formSchema}
        onSubmit={deploy}
        onSuccess={completeDeployment}
        formAction={
          <FormActions>
            <CancelButton onClick={onCancel} className="w-28" />
            <SubmitButton className="w-28">{deployButtonLabel}</SubmitButton>
          </FormActions>
        }
        defaultValues={{
          name: appName,
          version: '1.0',
          templateParams: unifiedTemplateParamNames.map(() => ({ type: TemplateParamType.String })),
          updatable: enableDeployTimeUpdatabilityControl ? false : undefined,
          deletable: enableDeployTimeDeletabilityControl ? false : undefined,
        }}
        className={className}
      >
        {(helper) => (
          <>
            {helper.textField({
              field: 'name',
              label: 'Name',
              helpText: 'Name of the app, which must be unique for the creator account. This is used in the deployment idempotency check',
            })}
            {helper.textField({
              field: 'version',
              label: 'Version',
              helpText: 'Version of the app',
            })}
            {enableDeployTimeUpdatabilityControl &&
              helper.checkboxField({
                field: 'updatable',
                label: 'Updatable',
              })}
            {enableDeployTimeDeletabilityControl &&
              helper.checkboxField({
                field: 'deletable',
                label: 'Deletable',
              })}
            <Fieldset legend="Template Params">
              {unifiedTemplateParamNames.length === 0 && <span className="text-sm">No template params.</span>}
              {unifiedTemplateParamNames.length > 0 &&
                unifiedTemplateParamNames.map((name, index) => <TemplateParamForm key={index} name={name} index={index} />)}
            </Fieldset>
          </>
        )}
      </Form>
    </div>
  )
}

type TemplateParamFormProps = {
  className?: string
  name: string
  index: number
}

export function TemplateParamForm({ className, name, index }: TemplateParamFormProps) {
  const { watch } = useFormContext<DeployAppFormData>()
  const helper = new FormFieldHelper<TemplateParamFields[number]>({ fieldPrefix: `templateParams.${index}` })

  const type = watch(`templateParams.${index}.type`)
  const helpText = useMemo(() => {
    switch (type) {
      case TemplateParamType.String:
        return 'A string value'
      case TemplateParamType.Number:
        return 'A number value'
      case TemplateParamType.Uint8Array:
        return 'A Base64 encoded Uint8Array value'
    }
  }, [type])

  return (
    <div className="space-y-2">
      <Label>{name}</Label>
      <div className={cn('grid gap-2 grid-cols-[200px_1fr]', className)}>
        {helper.selectField({
          field: 'type',
          label: 'Type',
          className: 'content-start',
          options: [
            { value: TemplateParamType.String, label: 'String' },
            { value: TemplateParamType.Number, label: 'Number' },
            { value: TemplateParamType.Uint8Array, label: 'Uint8Array' },
          ],
        })}
        {helper.textField({
          field: 'value',
          label: 'Value',
          className: 'content-start',
          helpText: helpText,
        })}
      </div>
    </div>
  )
}
