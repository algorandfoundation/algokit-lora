import { FormFieldHelper } from '@/features/forms/components/form-field-helper'
import { z } from 'zod'
import { useFormContext } from 'react-hook-form'
import { useEffect, useMemo, useState } from 'react'
import { Fieldset } from '@/features/forms/components/fieldset'
import { editNetworkConfigFormSchema } from '@/features/settings/form-schemas/edit-network-config-form-schema'
import { createNetworkConfigFormSchema } from '@/features/settings/form-schemas/create-network-config-form-schema'
import { PROVIDER_ID } from '@txnlab/use-wallet'
import { defaultNetworkConfigs, localnetId, mainnetId, testnetId } from '@/features/settings/data'

type FormInnerProps = {
  networkId?: string
  helper: FormFieldHelper<z.infer<typeof editNetworkConfigFormSchema>> | FormFieldHelper<z.infer<typeof createNetworkConfigFormSchema>>
}

const serverLabel = 'Server'
const portLabel = 'Port'
const promptForTokenLabel = 'Prompt for token'
const tokenLabel = 'Token'

export function NetworkFormInner({ networkId, helper }: FormInnerProps) {
  const { setValue, watch } = useFormContext<z.infer<typeof editNetworkConfigFormSchema>>()
  const [kmdRequired, setKmdRequired] = useState(false)

  const walletProviders = watch('walletProviders')
  useEffect(() => {
    const isKmdRequired = walletProviders.includes(PROVIDER_ID.KMD)

    setKmdRequired(isKmdRequired)
    if (!isKmdRequired) {
      setValue('kmd', undefined)
    }
  }, [setValue, walletProviders])

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

  // TODO: NC - explain that the token is stored in plain text
  return (
    <>
      {helper.multiSelectField({
        label: 'Wallet providers',
        field: 'walletProviders',
        options: supportedWalletProviders,
        placeholder: 'Select wallet providers',
      })}
      <Fieldset legend="Algod">
        {helper.textField({
          label: serverLabel,
          field: 'algod.server',
          placeholder: defaultNetworkConfigs.localnet.algod.server,
        })}
        {helper.numberField({
          label: portLabel,
          field: 'algod.port',
          placeholder: defaultNetworkConfigs.localnet.algod.port.toString(),
        })}
        <div className="relative">
          {helper.checkboxField({
            label: promptForTokenLabel,
            field: 'algod.promptForToken',
            className: 'absolute right-0.5 top-0',
          })}
          {helper.passwordField({
            label: tokenLabel,
            field: 'algod.token',
            disabled: algodPromptForToken,
          })}
        </div>
      </Fieldset>
      <Fieldset legend="Indexer">
        {helper.textField({
          label: serverLabel,
          field: 'indexer.server',
          placeholder: defaultNetworkConfigs.localnet.indexer.server,
        })}
        {helper.numberField({
          label: portLabel,
          field: 'indexer.port',
          placeholder: defaultNetworkConfigs.localnet.indexer.port.toString(),
        })}
        <div className="relative">
          {helper.checkboxField({
            label: promptForTokenLabel,
            field: 'indexer.promptForToken',
            className: 'absolute right-0.5 top-0',
          })}
          {helper.passwordField({
            label: tokenLabel,
            field: 'indexer.token',
            disabled: indexerPromptForToken,
          })}
        </div>
      </Fieldset>
      {kmdRequired && (
        <Fieldset legend="KMD">
          {helper.textField({
            label: serverLabel,
            field: 'kmd.server',
            placeholder: defaultNetworkConfigs.localnet.kmd?.server,
          })}
          {helper.numberField({
            label: portLabel,
            field: 'kmd.port',
            placeholder: defaultNetworkConfigs.localnet.kmd?.port.toString(),
          })}
          <div className="relative">
            {helper.checkboxField({
              label: promptForTokenLabel,
              field: 'kmd.promptForToken',
              className: 'absolute right-0.5 top-0',
            })}
            {helper.passwordField({
              label: tokenLabel,
              field: 'kmd.token',
              disabled: kmdPromptForToken,
            })}
          </div>
        </Fieldset>
      )}
    </>
  )
}

// TODO: NC - This should go somewhere else I think
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
const localWalletProviders = [
  {
    value: PROVIDER_ID.KMD,
    label: 'KMD',
  },
  {
    value: PROVIDER_ID.MNEMONIC,
    label: 'Mnemonic',
  },
]
const getSupportedWalletProviderOptions = (networkId?: string) => {
  if (networkId === localnetId) {
    return localWalletProviders
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
