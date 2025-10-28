import { AlgorandFixture } from '@algorandfoundation/algokit-utils/testing'
import { vi } from 'vitest'
import { useWallet } from '@txnlab/use-wallet-react'

export const setWalletAddressAndSigner = async (localnet: AlgorandFixture) => {
  const { testAccount } = localnet.context

  const original = await vi.importActual<{ useWallet: () => ReturnType<typeof useWallet> }>('@txnlab/use-wallet-react')
  vi.mocked(useWallet).mockImplementation(() => {
    return {
      ...original.useWallet(),
      activeAddress: testAccount.addr.toString(),
      transactionSigner: testAccount.signer,
      isReady: true,
    } satisfies ReturnType<typeof useWallet>
  })
}
