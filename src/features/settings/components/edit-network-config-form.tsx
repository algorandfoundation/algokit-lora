import { Form } from '@/features/forms/components/form'
import { useCallback, useMemo } from 'react'
import { SubmitButton } from '@/features/forms/components/submit-button'
import { FormActions } from '@/features/forms/components/form-actions'
import { defaultNetworkConfigs, useDeleteCustomNetworkConfig, useSetCustomNetworkConfig } from '@/features/settings/data'
import { z } from 'zod'
import { toast } from 'react-toastify'
import { Button } from '@/features/common/components/button'
import { CancelButton } from '@/features/forms/components/cancel-button'
import { editNetworkConfigFormSchema } from '@/features/settings/form-schemas/edit-network-config-form-schema'
import { NetworkFormInner } from '@/features/settings/components/network-form-inner'
import { asAlgoServiceConfig, asKmdServiceConfig } from '@/features/settings/mappers'
import { NetworkConfigWithId } from '@/features/settings/data/types'
import { PROVIDER_ID } from '@txnlab/use-wallet'

// TODO: KMD settings are only required for network that has KMD wallet
// TODO: multi select for wallet providers
type Props = {
  networkConfig: NetworkConfigWithId
  onSuccess: () => void
}
export function EditNetworkConfigForm({ networkConfig, onSuccess }: Props) {
  const setCustomNetworkConfig = useSetCustomNetworkConfig()
  const deleteNetworkConfig = useDeleteCustomNetworkConfig()

  const isBuiltInNetwork = networkConfig.id in defaultNetworkConfigs
  const onSubmit = useCallback(
    async (values: z.infer<typeof editNetworkConfigFormSchema>) => {
      // setCustomNetworkConfig(networkConfig.id, {
      //   name: networkConfig.name,
      //   walletProviders: networkConfig.walletProviders,
      //   indexer: asAlgoServiceConfig(values.indexer),
      //   algod: asAlgoServiceConfig(values.algod),
      //   kmd: asKmdServiceConfig(values.kmd),
      // })
      console.log(values)
      toast.success('Network config saved')
      return Promise.resolve()
    },
    [networkConfig.id, networkConfig.name, networkConfig.walletProviders, setCustomNetworkConfig]
  )
  const onReset = useCallback(() => {
    // TODO: check if we can save it straight away or only reset the form
    if (defaultNetworkConfigs[networkConfig.id]) {
      deleteNetworkConfig(networkConfig.id)
      toast.success('Network config reset')
      onSuccess()
    }
  }, [deleteNetworkConfig, networkConfig.id, onSuccess])

  const defaultValues = useMemo(
    () => ({
      name: networkConfig.name,
      indexer: networkConfig.indexer,
      algod: networkConfig.algod,
      kmd: networkConfig.kmd,
      walletProviders: networkConfig.walletProviders,
    }),
    [networkConfig]
  )

  return (
    <Form schema={editNetworkConfigFormSchema} onSubmit={onSubmit} onSuccess={onSuccess} defaultValues={defaultValues}>
      {(helper) => (
        <>
          <NetworkFormInner helper={helper} />
          <FormActions>
            {isBuiltInNetwork && (
              <Button type="button" variant={'outline-secondary'} className={'w-28'} onClick={onReset}>
                Reset
              </Button>
            )}
            <SubmitButton>Save</SubmitButton>
            <CancelButton onClick={onSuccess} />
          </FormActions>
        </>
      )}
    </Form>
  )
}
