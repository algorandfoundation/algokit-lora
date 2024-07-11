import { Form } from '@/features/forms/components/form'
import { useCallback } from 'react'
import { SubmitButton } from '@/features/forms/components/submit-button'
import { FormActions } from '@/features/forms/components/form-actions'
import { useSetNetworkConfig } from '@/features/settings/data'
import { z } from 'zod'
import { toast } from 'react-toastify'
import { CancelButton } from '@/features/forms/components/cancel-button'
import { NetworkFormInner } from '@/features/settings/components/network-form-inner'
import { asAlgoServiceConfig, asKmdServiceConfig } from '@/features/settings/mappers'
import { createNetworkConfigFormSchema } from '@/features/settings/form-schemas/create-network-config-form-schema'

type Props = {
  onSuccess: () => void
}
export function CreateNetworkConfigForm({ onSuccess }: Props) {
  const setNetworkConfig = useSetNetworkConfig()
  const onSubmit = useCallback(
    async (values: z.infer<typeof createNetworkConfigFormSchema>) => {
      setNetworkConfig({
        id: crypto.randomUUID(),
        name: values.name,
        walletProviders: [],
        isBuiltIn: false,
        indexer: asAlgoServiceConfig(values.indexer),
        algod: asAlgoServiceConfig(values.algod),
        kmd: asKmdServiceConfig(values.kmd),
      })
      toast.success('Network config created')
      return Promise.resolve()
    },
    [setNetworkConfig]
  )

  return (
    <Form schema={createNetworkConfigFormSchema} onSubmit={onSubmit} onSuccess={onSuccess}>
      {(helper) => (
        <>
          <NetworkFormInner helper={helper} isBuiltInNetwork={false} />
          <FormActions>
            <SubmitButton>Save</SubmitButton>
            <CancelButton onClick={onSuccess} />
          </FormActions>
        </>
      )}
    </Form>
  )
}
