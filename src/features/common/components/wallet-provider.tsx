import { PropsWithChildren, useMemo } from 'react'
import { WalletProviderInner } from './wallet-provider-inner'
import { defaultKmdWallet, useSelectedKmdWallet } from '@/features/wallet/data/selected-kmd-wallet'
import { NetworkConfigWithId } from '@/features/network/data/types'
import { NetworkId, SupportedWallet, WalletId, WalletIdConfig, WalletManager } from '@txnlab/use-wallet-react'

type Props = PropsWithChildren<{
  networkConfig: NetworkConfigWithId
}>

export function WalletProvider({ networkConfig, children }: Props) {
  const selectedKmdWallet = useSelectedKmdWallet()

  const key = `${networkConfig.id}-${selectedKmdWallet ?? ''}`

  const wallets = useMemo(() => {
    return networkConfig.walletIds.reduce(
      (acc, id) => {
        if (id === WalletId.KMD && networkConfig.kmd) {
          acc.push({
            id,
            options: {
              wallet: selectedKmdWallet ?? defaultKmdWallet,
              baseServer: networkConfig.kmd.server,
              token: networkConfig.kmd.token ?? '',
              port: String(networkConfig.kmd.port),
            },
          } satisfies WalletIdConfig<WalletId.KMD>)
        } else if ([WalletId.MNEMONIC, WalletId.DEFLY, WalletId.PERA, WalletId.EXODUS].includes(id)) {
          acc.push(id)
        } else if (id === WalletId.LUTE) {
          acc.push({
            id,
            options: {
              siteName: 'AlgoKit - lora',
            },
          })
        } else {
          // eslint-disable-next-line no-console
          console.error(`${id} is not a supported wallet provider`)
        }
        return acc as SupportedWallet[]
      },
      [] as unknown as SupportedWallet[]
    )
  }, [networkConfig.kmd, networkConfig.walletIds, selectedKmdWallet])

  const walletManager = useMemo(() => {
    return new WalletManager({
      wallets: wallets,
      // use-wallet doesn't support custom network, we set it to localnet always to get around this.
      network: NetworkId.LOCALNET,
      algod: {
        baseServer: networkConfig.algod.server,
        port: networkConfig.algod.port,
        token: networkConfig.algod.token,
      },
    })
  }, [networkConfig.algod.port, networkConfig.algod.server, networkConfig.algod.token, wallets])

  return (
    // The key prop is super important it governs if the provider is reinitialized
    <WalletProviderInner key={key} walletManager={walletManager}>
      {children}
    </WalletProviderInner>
  )
}
