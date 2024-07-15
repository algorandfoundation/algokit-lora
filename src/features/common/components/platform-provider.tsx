import { useNetworkConfig, useResolvedTheme } from '@/features/settings/data'
import { PropsWithChildren } from 'react'
import { WalletProvider } from './wallet-provider'
import { DataProvider } from './data-provider'
import { useTheme } from '../hooks/use-theme'
import { useSubscribeToBlocksEffect } from '@/features/blocks/data'
import { useDataProviderToken, useStateCleanupEffect } from '../data'
import { ToastContainer } from 'react-toastify'

function RegisterGlobalEffects() {
  useSubscribeToBlocksEffect()
  useStateCleanupEffect()
  return <></>
}

export function PlatformProvider({ children }: PropsWithChildren) {
  const networkConfig = useNetworkConfig()
  const dataProviderToken = useDataProviderToken()
  const theme = useResolvedTheme()
  useTheme()

  const key = `${networkConfig.id}-${dataProviderToken}`

  return (
    // The key prop is super important it governs if the provider is reinitialized
    <>
      <ToastContainer theme={theme} toastClassName="border" />
      <DataProvider key={key} networkConfig={networkConfig}>
        <RegisterGlobalEffects />
        <WalletProvider networkConfig={networkConfig}>{children}</WalletProvider>
      </DataProvider>
    </>
  )
}
