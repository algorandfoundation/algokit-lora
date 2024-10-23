import { useCreateAppInterfaceStateMachine } from '@/features/app-interfaces/data'
import { Button } from '@/features/common/components/button'
import { Label } from '@/features/common/components/label'
import { cn, isArc32AppSpec } from '@/features/common/utils'
import { Fieldset } from '@/features/forms/components/fieldset'
import { Form } from '@/features/forms/components/form'
import { FormActions } from '@/features/forms/components/form-actions'
import { FormFieldHelper } from '@/features/forms/components/form-field-helper'
import { SubmitButton } from '@/features/forms/components/submit-button'
import { base64ToUtf8 } from '@/utils/base64-to-utf8'
import { invariant } from '@/utils/invariant'
import { AppManager } from '@algorandfoundation/algokit-utils/types/app-manager'
import { ArrowLeft } from 'lucide-react'
import { useCallback, useEffect, useMemo } from 'react'
import { useFormContext } from 'react-hook-form'
import { useDebounce } from 'use-debounce'
import { z } from 'zod'
import { zfd } from 'zod-form-data'
import { useLoadableAppInterfacesAtom } from '../../data'
import { TemplateParamType } from '../../data/types'

export const UPDATABLE_TEMPLATE_VAR_NAME = 'UPDATABLE'
export const DELETABLE_TEMPLATE_VAR_NAME = 'DELETABLE'

const templateParamSchema = z.object({
  type: z.nativeEnum(TemplateParamType),
  value: zfd.text(),
})
const schema = zfd.formData(
  z
    .object({
      name: zfd.text(),
      appInterfaceExists: z.boolean().optional(),
      version: zfd.text(),
      updatable: z.boolean().optional(),
      deletable: z.boolean().optional(),
      templateParams: z.array(templateParamSchema),
    })
    .superRefine((schema, ctx) => {
      if (schema.appInterfaceExists === true) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'App interface with this name already exists',
          path: ['name'],
        })
      }
    })
)

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

type FormInnerProps = {
  enableDeployTimeUpdatabilityControl: boolean
  enableDeployTimeDeletabilityControl: boolean
  unifiedTemplateParamNames: string[]
  helper: FormFieldHelper<z.infer<typeof schema>>
}

function FormInner({
  enableDeployTimeUpdatabilityControl,
  enableDeployTimeDeletabilityControl,
  unifiedTemplateParamNames,
  helper,
}: FormInnerProps) {
  const formCtx = useFormContext<z.infer<typeof schema>>()
  const { setValue, trigger } = formCtx
  const loadableAppInterfaces = useLoadableAppInterfacesAtom()
  const appInterfaceNameFieldValue = formCtx.watch('name')
  const [appInterfaceName] = useDebounce(appInterfaceNameFieldValue, 500)

  useEffect(() => {
    if (loadableAppInterfaces.state === 'hasData') {
      const appInterfaceExists = loadableAppInterfaces.data.some(
        (appInterface) => appInterface.name.toLowerCase() === appInterfaceName.toLowerCase()
      )
      setValue('appInterfaceExists', appInterfaceExists)
      trigger()
    }
  }, [appInterfaceName, loadableAppInterfaces, setValue, trigger])

  return (
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
  )
}

type Props = {
  machine: ReturnType<typeof useCreateAppInterfaceStateMachine>
}

export function DeploymentDetails({ machine }: Props) {
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
        templateParams: unifiedTemplateParamNames.map((name, index) => {
          const type = values.templateParams[index].type
          const value = values.templateParams[index].value
          return {
            name,
            type,
            value,
          }
        }),
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
      updatable: state.context.updatable !== undefined ? state.context.updatable : enableDeployTimeUpdatabilityControl ? false : undefined,
      deletable: state.context.deletable !== undefined ? state.context.deletable : enableDeployTimeDeletabilityControl ? false : undefined,
      templateParams: state.context.templateParams ?? unifiedTemplateParamNames.map(() => ({ type: TemplateParamType.String })),
    }),
    [
      appSpec.contract.name,
      enableDeployTimeDeletabilityControl,
      enableDeployTimeUpdatabilityControl,
      state.context.deletable,
      state.context.name,
      state.context.templateParams,
      state.context.updatable,
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
        <FormInner
          enableDeployTimeUpdatabilityControl={enableDeployTimeUpdatabilityControl}
          enableDeployTimeDeletabilityControl={enableDeployTimeDeletabilityControl}
          unifiedTemplateParamNames={unifiedTemplateParamNames}
          helper={helper}
        />
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
