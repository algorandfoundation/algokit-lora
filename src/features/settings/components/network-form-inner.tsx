import { FormFieldHelper } from '@/features/forms/components/form-field-helper'
import { z } from 'zod'
import { useFormContext } from 'react-hook-form'
import { useEffect } from 'react'
import { Fieldset } from '@/features/forms/components/fieldset'
import { editNetworkConfigFormSchema } from '@/features/settings/form-schemas/edit-network-config-form-schema'
import { createNetworkConfigFormSchema } from '@/features/settings/form-schemas/create-network-config-form-schema'
import { PROVIDER_ID } from '@txnlab/use-wallet'

// TODO: when edit a custom network, let the user choose between the 4 built-in wallet providers + KMD wallet
type FormInnerProps = {
  helper: FormFieldHelper<z.infer<typeof editNetworkConfigFormSchema>> | FormFieldHelper<z.infer<typeof createNetworkConfigFormSchema>>
}
export function NetworkFormInner({ helper }: FormInnerProps) {
  const { setValue, watch } = useFormContext<z.infer<typeof editNetworkConfigFormSchema>>()

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

  // TODO: explain that the token is stored in plain text
  // TODO: fix tab index
  return (
    <>
      {helper.multiSelectField({
        label: 'Wallet providers',
        field: 'walletProviders',
        options: [
          {
            value: PROVIDER_ID.DEFLY,
            label: 'Defly',
          },
          {
            value: PROVIDER_ID.DAFFI,
            label: 'Daffi',
          },
          {
            value: PROVIDER_ID.PERA,
            label: 'Pera',
          },
          {
            value: PROVIDER_ID.EXODUS,
            label: 'Exodus',
          },
          {
            value: PROVIDER_ID.LUTE,
            label: 'Lute',
          },
          {
            value: PROVIDER_ID.KMD,
            label: 'KDM',
          },
        ],
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
          disabled: algodPromptForToken,
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
          disabled: kmdPromptForToken,
        })}
      </Fieldset>
    </>
  )
}
