import { Form } from '@/features/forms/components/form'
import { useCallback, useMemo } from 'react'
import { SubmitButton } from '@/features/forms/components/submit-button'
import { FormActions } from '@/features/forms/components/form-actions'
import { defaultNetworkConfigs, useNetworkConfigs, useSetCustomNetworkConfig } from '@/features/settings/data'
import { z } from 'zod'
import { toast } from 'react-toastify'
import { CancelButton } from '@/features/forms/components/cancel-button'
import { NetworkFormInner } from '@/features/settings/components/network-form-inner'
import { asAlgoServiceConfig } from '@/features/settings/mappers'
import { createNetworkConfigFormSchema } from '@/features/settings/form-schemas/create-network-config-form-schema'
import { PROVIDER_ID } from '@txnlab/use-wallet'
import { replaceAll } from '@/utils/replace-all.ts'
import { tokenStorageText } from '@/features/settings/components/labels'
import { Alert } from '@/features/common/components/alert'

type Props = {
  onSuccess: () => void
}
export function CreateNetworkConfigForm({ onSuccess }: Props) {
  const setCustomNetworkConfig = useSetCustomNetworkConfig()
  const networkConfigs = useNetworkConfigs()
  const existingNetworkNames = useMemo(() => Object.values(networkConfigs).map((networkConfig) => networkConfig.name), [networkConfigs])

  const onSubmit = useCallback(
    async (values: z.infer<typeof createNetworkConfigFormSchema>) => {
      if (existingNetworkNames.includes(values.name)) {
        throw new Error(`Network name "${values.name}" already exists`)
      }

      setCustomNetworkConfig(generateNetworkId(values.name), {
        name: values.name,
        walletProviders: values.walletProviders,
        indexer: asAlgoServiceConfig(values.indexer),
        algod: asAlgoServiceConfig(values.algod),
        kmd: values.walletProviders.includes(PROVIDER_ID.KMD) ? asAlgoServiceConfig(values.kmd!) : undefined,
      })
      toast.success(`Network "${values.name}" created`)
      return Promise.resolve()
    },
    [existingNetworkNames, setCustomNetworkConfig]
  )

  return (
    <Form
      schema={createNetworkConfigFormSchema}
      onSubmit={onSubmit}
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
  const randomStr = Number(new Date()).toString(36).toLowerCase()
  return `${replaceAll(name.toLowerCase(), ' ', '-')}-${randomStr}`
}
