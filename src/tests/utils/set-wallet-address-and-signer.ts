import { AlgorandFixture } from '@algorandfoundation/algokit-utils/types/testing'
import { vi } from 'vitest'
import { useWallet } from '@txnlab/use-wallet-react'
import { TransactionSignerAccount } from '@algorandfoundation/algokit-utils/types/account'

export const setWalletAddressAndSigner = async (localnet: AlgorandFixture): Promise<TransactionSignerAccount> => {
  const { testAccount } = localnet.context
  const walletAccount = localnet.algorand.account.getAccount(testAccount.addr.toString())

  const original = await vi.importActual<{ useWallet: () => ReturnType<typeof useWallet> }>('@txnlab/use-wallet-react')
  vi.mocked(useWallet).mockImplementation(() => {
    return {
      ...original.useWallet(),
      activeAddress: walletAccount.addr.toString(),
      transactionSigner: walletAccount.signer,
      isReady: true,
    } satisfies ReturnType<typeof useWallet>
  })

  return walletAccount
}
