import { Form } from '@/features/forms/components/form'
import { useCallback } from 'react'
import { SubmitButton } from '@/features/forms/components/submit-button'
import { FormActions } from '@/features/forms/components/form-actions'
import { useSetCustomNetworkConfig } from '@/features/settings/data'
import { z } from 'zod'
import { toast } from 'react-toastify'
import { CancelButton } from '@/features/forms/components/cancel-button'
import { NetworkFormInner } from '@/features/settings/components/network-form-inner'
import { asAlgoServiceConfig } from '@/features/settings/mappers'
import { createNetworkConfigFormSchema } from '@/features/settings/form-schemas/create-network-config-form-schema'
import { PROVIDER_ID } from '@txnlab/use-wallet'
import { replaceAll } from '@/utils/replace-all.ts'

type Props = {
  onSuccess: () => void
}
export function CreateNetworkConfigForm({ onSuccess }: Props) {
  const setCustomNetworkConfig = useSetCustomNetworkConfig()
  const onSubmit = useCallback(
    async (values: z.infer<typeof createNetworkConfigFormSchema>) => {
      setCustomNetworkConfig(generateNetworkId(values.name), {
        name: values.name,
        walletProviders: values.walletProviders,
        indexer: asAlgoServiceConfig(values.indexer),
        algod: asAlgoServiceConfig(values.algod),
        kmd: values.walletProviders.includes(PROVIDER_ID.KMD) ? asAlgoServiceConfig(values.kmd!) : undefined,
      })
      toast.success('Network config created')
      return Promise.resolve()
    },
    [setCustomNetworkConfig]
  )

  return (
    <Form
      schema={createNetworkConfigFormSchema}
      onSubmit={onSubmit}
      onSuccess={onSuccess}
      defaultValues={{
        walletProviders: [],
      }}
    >
      {(helper) => (
        <>
          {helper.textField({
            label: 'Name',
            field: 'name',
          })}
          <NetworkFormInner helper={helper} />
          <FormActions>
            <SubmitButton>Save</SubmitButton>
            <CancelButton onClick={onSuccess} />
          </FormActions>
        </>
      )}
    </Form>
  )
}

const generateNetworkId = (name: string) => {
  const randomStr = Number(new Date()).toString(36).toLowerCase()
  return `${replaceAll(name.toLowerCase(), ' ', '-')}-${randomStr}`
}
