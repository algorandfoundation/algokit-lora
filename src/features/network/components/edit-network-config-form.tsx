import { Form } from '@/features/forms/components/form'
import { useCallback, useMemo } from 'react'
import { SubmitButton } from '@/features/forms/components/submit-button'
import { FormActions } from '@/features/forms/components/form-actions'
import { useSelectedNetwork, useSetCustomNetworkConfig } from '@/features/network/data'
import { z } from 'zod'
import { toast } from 'react-toastify'
import { CancelButton } from '@/features/forms/components/cancel-button'
import { editNetworkConfigFormSchema } from '@/features/settings/form-schemas/edit-network-config-form-schema'
import { NetworkFormInner } from '@/features/network/components/network-form-inner'
import { asStorableServiceConfig } from '@/features/settings/mappers'
import { NetworkConfigWithId } from '@/features/network/data/types'
import { PROVIDER_ID } from '@txnlab/use-wallet'
import { useRefreshDataProviderToken } from '@/features/common/data'
import { Alert } from '@/features/common/components/alert'
import { tokenStorageText } from '@/features/network/components/labels'

type Props = {
  networkConfig: NetworkConfigWithId
  onSuccess: () => void
}
export function EditNetworkConfigForm({ networkConfig, onSuccess }: Props) {
  const [selectedNetwork] = useSelectedNetwork()
  const setCustomNetworkConfig = useSetCustomNetworkConfig()
  const refreshDataProviderToken = useRefreshDataProviderToken()

  const updateNetwork = useCallback(
    (values: z.infer<typeof editNetworkConfigFormSchema>) => {
      setCustomNetworkConfig(networkConfig.id, {
        name: networkConfig.name,
        walletProviders: values.walletProviders ?? [],
        indexer: asStorableServiceConfig(values.indexer),
        algod: asStorableServiceConfig(values.algod),
        kmd: (values.walletProviders ?? []).includes(PROVIDER_ID.KMD) && values.kmd ? asStorableServiceConfig(values.kmd) : undefined,
      })

      toast.success(`${networkConfig.name} has been updated`)
      if (networkConfig.id === selectedNetwork) {
        refreshDataProviderToken()
      }
    },
    [networkConfig.id, networkConfig.name, refreshDataProviderToken, selectedNetwork, setCustomNetworkConfig]
  )

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
      onSubmit={updateNetwork}
      onSuccess={onSuccess}
      defaultValues={defaultValues}
      formAction={
        <FormActions>
          <CancelButton onClick={onSuccess} className="w-28" />
          <SubmitButton className="w-28">Save</SubmitButton>
        </FormActions>
      }
    >
      {(helper) => (
        <>
          <Alert className="rounded-md" variant="default">
            {tokenStorageText}
          </Alert>
          <NetworkFormInner networkId={networkConfig.id} helper={helper} />
        </>
      )}
    </Form>
  )
}
