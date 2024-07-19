import { DeflyWalletConnect } from '@blockshake/defly-connect'
import { DaffiWalletConnect } from '@daffiwallet/connect'
import { PeraWalletConnect } from '@perawallet/connect'
import { PROVIDER_ID, ProviderConfig, ProvidersArray, useInitializeProviders } from '@txnlab/use-wallet'
import LuteConnect from 'lute-connect'
import { PropsWithChildren, useMemo } from 'react'
import algosdk from 'algosdk'
import { WalletProviderInner } from './wallet-provider-inner'
import { defaultKmdWallet, useSelectedKmdWallet } from '@/features/wallet/data/kmd'
import { NetworkConfigWithId } from '@/features/network/data/types'

type Props = PropsWithChildren<{
  networkConfig: NetworkConfigWithId
}>

export function WalletProvider({ networkConfig, children }: Props) {
  const selectedKmdWallet = useSelectedKmdWallet()

  const key = `${networkConfig.id}-${selectedKmdWallet ?? ''}`

  const providers = useMemo(() => {
    return networkConfig.walletProviders.reduce(
      (acc, id) => {
        if (id === PROVIDER_ID.KMD && networkConfig.kmd) {
          acc.push({
            id,
            clientOptions: {
              wallet: selectedKmdWallet ?? defaultKmdWallet,
              password: '', // This is never actually used by the provider, however needs to be set.
              host: networkConfig.kmd.server,
              token: networkConfig.kmd.token ?? '',
              port: String(networkConfig.kmd.port),
            },
          } satisfies ProviderConfig<PROVIDER_ID.KMD>)
        } else if (id === PROVIDER_ID.MNEMONIC) {
          acc.push(PROVIDER_ID.MNEMONIC)
        } else if (id === PROVIDER_ID.DEFLY) {
          acc.push({
            id,
            clientStatic: DeflyWalletConnect,
          } satisfies ProviderConfig<PROVIDER_ID.DEFLY>)
        } else if (id === PROVIDER_ID.DAFFI) {
          acc.push({
            id,
            clientStatic: DaffiWalletConnect,
          } satisfies ProviderConfig<PROVIDER_ID.DAFFI>)
        } else if (id === PROVIDER_ID.PERA) {
          acc.push({
            id,
            clientStatic: PeraWalletConnect,
          } satisfies ProviderConfig<PROVIDER_ID.PERA>)
        } else if (id === PROVIDER_ID.EXODUS) {
          acc.push({
            id,
          } satisfies ProviderConfig<PROVIDER_ID.EXODUS>)
        } else if (id === PROVIDER_ID.LUTE) {
          acc.push({
            id,
            clientStatic: LuteConnect,
            clientOptions: { siteName: 'AlgoKit - lora' },
          } satisfies ProviderConfig<PROVIDER_ID.LUTE>)
        } else {
          // eslint-disable-next-line no-console
          console.error(`${id} is not a supported wallet provider`)
        }
        return acc as ProvidersArray
      },
      [] as unknown as ProvidersArray
    )
  }, [networkConfig.kmd, networkConfig.walletProviders, selectedKmdWallet])

  const initOptions = {
    providers,
    nodeConfig: {
      network: networkConfig.id,
      nodeServer: networkConfig.algod.server,
      nodePort: networkConfig.algod.port,
    },
    algosdkStatic: algosdk,
  } as Parameters<typeof useInitializeProviders>[0]

  return (
    // The key prop is super important it governs if the provider is reinitialized
    <WalletProviderInner key={key} initOptions={initOptions}>
      {children}
    </WalletProviderInner>
  )
}
