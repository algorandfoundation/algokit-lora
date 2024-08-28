import { Asset } from '@/features/assets/models'
import { useWallet } from '@txnlab/use-wallet'
import { useCallback, useMemo } from 'react'
import { atom, useAtomValue } from 'jotai/index'
import { activeWalletAccountAtom } from '@/features/wallet/data/active-wallet'
import { loadable, useAtomCallback } from 'jotai/utils'
import algosdk from 'algosdk'
import { getTransactionParams, sendTransaction } from '@algorandfoundation/algokit-utils'
import { algod, algorandClient } from '@/features/common/data/algo-client'
import { toast } from 'react-toastify'
import { asError } from '@/utils/error'

// Gives approx 90 seconds to approve the transaction
const transactionValidityWindow = 30

export const useAssetOptInOut = (asset: Asset) => {
  const { signer } = useWallet()

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
        const suggestedParams = await getTransactionParams(undefined, algod)
        const transactionParams = {
          ...suggestedParams,
          lastRound: suggestedParams.firstRound + transactionValidityWindow,
        }

        const transaction = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
          from: activeAccount.address,
          to: activeAccount.address,
          assetIndex: asset.id,
          amount: 0,
          rekeyTo: undefined,
          revocationTarget: undefined,
          closeRemainderTo: activeAccount.address,
          suggestedParams: transactionParams,
        })

        const signerAccount = {
          addr: activeAccount.address,
          signer,
        }
        try {
          const { confirmation } = await sendTransaction(
            {
              transaction,
              from: signerAccount,
              sendParams: {
                maxRoundsToWaitForConfirmation: transactionValidityWindow,
              },
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
      [asset.id, signer]
    )
  )

  const optIn = useAtomCallback(
    useCallback(
      async (get, set) => {
        const activeAccount = await get(activeWalletAccountAtom)

        if (!activeAccount) {
          return
        }

        try {
          const sendResult = await algorandClient.send.assetOptIn({
            assetId: BigInt(asset.id),
            sender: activeAccount.address,
            signer,
            validityWindow: transactionValidityWindow,
          })
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
      [asset.id, signer]
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
