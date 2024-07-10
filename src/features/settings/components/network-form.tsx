import { Form } from '@/features/forms/components/form'
import { zfd } from 'zod-form-data'
import { useCallback, useEffect, useMemo } from 'react'
import { SubmitButton } from '@/features/forms/components/submit-button'
import { FormActions } from '@/features/forms/components/form-actions'
import { builtInNetworksConfigs, NetworkConfig, useSetNetworkConfig } from '@/features/settings/data'
import { z } from 'zod'
import { Fieldset } from '@/features/forms/components/fieldset'
import { FormFieldHelper } from '@/features/forms/components/form-field-helper'
import { useFormContext } from 'react-hook-form'
import { toast } from 'react-toastify'
import { Button } from '@/features/common/components/button'
import { CancelButton } from '@/features/forms/components/cancel-button'

const serverSchema = z.object({
  server: zfd.text(z.string().url()),
  port: zfd.numeric(z.number({ required_error: 'Required', invalid_type_error: 'equired' }).min(0).max(65535)),
  token: zfd.text(z.string().optional()),
  promptForToken: z.boolean().optional(),
})

const networkSchema = zfd.formData({
  networkId: zfd.text(),
  name: zfd.text(),
  indexer: serverSchema,
  algod: serverSchema,
  kmd: z
    .object({
      server: zfd.text(z.string().url().optional()),
      port: zfd.numeric(z.number().min(0).max(65535).optional()),
      token: zfd.text(z.string().optional()),
      promptForToken: z.boolean().optional(),
    })
    .refine((data) => (data.server ? data.port !== undefined : true), {
      message: 'The port is required if the server is specified',
      path: ['port'],
    })
    .refine((data) => (data.port ? data.server : true), {
      message: 'The server is required if the port is specified',
      path: ['server'],
    })
    .refine((data) => (data.token ? data.server : true), {
      message: 'The server is required if the token is specified',
      path: ['server'],
    })
    .refine((data) => (data.token ? data.port : true), {
      message: 'The port is required if the token is specified',
      path: ['port'],
    }),
})

type Props = {
  network: NetworkConfig
  onSuccess: () => void
}
export function NetworkForm({ network, onSuccess }: Props) {
  const setNetworkConfig = useSetNetworkConfig()
  const onSubmit = useCallback(
    async (values: z.infer<typeof networkSchema>) => {
      setNetworkConfig({
        id: network.id,
        name: network.isBuiltIn ? network.name : values.name,
        walletProviders: network.walletProviders,
        isBuiltIn: network.isBuiltIn,
        indexer: {
          server: values.indexer.server,
          port: values.indexer.port,
          token: values.indexer.promptForToken ? undefined : values.indexer.token,
          promptForToken: values.indexer.promptForToken ?? false,
        },
        algod: {
          server: values.algod.server,
          port: values.algod.port,
          token: values.algod.promptForToken ? undefined : values.algod.token,
          promptForToken: values.algod.promptForToken ?? false,
        },
        kmd:
          values.kmd.server && values.kmd.port
            ? {
                server: values.kmd.server,
                port: values.kmd.port,
                token: values.kmd.promptForToken ? undefined : values.kmd.token,
                promptForToken: values.kmd.promptForToken ?? false,
              }
            : undefined,
      })
      toast.success('Network config saved')
      return Promise.resolve()
    },
    [network.id, network.isBuiltIn, network.name, network.walletProviders, setNetworkConfig]
  )
  const onReset = useCallback(() => {
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
    <Form schema={networkSchema} onSubmit={onSubmit} onSuccess={onSuccess} defaultValues={defaultValues}>
      {(helper) => (
        <>
          <FormInner helper={helper} isBuiltInNetwork={network.isBuiltIn} />
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

type FormInnerProps = {
  helper: FormFieldHelper<z.infer<typeof networkSchema>>
  isBuiltInNetwork: boolean
}
function FormInner({ helper, isBuiltInNetwork }: FormInnerProps) {
  const { setValue, watch } = useFormContext<z.infer<typeof networkSchema>>()

  // TODO: this repeats a lot
  const indexerPromptForToken = watch('indexer.promptForToken')
  useEffect(() => {
    if (indexerPromptForToken) {
      setValue('indexer.token', undefined)
    }
  })
  const algodPromptForToken = watch('algod.promptForToken')
  useEffect(() => {
    if (algodPromptForToken) {
      setValue('algod.token', undefined)
    }
  })
  const kmdPromptForToken = watch('kmd.promptForToken')
  useEffect(() => {
    if (kmdPromptForToken) {
      setValue('kmd.token', undefined)
    }
  })

  return (
    <>
      {helper.textField({
        label: 'Name',
        field: 'name',
        disabled: isBuiltInNetwork,
      })}
      <Fieldset legend="Indexer">
        {helper.textField({
          label: 'Server',
          field: 'indexer.server',
        })}
        {helper.numberField({
          label: 'Port',
          field: 'indexer.port',
        })}
        {helper.checkboxField({
          label: 'Prompt for token',
          field: 'indexer.promptForToken',
        })}
        {helper.passwordField({
          label: 'Token',
          field: 'indexer.token',
          disabled: indexerPromptForToken,
        })}
      </Fieldset>
      <Fieldset legend="Algod">
        {helper.textField({
          label: 'Server',
          field: 'algod.server',
        })}
        {helper.numberField({
          label: 'Port',
          field: 'algod.port',
        })}
        {helper.checkboxField({
          label: 'Prompt for token',
          field: 'algod.promptForToken',
        })}
        {helper.passwordField({
          label: 'Token',
          field: 'algod.token',
        })}
      </Fieldset>
      <Fieldset legend="KMD">
        {helper.textField({
          label: 'Server',
          field: 'kmd.server',
        })}
        {helper.numberField({
          label: 'Port',
          field: 'kmd.port',
        })}
        {helper.checkboxField({
          label: 'Prompt for token',
          field: 'kmd.promptForToken',
        })}
        {helper.passwordField({
          label: 'Token',
          field: 'kmd.token',
        })}
      </Fieldset>
    </>
  )
}
