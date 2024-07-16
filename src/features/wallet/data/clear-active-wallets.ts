import { localnetConfig, mainnetConfig } from '@/features/settings/data'
import { clearAccounts } from '@txnlab/use-wallet'

export const clearAllActiveWallets = () => {
  // A fallback cleanup mechanism in the rare case of provider configuration and state being out of sync.
  mainnetConfig.walletProviders.forEach((provider) => {
    clearAccounts(provider)
  })
  localnetConfig.walletProviders.forEach((provider) => {
    clearAccounts(provider)
  })
}
