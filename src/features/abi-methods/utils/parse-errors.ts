import { getApplicationResultAtom } from '@/features/applications/data'
import { dataStore } from '@/features/common/data/data-store'
import { BuildableTransactionType, BuildMethodCallTransactionResult, BuildTransactionResult } from '@/features/transaction-wizard/models'
import { asError } from '@/utils/error'
import { AppClient } from '@algorandfoundation/algokit-utils/types/app-client'
import algosdk from 'algosdk'

type URLTokenBaseHTTPError = {
  name: 'URLTokenBaseHTTPError'
  response: {
    body: {
      data: {
        ['app-index']: number
        ['group-index']: number
      }
    }
  }
}

type SimulateError = Error & {
  simulateResponse: algosdk.modelsv2.SimulateResponse
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isURLTokenBaseHTTPError = (e: any): e is URLTokenBaseHTTPError => {
  return (
    e.name === 'URLTokenBaseHTTPError' &&
    e.response?.body?.data &&
    e.response.body.data['app-index'] !== undefined &&
    e.response.body.data['group-index'] !== undefined
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isSimulateError = (e: any): e is SimulateError => {
  return e.simulateResponse !== undefined
}

export const parseCallAbiMethodError = async (e: unknown, transactions: BuildTransactionResult[]): Promise<Error> => {
  if (!isURLTokenBaseHTTPError(e)) {
    return asError(e)
  }

  const groupIndex = e.response.body.data['group-index']
  const transaction = transactions[groupIndex]
  if (!transaction || transaction.type !== BuildableTransactionType.MethodCall) {
    return asError(e)
  }

  return parseErrorForTransaction(e, groupIndex, transaction)
}

export const parseSimulateAbiMethodError = async (e: unknown, transactions: BuildTransactionResult[]): Promise<Error> => {
  if (
    !isSimulateError(e) ||
    e.simulateResponse.txnGroups.length === 0 ||
    e.simulateResponse.txnGroups[0].failedAt === undefined ||
    e.simulateResponse.txnGroups[0].failedAt.length === 0
  ) {
    return asError(e)
  }

  // When there are multiple errors, the failedAt array will only have one element
  const groupIndex = Number(e.simulateResponse.txnGroups[0].failedAt[0])
  const transaction = transactions[groupIndex]
  if (!transaction || transaction.type !== BuildableTransactionType.MethodCall) {
    return asError(e)
  }

  return parseErrorForTransaction(e, groupIndex, transaction)
}

const parseErrorForTransaction = async (e: unknown, groupIndex: number, transaction: BuildMethodCallTransactionResult) => {
  const applicationResult = await dataStore.get(getApplicationResultAtom(transaction.applicationId))
  const logicError = AppClient.exposeLogicError(
    asError(e),
    transaction.appSpec,
    transaction.onComplete === algosdk.OnApplicationComplete.ClearStateOC
      ? {
          isClearStateProgram: true,
          program: applicationResult.params.clearStateProgram,
        }
      : {
          isClearStateProgram: false,
          program: applicationResult.params.approvalProgram,
        }
  )

  const tealErrorMessage = extractErrorMessage(logicError.message)
  if (!tealErrorMessage) {
    return asError(e)
  }

  return new Error(`Error in transaction ${groupIndex + 1}: ${tealErrorMessage}`)
}

const extractErrorMessage = (errorString: string): string | undefined => {
  const regex = /Runtime error.+: (.+)$/
  const match = errorString.match(regex)
  return match?.[1] || undefined
}
