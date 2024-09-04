import { defaultNetworkConfigs, localnetId } from '@/features/network/data'
import { PropsWithChildren } from 'react'
import { JotaiStore } from '@/features/common/data/types'
import { DataProvider } from '@/features/common/components/data-provider'
import { TestWalletProvider } from './test-wallet-provider'
import { useTheme } from '@/features/common/hooks/use-theme'
import { useWallet } from '@txnlab/use-wallet'

type Props = PropsWithChildren<{
  store?: JotaiStore
}>

export function TestPlatformProvider({ children, store }: Props) {
  const networkConfig = {
    id: localnetId,
    ...defaultNetworkConfigs.localnet,
  }
  useTheme()

  const { activeAddress, isReady, providers } = useWallet()
  const a = 5

  return (
    <DataProvider networkConfig={networkConfig} store={store}>
      <TestWalletProvider networkConfig={networkConfig}>{children}</TestWalletProvider>
    </DataProvider>
  )
}
