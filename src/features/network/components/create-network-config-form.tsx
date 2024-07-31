import { Form } from '@/features/forms/components/form'
import { useCallback, useMemo } from 'react'
import { SubmitButton } from '@/features/forms/components/submit-button'
import { FormActions } from '@/features/forms/components/form-actions'
import { defaultNetworkConfigs, useNetworkConfigs, useSetCustomNetworkConfig } from '@/features/network/data'
import { z } from 'zod'
import { toast } from 'react-toastify'
import { CancelButton } from '@/features/forms/components/cancel-button'
import { NetworkFormInner } from '@/features/network/components/network-form-inner'
import { asStorableServiceConfig } from '@/features/settings/mappers'
import { createNetworkConfigFormSchema } from '@/features/settings/form-schemas/create-network-config-form-schema'
import { PROVIDER_ID } from '@txnlab/use-wallet'
import { replaceAll } from '@/utils/replace-all'
import { tokenStorageText } from '@/features/network/components/labels'
import { Alert } from '@/features/common/components/alert'
import { Urls } from '@/routes/urls'

type Props = {
  onSuccess: () => void
}
// Include all parent routes, so it's not possible to have a route collision.
export const disallowedNetworkIds = Object.values(Urls)
  .filter((t) => t !== Urls.Index && t !== Urls.Explore)
  .map((t) => {
    // We don't use the networkId here, it's simply to keep the type system happy
    return t.build({ networkId: '_' }).replace('/', '')
  })

export function CreateNetworkConfigForm({ onSuccess }: Props) {
  const setCustomNetworkConfig = useSetCustomNetworkConfig()
  const networkConfigs = useNetworkConfigs()
  const existingNetworkIds = useMemo(() => Object.entries(networkConfigs).map(([id, _]) => id), [networkConfigs])

  const createNetwork = useCallback(
    (values: z.infer<typeof createNetworkConfigFormSchema>) => {
      const networkId = generateNetworkId(values.name)

      if (disallowedNetworkIds.includes(networkId)) {
        throw new Error(`A network with id '${networkId}' matches a disallowed value, please choose a different name`)
      }

      if (existingNetworkIds.includes(networkId)) {
        throw new Error(`A network with id '${networkId}' already exists, please choose a different name`)
      }

      setCustomNetworkConfig(networkId, {
        name: values.name,
        walletProviders: values.walletProviders,
        indexer: asStorableServiceConfig(values.indexer),
        algod: asStorableServiceConfig(values.algod),
        kmd: values.walletProviders.includes(PROVIDER_ID.KMD) && values.kmd ? asStorableServiceConfig(values.kmd) : undefined,
      })
      toast.success(`${values.name} has been created`)
    },
    [existingNetworkIds, setCustomNetworkConfig]
  )

  return (
    <Form
      schema={createNetworkConfigFormSchema}
      onSubmit={createNetwork}
      onSuccess={onSuccess}
      defaultValues={{
        walletProviders: [],
      }}
      formAction={
        <FormActions>
          <CancelButton onClick={onSuccess} className="w-28" />
          <SubmitButton className="w-28">Save</SubmitButton>
        </FormActions>
      }
    >
      {(helper) => (
        <>
          <Alert variant="default">{tokenStorageText}</Alert>
          {helper.textField({
            label: 'Name',
            field: 'name',
            placeholder: defaultNetworkConfigs.localnet.name,
          })}
          <NetworkFormInner helper={helper} />
        </>
      )}
    </Form>
  )
}

const generateNetworkId = (name: string) => {
  return replaceAll(name.toLowerCase(), ' ', '-')
}
