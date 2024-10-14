import { useCreateAppInterfaceStateMachine } from '@/features/app-interfaces/data/create-app-interface'
import { Button } from '@/features/common/components/button'
import { Label } from '@/features/common/components/label'
import { cn, isArc32AppSpec } from '@/features/common/utils'
import { Fieldset } from '@/features/forms/components/fieldset'
import { Form } from '@/features/forms/components/form'
import { FormActions } from '@/features/forms/components/form-actions'
import { FormFieldHelper } from '@/features/forms/components/form-field-helper'
import { SubmitButton } from '@/features/forms/components/submit-button'
import { base64ToBytes } from '@/utils/base64-to-bytes'
import { base64ToUtf8 } from '@/utils/base64-to-utf8'
import { invariant } from '@/utils/invariant'
import { AppManager } from '@algorandfoundation/algokit-utils/types/app-manager'
import { ArrowLeft } from 'lucide-react'
import { useCallback, useMemo } from 'react'
import { useFormContext } from 'react-hook-form'
import { z } from 'zod'
import { zfd } from 'zod-form-data'

export const UPDATABLE_TEMPLATE_VAR_NAME = 'UPDATABLE'
export const DELETABLE_TEMPLATE_VAR_NAME = 'DELETABLE'

enum TemplateParamType {
  String = 'String',
  Number = 'Number',
  Uint8Array = 'Uint8Array',
}

const templateParamSchema = z.object({
  type: z.nativeEnum(TemplateParamType),
  value: zfd.text(),
})
const schema = zfd.formData({
  name: zfd.text(),
  version: zfd.text(),
  updatable: z.boolean().optional(),
  deletable: z.boolean().optional(),
  templateParams: z.array(templateParamSchema),
})

type DeployAppFormData = z.infer<typeof schema>
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

type Props = {
  machine: ReturnType<typeof useCreateAppInterfaceStateMachine>
}

export function WIPDeploymentDetails({ machine }: Props) {
  const [state, send] = machine
  invariant(state.context.appSpec && isArc32AppSpec(state.context.appSpec), 'ARC32 app spec is required')

  const appSpec = state.context.appSpec
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

  const next = useCallback(
    (values: z.infer<typeof schema>) => {
      send({
        type: 'detailsCompleted',
        name: values.name,
        version: values.version,
        updatable: values.updatable,
        deletable: values.deletable,
        templateParams: getTealTemplateParams(unifiedTemplateParamNames, values),
      })
    },
    [send, unifiedTemplateParamNames]
  )

  const back = useCallback(() => {
    send({ type: 'detailsCancelled' })
  }, [send])

  const defaultValues = useMemo(
    () => ({
      name: state.context.name ?? appSpec.contract.name,
      version: state.context.version ?? '1.0',
      // TODO: NC - Set the previous values
      templateParams: unifiedTemplateParamNames.map(() => ({ type: TemplateParamType.String })),
      updatable: enableDeployTimeUpdatabilityControl ? false : undefined,
      deletable: enableDeployTimeDeletabilityControl ? false : undefined,
    }),
    [
      appSpec.contract.name,
      enableDeployTimeDeletabilityControl,
      enableDeployTimeUpdatabilityControl,
      state.context.name,
      state.context.version,
      unifiedTemplateParamNames,
    ]
  )

  return (
    <Form
      className="duration-300 animate-in fade-in-20"
      schema={schema}
      onSubmit={next}
      defaultValues={defaultValues}
      formAction={
        <FormActions>
          <Button type="button" variant="outline" className="mr-auto w-24" onClick={back} icon={<ArrowLeft size={16} />}>
            Back
          </Button>
          <SubmitButton className="w-24">Next</SubmitButton>
        </FormActions>
      }
    >
      {(helper) => (
        <>
          {helper.textField({
            field: 'name',
            label: 'Name',
            helpText: 'Name of the app interface',
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
  )
}

type TemplateParamFormProps = {
  className?: string
  name: string
  index: number
}

function TemplateParamForm({ className, name, index }: TemplateParamFormProps) {
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
