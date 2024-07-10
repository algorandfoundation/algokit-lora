import { Form } from '@/features/forms/components/form'
import { zfd } from 'zod-form-data'
import { useCallback, useEffect, useMemo } from 'react'
import { SubmitButton } from '@/features/forms/components/submit-button'
import { FormActions } from '@/features/forms/components/form-actions'
import { NetworkConfig } from '@/features/settings/data'
import { z } from 'zod'
import { Fieldset } from '@/features/forms/components/fieldset'
import { FormFieldHelper } from '@/features/forms/components/form-field-helper'
import { useFormContext } from 'react-hook-form'

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
}
export function NetworkForm({ network }: Props) {
  const onSubmit = useCallback(async (values: z.infer<typeof networkSchema>) => {
    console.log(values)
    return Promise.resolve()
  }, [])
  const onSuccess = useCallback(() => {}, [])

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
      {(helper) => <FormInner helper={helper} />}
    </Form>
  )
}

function FormInner({ helper }: { helper: FormFieldHelper<z.infer<typeof networkSchema>> }) {
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
      <FormActions>
        <SubmitButton>Save</SubmitButton>
      </FormActions>
    </>
  )
}
