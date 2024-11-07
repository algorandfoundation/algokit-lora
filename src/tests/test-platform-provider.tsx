import { useNetworkConfig } from '@/features/network/data'
import { PropsWithChildren } from 'react'
import { JotaiStore } from '@/features/common/data/types'
import { DataProvider } from '@/features/common/components/data-provider'
import { TestWalletProvider } from './test-wallet-provider'
import { useTheme } from '@/features/common/hooks/use-theme'

type Props = PropsWithChildren<{
  store?: JotaiStore
}>

export function TestPlatformProvider({ children, store }: Props) {
  const networkConfig = useNetworkConfig()
  useTheme()

  return (
    <DataProvider networkConfig={networkConfig} store={store}>
      <TestWalletProvider networkConfig={networkConfig}>{children}</TestWalletProvider>
    </DataProvider>
  )
}
