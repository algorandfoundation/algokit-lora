import { NetworkSelect } from '@/features/settings/components/network-select'
import { KmdWalletSelect } from './kmd-wallet-select'
import { useNetworkConfig } from '../data'

export function Settings() {
  const networkConfig = useNetworkConfig()

  return (
    <>
      <NetworkSelect />
      {networkConfig.id === 'localnet' && <KmdWalletSelect />}
    </>
  )
}
