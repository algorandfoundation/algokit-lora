import { ApplicationId } from '@/features/applications/data/types'
import { Form } from '@/features/forms/components/form'
import { FormActions } from '@/features/forms/components/form-actions'
import { CancelButton } from '@/features/forms/components/cancel-button'
import { SubmitButton } from '@/features/forms/components/submit-button'
import { zfd } from 'zod-form-data'
import { z } from 'zod'
import { useCallback } from 'react'
import { deployApp } from '@algorandfoundation/algokit-utils'
import { algod, indexer } from '@/features/common/data/algo-client'
import { Arc32AppSpec } from '../data/types'
import { useWallet } from '@txnlab/use-wallet'
import { invariant } from '@/utils/invariant'
import { base64ToUtf8 } from '@/utils/base64-to-utf8'
import { useCreateAppInterfaceStateMachine } from '@/features/app-interfaces/data/state-machine'

type Props = {
  className?: string
  appSpec: Arc32AppSpec
}

// TODO: rethink z.union vs enum
const formSchema = zfd.formData({
  name: zfd.text(),
  version: zfd.text(),
  onUpdate: zfd.text(z.union([z.literal('fail'), z.literal('update'), z.literal('replace'), z.literal('append')]).optional()),
  onSchemaBreak: zfd.text(z.union([z.literal('fail'), z.literal('replace'), z.literal('append')]).optional()),
  deletable: z.boolean().optional(),
  updatable: z.boolean().optional(),
})

export function DeployAppForm({ className, appSpec }: Props) {
  const [_, send] = useCreateAppInterfaceStateMachine()
  const { signer, activeAccount } = useWallet()

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
          },
          onUpdate: values.onUpdate,
          onSchemaBreak: values.onSchemaBreak,
        },
        algod,
        indexer
      )
      // TODO: handle operationPerformed
      console.log(deployAppResult)
      // TODO: bigint?
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
      send({ type: 'new_app_created', applicationId: appId })
    },
    [send]
  )

  const onCancel = useCallback(() => {
    send({ type: 'create_new_app_request_cancel' })
  }, [send])

  return (
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
        </>
      )}
    </Form>
  )
}
