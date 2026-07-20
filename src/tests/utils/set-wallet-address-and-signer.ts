import { algorandFixture } from '@algorandfoundation/algokit-utils/testing'
import { vi } from 'vitest'
import { useWallet } from '@txnlab/use-wallet-react'
import { decodeUnsignedTransaction } from 'algosdk'

export const setWalletAddressAndSigner = async (localnet: ReturnType<typeof algorandFixture>) => {
  const { testAccount } = localnet.context

  const original = await vi.importActual<{ useWallet: () => ReturnType<typeof useWallet> }>('@txnlab/use-wallet-react')
  vi.mocked(useWallet).mockImplementation(() => {
    return {
      ...original.useWallet(),
      activeAddress: testAccount.addr.toString(),
      signTransactions: ((txnGroup: Uint8Array[], indexesToSign?: number[]) => {
        const decodedTxns = txnGroup.map((bytes) => decodeUnsignedTransaction(bytes))
        return testAccount.signer(decodedTxns, indexesToSign ?? [])
      }) as ReturnType<typeof useWallet>['signTransactions'],
      isReady: true,
    } satisfies ReturnType<typeof useWallet>
  })
}
