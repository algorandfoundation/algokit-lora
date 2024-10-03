import { Address } from '@/features/accounts/data/types'
import { algorandClient } from '@/features/common/data/algo-client'
import { NetworkConfig } from '@/features/network/data/types'
import { TransactionId } from '@/features/transactions/data/types'
import { activeWalletAccountAtom } from '@/features/wallet/data/active-wallet'
import { invariant } from '@/utils/invariant'
import { microAlgos } from '@algorandfoundation/algokit-utils'
import { AlgoAmount } from '@algorandfoundation/algokit-utils/types/amount'
import { Auth0ContextInterface, useAuth0 } from '@auth0/auth0-react'
import { atom, useAtomValue } from 'jotai'
import { atomWithRefresh, loadable, useAtomCallback } from 'jotai/utils'
import { useCallback, useMemo } from 'react'

type DispenserApiErrorResponse =
  | {
      code:
        | 'dispenser_out_of_funds'
        | 'forbidden'
        | 'authorization_error'
        | 'txn_expired'
        | 'txn_invalid'
        | 'txn_already_processed'
        | 'txn_not_found'
        | 'invalid_asset'
        | 'unexpected_error'
        | 'missing_params'
      message: string
    }
  | {
      code: 'fund_limit_exceeded'
      message: string
      limit: number
      resetsAt: string
    }

const calculateHoursUntilReset = (resetsAt: string): number => {
  const nowUtc = new Date()
  const resetDate = new Date(resetsAt)
  const diffInMillis = resetDate.getTime() - nowUtc.getTime()
  const diffInHours = diffInMillis / (1_000 * 60 * 60)
  const roundedDiffInHours = Math.round(diffInHours * 10) / 10
  return roundedDiffInHours < 0 ? 0 : roundedDiffInHours
}

const handleApiResponse = async <T>(response: Response, mapper: (response: Response) => Promise<T> | T) => {
  if (!response.ok) {
    const statusCode = response.status
    const errorResponse = (await response.json().catch((_) => undefined)) as DispenserApiErrorResponse | undefined
    let errorMessage = `Dispenser API error, ${statusCode}.`
    if (errorResponse) {
      errorMessage = `Dispenser API error, ${errorResponse.message}.`
      if (statusCode === 401) {
        errorMessage = `Unauthorized. Please log out and try again.`
      } else if (errorResponse.code === 'fund_limit_exceeded') {
        const hoursUntilReset = calculateHoursUntilReset(errorResponse.resetsAt)
        errorMessage = `Funding limit exceeded. Try again in ~${hoursUntilReset} hours.`
      }
    }

    throw Error(errorMessage)
  }

  return await mapper(response)
}

const getFundLimit = async (dispenserUrl: string, token: string) => {
  const response = await fetch(`${dispenserUrl}/fund/0/limit`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
    signal: AbortSignal && 'timeout' in AbortSignal ? AbortSignal.timeout(20_000) : undefined,
  })

  return await handleApiResponse(response, async (response) => {
    return microAlgos((await response.json()).amount as number)
  })
}

const fund = async (dispenserUrl: string, token: string, receiver: Address, amount: AlgoAmount) => {
  const response = await fetch(`${dispenserUrl}/fund/0`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      receiver,
      amount: Number(amount.microAlgos), // This conversion is needed as stringify doesn't handle bigint
    }),
    signal: AbortSignal && 'timeout' in AbortSignal ? AbortSignal.timeout(20_000) : undefined,
  })

  await handleApiResponse(response, () => {})
}

const refund = async (dispenserUrl: string, token: string, refundTransactionId: TransactionId) => {
  const response = await fetch(`${dispenserUrl}/refund`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      refundTransactionID: refundTransactionId,
    }),
    signal: AbortSignal && 'timeout' in AbortSignal ? AbortSignal.timeout(20_000) : undefined,
  })

  await handleApiResponse(response, () => {})
}

const createFundLimitAtom = (dispenserUrl: string, getAccessTokenSilently: Auth0ContextInterface['getAccessTokenSilently']) => {
  return atomWithRefresh(async (_get) => {
    const accessToken = await getAccessTokenSilently()
    return getFundLimit(dispenserUrl, accessToken)
  })
}

const useFundLimitAtom = (dispenserUrl: string, getAccessTokenSilently: Auth0ContextInterface['getAccessTokenSilently']) => {
  return useMemo(() => {
    return createFundLimitAtom(dispenserUrl, getAccessTokenSilently)
  }, [dispenserUrl, getAccessTokenSilently])
}

const createRefundStatusAtom = () => {
  return atom(async (get) => {
    const activeAccount = await get(activeWalletAccountAtom)
    // approxLimit = balance - minBalance - likelyTransactionFee
    const approxLimit = Number(activeAccount?.algoHolding.amount ?? 0) - (activeAccount?.minBalance ?? 0) - 1000

    return {
      canRefund: !!activeAccount,
      limit: microAlgos(approxLimit < 0 ? 0 : approxLimit),
    }
  })
}

const useRefundStatusAtom = () => {
  return useMemo(() => {
    return createRefundStatusAtom()
  }, [])
}

export const useDispenserApi = ({ url: dispenserApiUrl, address: dispenserAddress }: NonNullable<NetworkConfig['dispenserApi']>) => {
  const { getAccessTokenSilently } = useAuth0()

  const fundLimitAtom = useFundLimitAtom(dispenserApiUrl, getAccessTokenSilently)

  const fundAccountAndRefreshFundLimit = useAtomCallback(
    useCallback(
      async (_get, set, receiver: Address, amount: AlgoAmount) => {
        const token = await getAccessTokenSilently()

        await fund(dispenserApiUrl, token, receiver, amount)
        set(fundLimitAtom)
      },
      [dispenserApiUrl, fundLimitAtom, getAccessTokenSilently]
    )
  )

  const refundStatusAtom = useRefundStatusAtom()

  const refundDispenserAccount = useAtomCallback(
    useCallback(
      async (get, _set, amount: AlgoAmount) => {
        const activeAccount = await get(activeWalletAccountAtom)

        invariant(activeAccount, 'No active wallet account is available')

        const token = await getAccessTokenSilently()

        const sendResult = await algorandClient.send.payment({
          sender: activeAccount.address,
          receiver: dispenserAddress,
          amount,
        })

        if (!sendResult.confirmation.confirmedRound) {
          throw new Error(`Failed to refund. ${sendResult.confirmation.poolError ?? ''}`)
        }

        await refund(dispenserApiUrl, token, sendResult.transaction.txID())
      },
      [dispenserAddress, dispenserApiUrl, getAccessTokenSilently]
    )
  )

  return {
    fundLimit: useAtomValue(loadable(fundLimitAtom)),
    fundAccount: fundAccountAndRefreshFundLimit,
    refundStatus: useAtomValue(loadable(refundStatusAtom)),
    refundDispenserAccount,
  }
}
