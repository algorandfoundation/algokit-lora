import { mainnetId, NetworkConfigWithId } from '@/features/network/data/types'
import { WalletManager } from '@txnlab/use-wallet'
import { PropsWithChildren, useMemo } from 'react'
import { WalletProviderInner } from '@/features/common/components/wallet-provider-inner'

type Props = PropsWithChildren<{
  networkConfig: NetworkConfigWithId
}>

export function TestWalletProvider({ networkConfig, children }: Props) {
  const walletManager = useMemo(() => {
    return new WalletManager({
      wallets: [],
      networks: {
        [networkConfig.id]: {
          algod: {
            baseServer: networkConfig.algod.server,
            port: networkConfig.algod.port,
            token: networkConfig.algod.token ?? '',
          },
          isTestnet: networkConfig.id !== mainnetId,
        },
      },
      defaultNetwork: networkConfig.id,
      options: {
        resetNetwork: true,
      },
    })
  }, [networkConfig.algod.port, networkConfig.algod.server, networkConfig.algod.token, networkConfig.id])

  return <WalletProviderInner walletManager={walletManager}>{children}</WalletProviderInner>
}
