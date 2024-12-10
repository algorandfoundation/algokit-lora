import { AccountResult } from '@/features/accounts/data/types'
import { randomBigInt } from '@/utils/random-bigint'
import { AccountStatus } from '@algorandfoundation/algokit-utils/types/indexer'
import { DataBuilder, dossierProxy, randomNumber, randomString } from '@makerx/ts-dossier'

export class AccountResultBuilder extends DataBuilder<AccountResult> {
  constructor(initialState?: AccountResult) {
    super(
      initialState
        ? initialState
        : {
            address: randomString(52, 52),
            amount: randomBigInt(),
            amountWithoutPendingRewards: randomBigInt(),
            appsLocalState: [],
            appsTotalSchema: { numByteSlice: 0, numUint: 0 },
            assets: [],
            createdApps: [],
            createdAssets: [],
            minBalance: randomBigInt(),
            pendingRewards: randomBigInt(),
            rewardBase: randomBigInt(),
            rewards: randomBigInt(),
            round: 38851889n,
            status: AccountStatus.Online,
            totalAppsOptedIn: randomNumber(),
            totalAssetsOptedIn: randomNumber(),
            totalCreatedApps: randomNumber(),
            totalCreatedAssets: randomNumber(),
          }
    )
  }
}

export const accountResultBuilder = dossierProxy<AccountResultBuilder, AccountResult>(AccountResultBuilder)
