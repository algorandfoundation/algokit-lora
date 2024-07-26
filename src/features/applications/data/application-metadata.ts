import { atomsInAtom } from '@/features/common/data'
import { ApplicationId, ApplicationMetadataResult, ApplicationResult } from './types'
import { flattenTransactionResult } from '@/features/transactions/utils/flatten-transaction-result'
import { TransactionResult } from '@algorandfoundation/algokit-utils/types/indexer'
import algosdk, { TransactionType } from 'algosdk'
import { base64ToUtf8 } from '@/utils/base64-to-utf8'
import { parseArc2 } from '@/features/transactions/mappers/arc-2'
import { parseJson } from '@/utils/parse-json'
import { indexer } from '@/features/common/data/algo-client'
import { atom, useSetAtom } from 'jotai'
import { AlgoAppSpec as Arc32AppSpec } from '@/features/arc-32/application'
import { useCallback } from 'react'
import { atomWithStorage } from 'jotai/utils'

const getApplicationMetadataResult = atom(null, async (get, _, applicationResult: ApplicationResult) => {
  // We only need to fetch the first page to find the application creation transaction
  const transactionResults = await indexer
    .searchForTransactions()
    .applicationID(applicationResult.id)
    .limit(3)
    .do()
    .then((res) => res.transactions as TransactionResult[])

  const creationTransaction = transactionResults
    .flatMap((txn) => flattenTransactionResult(txn))
    .find((txn) => txn['tx-type'] === TransactionType.appl && txn['created-application-index'] === applicationResult.id)
  if (!creationTransaction) return null

  const text = base64ToUtf8(creationTransaction.note ?? '')

  const maybeArc2 = parseArc2(text)

  let name = ''
  const methods: algosdk.ABIMethod[] = []

  if (maybeArc2 && maybeArc2.format === 'j') {
    const arc2Data = parseJson(maybeArc2.data)
    if (arc2Data && 'name' in arc2Data) {
      name = arc2Data.name
    }
  }
  if (get(applicationArc32AppSpec)[applicationResult.id]) {
    const arc32AppSpec = get(applicationArc32AppSpec)[applicationResult.id]
    if (arc32AppSpec.contract.name) {
      name = arc32AppSpec.contract.name
    }
    if (arc32AppSpec.contract.methods) {
      methods.push(...arc32AppSpec.contract.methods.map((method) => new algosdk.ABIMethod(method)))
    }
  }

  if (name) {
    return {
      name,
      methods,
    } satisfies ApplicationMetadataResult
  } else {
    return null
  }
})

export const [applicationMetadataResultsAtom, getApplicationMetadataResultAtom] = atomsInAtom(
  getApplicationMetadataResult,
  (applicationResult) => applicationResult.id
)

export const applicationArc32AppSpec = atomWithStorage<Record<ApplicationId, Arc32AppSpec>>('arc32', {}, undefined, {
  getOnInit: true,
})

export const useSetApplicationArc32AppSpec = () => {
  const setApplicationArc32AppSpec = useSetAtom(applicationArc32AppSpec)

  return useCallback(
    (id: ApplicationId, arc32AppSpec: Arc32AppSpec) => {
      setApplicationArc32AppSpec((prev) => ({
        ...prev,
        [id]: arc32AppSpec,
      }))
    },
    [setApplicationArc32AppSpec]
  )
}
