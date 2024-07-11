import { Form } from '@/features/forms/components/form'
import { useCallback, useMemo } from 'react'
import { SubmitButton } from '@/features/forms/components/submit-button'
import { FormActions } from '@/features/forms/components/form-actions'
import { builtInNetworksConfigs, NetworkConfig, useSetNetworkConfig } from '@/features/settings/data'
import { z } from 'zod'
import { toast } from 'react-toastify'
import { Button } from '@/features/common/components/button'
import { CancelButton } from '@/features/forms/components/cancel-button'
import { editNetworkConfigFormSchema } from '@/features/settings/form-schemas/edit-network-config-form-schema'
import { NetworkFormInner } from '@/features/settings/components/network-form-inner'
import { asAlgoServiceConfig, asKmdServiceConfig } from '@/features/settings/mappers'

type Props = {
  network: NetworkConfig
  onSuccess: () => void
}
export function EditNetworkConfigForm({ network, onSuccess }: Props) {
  const setNetworkConfig = useSetNetworkConfig()
  const onSubmit = useCallback(
    async (values: z.infer<typeof editNetworkConfigFormSchema>) => {
      setNetworkConfig({
        id: network.id,
        name: network.isBuiltIn ? network.name : values.name,
        walletProviders: network.walletProviders,
        isBuiltIn: network.isBuiltIn,
        indexer: asAlgoServiceConfig(values.indexer),
        algod: asAlgoServiceConfig(values.algod),
        kmd: asKmdServiceConfig(values.kmd),
      })
      toast.success('Network config saved')
      return Promise.resolve()
    },
    [network.id, network.isBuiltIn, network.name, network.walletProviders, setNetworkConfig]
  )
  const onReset = useCallback(() => {
    // TODO: check if we can save it straight away or only reset the form
    const networkConfig = builtInNetworksConfigs.find((n) => n.id === network.id)
    if (networkConfig) {
      setNetworkConfig(networkConfig)
      toast.success('Network config reset')
      onSuccess()
    }
  }, [network.id, onSuccess, setNetworkConfig])

  const defaultValues = useMemo(
    () => ({
      networkId: network.id,
      name: network.name,
      indexer: network.indexer,
      algod: network.algod,
      kmd: network.kmd,
    }),
    [network]
  )

  return (
    <Form schema={editNetworkConfigFormSchema} onSubmit={onSubmit} onSuccess={onSuccess} defaultValues={defaultValues}>
      {(helper) => (
        <>
          <NetworkFormInner helper={helper} isBuiltInNetwork={network.isBuiltIn} />
          <FormActions>
            {network.isBuiltIn && (
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
