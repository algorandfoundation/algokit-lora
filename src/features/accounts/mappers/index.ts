import { AccountResult } from '../data/types'
import { Account } from '../models'
import { asJson } from '@/utils/as-json'
import { microAlgos } from '@algorandfoundation/algokit-utils'

export const asAccount = (accountResult: AccountResult): Account => {
  return {
    address: accountResult.address,
    balance: microAlgos(accountResult.amount),
    minBalance: microAlgos(accountResult['min-balance']),
    totalCreatedAssets: accountResult['total-created-assets'],
    totalCreatedApps: accountResult['total-created-apps'],
    totalAssetsOptedIn: accountResult['total-assets-opted-in'],
    rekeyedTo: accountResult['auth-addr'],
    totalHeldAssets: (accountResult.assets ?? []).length,
    json: asJson(accountResult),
  }
}
