import { TransactionResult } from '@/features/transactions/data/types'
import { atom, Atom } from 'jotai'
import { GlobalStateDelta } from '../models'
import { TransactionType as AlgoSdkTransactionType } from 'algosdk'
import { createAppSpecAtom } from '@/features/applications/data/application-method-definitions'
import { asArc56AppSpec } from '@/features/applications/mappers'
import { asGlobalStateDelta } from '../mappers/state-delta-mappers'

export const globalStateDeltaResolver = (transaction: TransactionResult): Atom<Promise<GlobalStateDelta[]>> => {
  return atom(async (get) => {
    if (transaction['tx-type'] !== AlgoSdkTransactionType.appl || !transaction['application-transaction']?.['application-id']) {
      return []
    }

    const appSpec = await get(createAppSpecAtom(transaction['application-transaction']?.['application-id']))
    return asGlobalStateDelta(transaction['global-state-delta'], appSpec ? asArc56AppSpec(appSpec) : undefined)
  })
}
