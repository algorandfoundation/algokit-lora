import { Asset } from '@/features/assets/models'
import { useWallet } from '@txnlab/use-wallet'
import { useCallback, useMemo } from 'react'
import { atom, useAtomValue } from 'jotai/index'
import { activeWalletAccountAtom } from '@/features/wallet/data/active-wallet-account'
import { loadable, useAtomCallback } from 'jotai/utils'
import algosdk from 'algosdk'
import { AlgorandClient, getTransactionParams, sendTransaction } from '@algorandfoundation/algokit-utils'
import { algod, indexer } from '@/features/common/data/algo-client'
import { toast } from 'react-toastify'
import { asError } from '@/utils/error'

export const useAssetOptInOut = (asset: Asset) => {
  const { signTransactions } = useWallet()

  const status = useMemo(() => {
    return atom(async (get) => {
      const activeAccount = await get(activeWalletAccountAtom)

      if (asset.id === 0 || !activeAccount) {
        return {
          hasActiveAccount: !!activeAccount,
          canOptIn: false,
          canOptOut: false,
        }
      }

      return {
        hasActiveAccount: !!activeAccount,
        canOptIn: !activeAccount.assetHolding.has(asset.id),
        canOptOut: activeAccount.assetHolding.has(asset.id) && activeAccount.assetHolding.get(asset.id)!.amount === 0,
      }
    })
  }, [asset])

  const optOut = useAtomCallback(
    useCallback(
      async (get, set) => {
        const activeAccount = await get(activeWalletAccountAtom)

        if (!activeAccount) {
          return
        }
        const transaction = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
          from: activeAccount.address,
          to: activeAccount.address,
          assetIndex: asset.id,
          amount: 0,
          rekeyTo: undefined,
          revocationTarget: undefined,
          closeRemainderTo: activeAccount.address,
          suggestedParams: await getTransactionParams(undefined, algod),
        })

        const signer = (txnGroup: algosdk.Transaction[], indexesToSign: number[]) => {
          const encodedTransactions = txnGroup.map((txn) => algosdk.encodeUnsignedTransaction(txn))
          return signTransactions(encodedTransactions, indexesToSign)
        }
        const signerAccount = {
          addr: activeAccount.address,
          signer,
        }
        try {
          const { confirmation } = await sendTransaction(
            {
              transaction,
              from: signerAccount,
            },
            algod
          )

          if (confirmation!.confirmedRound) {
            toast.success('Asset opt-out successful')
            set(activeWalletAccountAtom)
          } else {
            toast.error(
              confirmation!.poolError ? `Failed to opt-out of asset due to ${confirmation!.poolError}` : 'Failed to opt-out of asset'
            )
          }
        } catch (error) {
          errorHandler(error)
        }
      },
      [asset.id, signTransactions]
    )
  )

  const optIn = useAtomCallback(
    useCallback(
      async (get, set) => {
        const activeAccount = await get(activeWalletAccountAtom)

        if (!activeAccount) {
          return
        }
        const algorandClient = AlgorandClient.fromClients({
          algod,
          indexer,
        })
        const signer = (txnGroup: algosdk.Transaction[], indexesToSign: number[]) => {
          const encodedTransactions = txnGroup.map((txn) => algosdk.encodeUnsignedTransaction(txn))
          return signTransactions(encodedTransactions, indexesToSign)
        }
        algorandClient.setDefaultSigner(signer)
        try {
          const sendResult = await algorandClient.send.assetOptIn(
            {
              assetId: BigInt(asset.id),
              sender: activeAccount.address,
            },
            {}
          )
          if (sendResult.confirmation.confirmedRound) {
            toast.success('Asset opt-in successful')
            set(activeWalletAccountAtom)
          } else {
            toast.error(
              sendResult.confirmation.poolError
                ? `Failed to opt-in to asset due to ${sendResult.confirmation.poolError}`
                : 'Failed to opt-in to asset'
            )
          }
        } catch (error) {
          errorHandler(error)
        }
      },
      [asset.id, signTransactions]
    )
  )

  return {
    status: useAtomValue(loadable(status)),
    optIn,
    optOut,
  }
}

const errorHandler = (e: unknown) => {
  // eslint-disable-next-line no-console
  console.error(e)

  const error = asError(e)
  toast.error(error.message)
}
