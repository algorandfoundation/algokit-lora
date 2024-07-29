import { clearAccounts, PROVIDER_ID } from '@txnlab/use-wallet'

export const clearAvailableWallets = () => {
  // A fallback cleanup mechanism in the rare case of provider configuration and state being out of sync.
  // A fallback cleanup mechanism in the rare case of provider configuration and state being out of sync.
  Object.values(PROVIDER_ID).forEach((providerId) => {
    clearAccounts(providerId)
  })
}
