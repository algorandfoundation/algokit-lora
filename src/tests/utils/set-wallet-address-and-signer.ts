import { AlgorandFixture } from '@algorandfoundation/algokit-utils/types/testing'
import { vi } from 'vitest'
import { useWallet } from '@txnlab/use-wallet'

export const setWalletAddressAndSigner = async (localnet: AlgorandFixture) => {
  const { testAccount } = localnet.context

  const original = await vi.importActual<{ useWallet: () => ReturnType<typeof useWallet> }>('@txnlab/use-wallet')
  vi.mocked(useWallet).mockImplementation(() => {
    return {
      ...original.useWallet(),
      activeAddress: testAccount.addr,
      signer: testAccount.signer,
      status: 'active',
      isActive: true,
      isReady: true,
    }
  })
}
