import { useNetworkConfig } from '@/features/settings/data'
import { PropsWithChildren } from 'react'
import { WalletProvider } from './wallet-provider'
import { DataProvider } from './data-provider'
import { useTheme } from '../hooks/use-theme'

export function PlatformProvider({ children }: PropsWithChildren) {
  const networkConfig = useNetworkConfig()
  useTheme()

  return (
    // The key prop is super important it governs if the provider is reinitialized
    <DataProvider key={networkConfig.id} networkConfig={networkConfig}>
      <WalletProvider networkConfig={networkConfig}>{children}</WalletProvider>
    </DataProvider>
  )
}
