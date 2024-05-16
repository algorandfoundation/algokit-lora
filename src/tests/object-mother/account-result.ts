import { AccountResult } from '@/features/accounts/data/types'
import { AccountResultBuilder } from '../builders/account-result-builder'

export const accountResultMother = {
  ['mainnet-7AHHR4ZMHKMRFUVGLU3SWGKMJBKRUA5UQQUPFWT4WMFO2RLXBUIXZR7FQQ']: () => {
    return new AccountResultBuilder({
      address: '7AHHR4ZMHKMRFUVGLU3SWGKMJBKRUA5UQQUPFWT4WMFO2RLXBUIXZR7FQQ',
      amount: 5854460,
      'amount-without-pending-rewards': 5854460,
      'apps-local-state': [],
      'apps-total-schema': { 'num-byte-slice': 0, 'num-uint': 0 },
      assets: [{ amount: 5177280000, 'asset-id': 924268058, 'is-frozen': false }],
      'created-apps': [],
      'created-assets': [],
      'min-balance': 200000,
      'pending-rewards': 0,
      'reward-base': 218288,
      rewards: 0,
      round: 38851889,
      status: 'Offline',
      'total-apps-opted-in': 0,
      'total-assets-opted-in': 1,
      'total-created-apps': 0,
      'total-created-assets': 0,
    } satisfies AccountResult)
  },
}
