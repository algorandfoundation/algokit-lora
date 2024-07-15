import { FormFieldHelper } from '@/features/forms/components/form-field-helper'
import { z } from 'zod'
import { useFormContext } from 'react-hook-form'
import { useEffect, useMemo, useState } from 'react'
import { Fieldset } from '@/features/forms/components/fieldset'
import { editNetworkConfigFormSchema } from '@/features/settings/form-schemas/edit-network-config-form-schema'
import { createNetworkConfigFormSchema } from '@/features/settings/form-schemas/create-network-config-form-schema'
import { PROVIDER_ID } from '@txnlab/use-wallet'
import { localnetId, mainnetId, testnetId } from '@/features/settings/data'

type FormInnerProps = {
  networkId?: string
  helper: FormFieldHelper<z.infer<typeof editNetworkConfigFormSchema>> | FormFieldHelper<z.infer<typeof createNetworkConfigFormSchema>>
}
export function NetworkFormInner({ networkId, helper }: FormInnerProps) {
  const { setValue, watch } = useFormContext<z.infer<typeof editNetworkConfigFormSchema>>()
  const [kmdRequired, setKmdRequired] = useState(false)

  const walletProviders = watch('walletProviders')
  useEffect(() => {
    if (walletProviders.includes(PROVIDER_ID.KMD)) {
      setKmdRequired(true)
    }
  }, [walletProviders])

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

  const supportedWalletProviders = useMemo(() => getSupportedWalletProviderOptions(networkId), [networkId])

  // TODO: explain that the token is stored in plain text
  // TODO: fix tab index
  return (
    <>
      {helper.multiSelectField({
        label: 'Wallet providers',
        field: 'walletProviders',
        options: supportedWalletProviders,
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
      {kmdRequired && (
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
      )}
    </>
  )
}

const getSupportedWalletProviderOptions = (networkId?: string) => {
  const nonLocalWalletProviders = [
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
  ]
  if (networkId === localnetId) {
    return [
      {
        value: PROVIDER_ID.KMD,
        label: 'KMD',
      },
      {
        value: PROVIDER_ID.MNEMONIC,
        label: 'Mnemonic',
      },
    ]
  }
  if (networkId === mainnetId || networkId === testnetId) {
    return nonLocalWalletProviders
  }

  // For custom network
  return [
    ...nonLocalWalletProviders,
    {
      value: PROVIDER_ID.KMD,
      label: 'KMD',
    },
  ]
}
