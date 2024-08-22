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
import { OnSchemaBreak, OnUpdate } from '@algorandfoundation/algokit-utils/types/app'
import { base64ToUtf8 } from '@/utils/base64-to-utf8'

type Props = {
  appSpec: Arc32AppSpec
  onSuccess: (appId: ApplicationId) => void
  onCancel: () => void
}

const formSchema = zfd.formData({})

export function DeployAppForm({ appSpec, onSuccess, onCancel }: Props) {
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
            name: 'Sample Four - new',
            version: '1.0.0',
          },
          onUpdate: OnUpdate.Fail,
          onSchemaBreak: OnSchemaBreak.Fail,
        },
        algod,
        indexer
      )

      // TODO: bigint?
      return Number(deployAppResult.appId)
    },
    [activeAccount, appSpec, signer]
  )

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
    >
      {(helper) => <></>}
    </Form>
  )
}
