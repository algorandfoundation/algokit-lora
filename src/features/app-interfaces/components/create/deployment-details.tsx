import { useCreateAppInterfaceStateMachine } from '@/features/app-interfaces/data'
import { Button } from '@/features/common/components/button'
import { isArc32AppSpec, isArc56AppSpec } from '@/features/common/utils'
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
import { asArc56AppSpec } from '@/features/applications/mappers'
import { TealAVMTypeTemplateParamFieldValue, TealTemplateParamField, TealUnknownTypeTemplateParamFieldValue } from '../../models'
import { asTealTemplateParamField } from '@/features/app-interfaces/mappers'
import { getTemplateParamDefinition } from '../../utils/get-template-param-field-definition'
import { ABITypeTemplateParam, TemplateParamType, UnknownTypeTemplateParam } from '../../data/types'
import { FormItemValue } from '@/features/abi-methods/models'

export const UPDATABLE_TEMPLATE_VAR_NAME = 'UPDATABLE'
export const DELETABLE_TEMPLATE_VAR_NAME = 'DELETABLE'

const getTemplateParamNames = (base64Program: string): string[] => {
  if (!base64Program) {
    return []
  }
  let tealCode = base64ToUtf8(base64Program)
  tealCode = AppManager.stripTealComments(tealCode)

  const regex = /TMPL_[A-Za-z_0-9]+/g
  return Array.from(new Set([...tealCode.matchAll(regex)].flat().map((str) => str.substring(5))))
}

const baseShape = {
  name: zfd.text(),
  appInterfaceExists: z.boolean().optional(),
  version: zfd.text(),
  updatable: z.boolean().optional(),
  deletable: z.boolean().optional(),
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const baseFormSchema = zfd.formData(baseShape)

type FormInnerProps = {
  enableDeployTimeUpdatabilityControl: boolean
  enableDeployTimeDeletabilityControl: boolean
  templateParamFields: TealTemplateParamField[]
  helper: FormFieldHelper<z.infer<typeof baseFormSchema>>
}

function FormInner({
  enableDeployTimeUpdatabilityControl,
  enableDeployTimeDeletabilityControl,
  templateParamFields,
  helper,
}: FormInnerProps) {
  const formCtx = useFormContext<z.infer<typeof baseFormSchema>>()
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
        {templateParamFields.length === 0 && <span className="text-sm">No template params.</span>}
        {templateParamFields.length > 0 && templateParamFields.map((field) => <div key={field.path}>{field.createField(helper)}</div>)}
      </Fieldset>
    </>
  )
}

type Props = {
  machine: ReturnType<typeof useCreateAppInterfaceStateMachine>
}

export function DeploymentDetails({ machine }: Props) {
  const [state, send] = machine
  invariant(
    state.context.appSpec && (isArc32AppSpec(state.context.appSpec) || isArc56AppSpec(state.context.appSpec)),
    'ARC32 or ARC56 app spec is required'
  )

  const appSpec = asArc56AppSpec(state.context.appSpec)
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

  const templateParamFields = useMemo(() => {
    const templateParamDefinitions = unifiedTemplateParamNames.map((p) => getTemplateParamDefinition(appSpec, p))
    return templateParamDefinitions.map((p) =>
      asTealTemplateParamField({
        name: p.name,
        type: p.type,
        struct: p.struct,
        defaultValue: p.defaultValue,
      })
    )
  }, [appSpec, unifiedTemplateParamNames])

  const formSchema = useMemo(() => {
    const shape = templateParamFields.reduce((acc, field) => {
      return {
        ...acc,
        [field.path]: field.fieldSchema,
      }
    }, baseShape)

    const zodObject = z.object(shape).superRefine((schema, ctx) => {
      if (schema.appInterfaceExists === true) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'App interface with this name already exists',
          path: ['name'],
        })
      }
    })

    return zfd.formData(zodObject)
  }, [templateParamFields])

  const next = useCallback(
    (values: z.infer<typeof formSchema>) => {
      const templateParamValues = templateParamFields.map((f) => {
        const value = values[f.path as keyof z.infer<typeof formSchema>]
        return f.toTemplateParam(value as (TealUnknownTypeTemplateParamFieldValue & TealAVMTypeTemplateParamFieldValue) & FormItemValue)
      })

      send({
        type: 'detailsCompleted',
        name: values.name,
        version: values.version,
        updatable: values.updatable,
        deletable: values.deletable,
        templateParams: templateParamValues,
      })
    },
    [send, templateParamFields]
  )

  const back = useCallback(() => {
    send({ type: 'detailsCancelled' })
  }, [send])

  const defaultValues = useMemo(() => {
    const commonValues = {
      name: state.context.name ?? appSpec.name,
      version: state.context.version ?? '1.0',
      updatable: state.context.updatable !== undefined ? state.context.updatable : enableDeployTimeUpdatabilityControl ? false : undefined,
      deletable: state.context.deletable !== undefined ? state.context.deletable : enableDeployTimeDeletabilityControl ? false : undefined,
    }

    return templateParamFields.reduce((acc, field, index) => {
      return {
        ...acc,
        [field.path]: state.context.templateParams
          ? field.fromTemplateParam(state.context.templateParams[index] as UnknownTypeTemplateParam & ABITypeTemplateParam)
          : 'defaultValue' in field
            ? field.defaultValue
            : {
                type: TemplateParamType.String,
              },
      }
    }, commonValues)
  }, [
    appSpec.name,
    enableDeployTimeDeletabilityControl,
    enableDeployTimeUpdatabilityControl,
    state.context.deletable,
    state.context.name,
    state.context.templateParams,
    state.context.updatable,
    state.context.version,
    templateParamFields,
  ])

  return (
    <Form
      className="duration-300 animate-in fade-in-20"
      schema={formSchema}
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
          templateParamFields={templateParamFields}
          helper={helper}
        />
      )}
    </Form>
  )
}
