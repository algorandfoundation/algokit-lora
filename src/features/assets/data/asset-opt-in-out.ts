import { Asset } from '@/features/assets/models'
import { useCallback, useMemo } from 'react'
import { atom, useAtomValue } from 'jotai/index'
import { activeWalletAccountAtom } from '@/features/wallet/data/active-wallet'
import { loadable, useAtomCallback } from 'jotai/utils'
import { algorandClient } from '@/features/common/data/algo-client'
import { toast } from 'react-toastify'
import { asError } from '@/utils/error'

export const useAssetOptInOut = (asset: Asset) => {
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

        try {
          const sendResult = await algorandClient.send.assetOptOut({
            ensureZeroBalance: true,
            assetId: BigInt(asset.id),
            sender: activeAccount.address,
          })
          if (sendResult.confirmation.confirmedRound) {
            toast.success('Asset opt-out successful')
            set(activeWalletAccountAtom)
          } else {
            toast.error(
              sendResult.confirmation.poolError
                ? `Failed to opt-out of asset due to ${sendResult.confirmation.poolError}`
                : 'Failed to opt-out of asset'
            )
          }
        } catch (error) {
          errorHandler(error)
        }
      },
      [asset.id]
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
      [asset.id]
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
