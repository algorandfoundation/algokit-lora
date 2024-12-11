import { NetworkConfigWithId } from '@/features/network/data/types'
import { WalletId, WalletManager } from '@txnlab/use-wallet'
import { PropsWithChildren, useMemo } from 'react'
import { WalletProviderInner } from '@/features/common/components/wallet-provider-inner'

type Props = PropsWithChildren<{
  networkConfig: NetworkConfigWithId
}>

export function TestWalletProvider({ networkConfig, children }: Props) {
  const walletManager = useMemo(() => {
    return new WalletManager({
      wallets: [WalletId.MNEMONIC], // Providers are mocked. This is just to satisfy NonEmptyArray.
      networks: {
        [networkConfig.id]: {
          name: networkConfig.name,
          algod: {
            baseServer: networkConfig.algod.server,
            port: networkConfig.algod.port,
            token: networkConfig.algod.token ?? '',
          },
        },
      },
      defaultNetwork: networkConfig.id,
      options: {
        resetNetwork: true,
      },
    })
  }, [networkConfig.algod.port, networkConfig.algod.server, networkConfig.algod.token, networkConfig.id, networkConfig.name])

  return <WalletProviderInner walletManager={walletManager}>{children}</WalletProviderInner>
}
