import { Form } from '@/features/forms/components/form'
import { useCallback, useMemo } from 'react'
import { SubmitButton } from '@/features/forms/components/submit-button'
import { FormActions } from '@/features/forms/components/form-actions'
import {
  defaultNetworkConfigs,
  useDeleteCustomNetworkConfig,
  useSelectedNetwork,
  useSetCustomNetworkConfig,
} from '@/features/settings/data'
import { z } from 'zod'
import { toast } from 'react-toastify'
import { Button } from '@/features/common/components/button'
import { CancelButton } from '@/features/forms/components/cancel-button'
import { editNetworkConfigFormSchema } from '@/features/settings/form-schemas/edit-network-config-form-schema'
import { NetworkFormInner } from '@/features/settings/components/network-form-inner'
import { asAlgoServiceConfig } from '@/features/settings/mappers'
import { NetworkConfigWithId } from '@/features/settings/data/types'
import { PROVIDER_ID } from '@txnlab/use-wallet'
import { useRefreshDataProviderToken } from '@/features/common/data'
import { Alert } from '@/features/common/components/alert'
import { tokenStorageText } from '@/features/settings/components/labels'

type Props = {
  networkConfig: NetworkConfigWithId
  onSuccess: () => void
}
export function EditNetworkConfigForm({ networkConfig, onSuccess }: Props) {
  const [selectedNetwork] = useSelectedNetwork()
  const setCustomNetworkConfig = useSetCustomNetworkConfig()
  const deleteNetworkConfig = useDeleteCustomNetworkConfig()
  const refreshDataProviderToken = useRefreshDataProviderToken()
  const isBuiltInNetwork = networkConfig.id in defaultNetworkConfigs

  const onSubmit = useCallback(
    async (values: z.infer<typeof editNetworkConfigFormSchema>) => {
      setCustomNetworkConfig(networkConfig.id, {
        name: networkConfig.name,
        walletProviders: values.walletProviders,
        indexer: asAlgoServiceConfig(values.indexer),
        algod: asAlgoServiceConfig(values.algod),
        kmd: values.walletProviders.includes(PROVIDER_ID.KMD) ? asAlgoServiceConfig(values.kmd!) : undefined,
      })

      toast.success(`Network "${networkConfig.name}" saved`)
      if (networkConfig.id === selectedNetwork) {
        refreshDataProviderToken()
      }
      return Promise.resolve()
    },
    [networkConfig.id, networkConfig.name, refreshDataProviderToken, selectedNetwork, setCustomNetworkConfig]
  )
  const onReset = useCallback(() => {
    if (defaultNetworkConfigs[networkConfig.id]) {
      deleteNetworkConfig(networkConfig.id)
      toast.success(`Network "${networkConfig.name}" reset`)
      onSuccess()
    }
  }, [deleteNetworkConfig, networkConfig.id, networkConfig.name, onSuccess])

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
    <Form
      schema={editNetworkConfigFormSchema}
      onSubmit={onSubmit}
      onSuccess={onSuccess}
      defaultValues={defaultValues}
      formAction={
        <FormActions>
          {isBuiltInNetwork && (
            <Button type="button" variant="destructive" className="mr-auto" onClick={onReset}>
              Reset
            </Button>
          )}
          <CancelButton onClick={onSuccess} className="w-28" />
          <SubmitButton className="w-28">Save</SubmitButton>
        </FormActions>
      }
    >
      {(helper) => (
        <>
          <Alert variant="default">{tokenStorageText}</Alert>
          <NetworkFormInner networkId={networkConfig.id} helper={helper} />
        </>
      )}
    </Form>
  )
}
