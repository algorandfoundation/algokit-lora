import { TransactionResult } from '@/features/transactions/data/types'
import { atom, Atom } from 'jotai'
import { GlobalStateDelta } from '../models'
import { TransactionType as AlgoSdkTransactionType } from 'algosdk'
import { createAppSpecAtom } from '@/features/applications/data/application-method-definitions'
import { asArc56AppSpec } from '@/features/applications/mappers'
import { asGlobalStateDelta } from '../mappers/state-delta-mappers'

export const globalStateDeltaResolver = (transaction: TransactionResult): Atom<Promise<GlobalStateDelta[]>> => {
  return atom(async (get) => {
    if (transaction.txType !== AlgoSdkTransactionType.appl || !transaction.applicationTransaction?.applicationId) {
      return []
    }

    const appSpec = await get(createAppSpecAtom(transaction.applicationTransaction?.applicationId))
    return asGlobalStateDelta(transaction.globalStateDelta, appSpec ? asArc56AppSpec(appSpec) : undefined)
  })
}
