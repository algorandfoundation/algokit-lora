import { ApplicationId } from '@/features/applications/data/types'
import { Form } from '@/features/forms/components/form'
import { FormActions } from '@/features/forms/components/form-actions'
import { CancelButton } from '@/features/forms/components/cancel-button'
import { SubmitButton } from '@/features/forms/components/submit-button'
import { zfd } from 'zod-form-data'
import { z } from 'zod'
import { useCallback, useMemo } from 'react'
import { deployApp, stripTealComments } from '@algorandfoundation/algokit-utils'
import { algod, indexer } from '@/features/common/data/algo-client'
import { Arc32AppSpec } from '../data/types'
import { useWallet } from '@txnlab/use-wallet'
import { invariant } from '@/utils/invariant'
import { base64ToUtf8 } from '@/utils/base64-to-utf8'
import { useCreateAppInterfaceStateMachine } from '@/features/app-interfaces/data'
import { Path, useFormContext } from 'react-hook-form'
import { cn } from '@/features/common/utils'
import { FormFieldHelper } from '@/features/forms/components/form-field-helper'
import { Label } from '@/features/common/components/label'
import { Fieldset } from '@/features/forms/components/fieldset'

type Props = {
  className?: string
  appSpec: Arc32AppSpec
}

enum TemplateParamType {
  String = 'String',
  Number = 'Number',
  UInt8Array = 'UInt8Array',
}

const templateParam = z.object({
  name: zfd.text(),
  type: z.nativeEnum(TemplateParamType),
  value: zfd.text(),
})
const formSchema = zfd.formData({
  name: zfd.text(),
  version: zfd.text(),
  onUpdate: zfd.text(z.union([z.literal('fail'), z.literal('update'), z.literal('replace'), z.literal('append')]).optional()),
  onSchemaBreak: zfd.text(z.union([z.literal('fail'), z.literal('replace'), z.literal('append')]).optional()),
  deletable: z.boolean().optional(),
  updatable: z.boolean().optional(),
  templateParams: z.array(templateParam),
})
type DeployAppFormData = z.infer<typeof formSchema>
type TemplateParamFields = DeployAppFormData['templateParams']

const getTemplateParamNames = (appSpec: Arc32AppSpec) => {
  if (!appSpec.source.approval) {
    return []
  }
  let tealCode = base64ToUtf8(appSpec.source.approval)
  tealCode = stripTealComments(tealCode)

  const regex = /TMPL_[A-Z_]+/g
  return [...tealCode.matchAll(regex)].flat()
}

export function DeployAppForm({ className, appSpec }: Props) {
  const [_, send] = useCreateAppInterfaceStateMachine()
  const { signer, activeAccount } = useWallet()

  const templateParamNames = useMemo(() => getTemplateParamNames(appSpec), [appSpec])

  const save = useCallback(
    async (values: z.infer<typeof formSchema>) => {
      invariant(appSpec.source.approval, 'Approval program is not set')
      invariant(appSpec.source.clear, 'Clear program is not set')
      invariant(activeAccount, 'No active wallet account is available')

      const signerAccount = {
        addr: activeAccount.address,
        signer,
      }

      const deployAppResult = await deployApp(
        {
          from: signerAccount,
          approvalProgram: base64ToUtf8(appSpec.source.approval),
          clearStateProgram: base64ToUtf8(appSpec.source.clear),
          schema: {
            localInts: appSpec.state.local.num_uints,
            localByteSlices: appSpec.state.local.num_byte_slices,
            globalInts: appSpec.state.global.num_uints,
            globalByteSlices: appSpec.state.global.num_byte_slices,
          },
          metadata: {
            name: values.name,
            version: values.version,
            deletable: values.deletable,
            updatable: values.updatable,
          },
          onUpdate: values.onUpdate,
          onSchemaBreak: values.onSchemaBreak,
        },
        algod,
        indexer
      )
      return Number(deployAppResult.appId)
    },
    [
      activeAccount,
      appSpec.source.approval,
      appSpec.source.clear,
      appSpec.state.global.num_byte_slices,
      appSpec.state.global.num_uints,
      appSpec.state.local.num_byte_slices,
      appSpec.state.local.num_uints,
      signer,
    ]
  )

  const onSuccess = useCallback(
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
      <p className="mb-4">
        <a
          href="https://github.com/algorandfoundation/algokit-utils-ts/blob/main/docs/capabilities/app-deploy.md#deployapp"
          target="_blank"
          rel="nofollow"
          className="text-primary underline"
        >
          Learn more
        </a>
        &nbsp;about deploying an app.
      </p>
      <Form
        schema={formSchema}
        onSubmit={save}
        onSuccess={onSuccess}
        formAction={
          <FormActions>
            <CancelButton onClick={onCancel} className="w-28" />
            <SubmitButton className="w-28">Deploy</SubmitButton>
          </FormActions>
        }
        defaultValues={{
          name: appSpec.contract.name,
          templateParams: templateParamNames.map((name) => ({ name, type: TemplateParamType.String, value: '' })),
        }}
        className={className}
      >
        {(helper) => (
          <>
            {helper.textField({
              field: 'name',
              label: 'Name',
            })}
            {helper.textField({
              field: 'version',
              label: 'Version',
              placeholder: '1.0.0',
            })}
            {helper.selectField({
              field: 'onUpdate',
              label: 'On Update',
              options: [
                { value: 'fail', label: 'Fail' },
                { value: 'update', label: 'Update App' },
                { value: 'replace', label: 'Replace App' },
                { value: 'append', label: 'Append App' },
              ],
            })}
            {helper.selectField({
              field: 'onSchemaBreak',
              label: 'On Schema Break',
              options: [
                { value: 'fail', label: 'Fail' },
                { value: 'replace', label: 'Replace App' },
                { value: 'append', label: 'Append App' },
              ],
            })}
            {helper.checkboxField({
              field: 'deletable',
              label: 'Deletable',
            })}
            {helper.checkboxField({
              field: 'updatable',
              label: 'Updatable',
            })}
            <Fieldset legend="Template Params">
              {templateParamNames.map((name, index) => (
                <TemplateParamFormItem key={index} field={`templateParams.${index}`} name={name} />
              ))}
            </Fieldset>
          </>
        )}
      </Form>
    </div>
  )
}

export type TemplateParamFormItemProps = {
  className?: string
  name: string
  field: string
}

export function TemplateParamFormItem({ className, name, field }: TemplateParamFormItemProps) {
  const { watch } = useFormContext<DeployAppFormData>()
  const helper = new FormFieldHelper<TemplateParamFields[number]>({ fieldPrefix: field })

  const type = watch(`${field}.type` as Path<DeployAppFormData>)
  const placeholder = useMemo(() => {
    if (type === TemplateParamType.UInt8Array) {
      return 'Base64 encoded of the UInt8 array'
    }
    return undefined
  }, [type])

  return (
    <div className="space-y-2">
      <Label>{name.substring(5)}</Label>
      <div className={cn('grid gap-2 grid-cols-[200px_1fr]', className)}>
        {helper.selectField({
          field: 'type',
          label: 'Type',
          className: ' content-start',
          options: [
            { value: TemplateParamType.String, label: 'String' },
            { value: TemplateParamType.Number, label: 'Number' },
            { value: TemplateParamType.UInt8Array, label: 'UInt8Array' },
          ],
        })}
        {helper.textField({
          field: 'value',
          label: 'Value',
          className: ' content-start',
          placeholder: placeholder,
        })}
      </div>
    </div>
  )
}
