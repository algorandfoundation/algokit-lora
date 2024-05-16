import { AccountResult } from '@/features/accounts/data/types'
import { AccountResultBuilder } from '../builders/account-result-builder'
import { AccountStatus } from '@algorandfoundation/algokit-utils/types/indexer'

export const accountResultMother = {
  ['mainnet-BIQXAK67KSCKN3EJXT4S3RVXUBFOLZ45IQOBTSOQWOSR4LLULBTD54S5IA']: () => {
    return new AccountResultBuilder({
      address: 'BIQXAK67KSCKN3EJXT4S3RVXUBFOLZ45IQOBTSOQWOSR4LLULBTD54S5IA',
      amount: 5883741,
      'amount-without-pending-rewards': 5883741,
      'apps-local-state': [
        {
          id: 1209868169,
          schema: { 'num-byte-slice': 1, 'num-uint': 0 },
        },
        {
          id: 1210178396,
          schema: { 'num-byte-slice': 1, 'num-uint': 0 },
        },
      ],
      'apps-total-schema': { 'num-byte-slice': 2, 'num-uint': 0 },
      assets: [
        { amount: 2002560000, 'asset-id': 924268058, 'is-frozen': false },
        { amount: 0, 'asset-id': 1010208883, 'is-frozen': false },
        { amount: 0, 'asset-id': 1096015467, 'is-frozen': false },
      ],
      'created-apps': [],
      'created-assets': [],
      'min-balance': 700000,
      'pending-rewards': 0,
      'reward-base': 218288,
      rewards: 0,
      round: 38880589,
      status: AccountStatus.Offline,
      'total-apps-opted-in': 2,
      'total-assets-opted-in': 3,
      'total-created-apps': 0,
      'total-created-assets': 0,
    } satisfies AccountResult)
  },

  ['mainnet-JY2FRXQP7Q6SYH7QE2HF2XWNE644V6KUH3PYC4SYWPUSEATTDJSNUHMHR4']: () => {
    return new AccountResultBuilder({
      address: 'JY2FRXQP7Q6SYH7QE2HF2XWNE644V6KUH3PYC4SYWPUSEATTDJSNUHMHR4',
      amount: 12016438084,
      'amount-without-pending-rewards': 12016438084,
      'apps-local-state': [],
      'apps-total-schema': { 'num-byte-slice': 0, 'num-uint': 0 },
      assets: [
        { amount: 0, 'asset-id': 2254146, 'is-frozen': false },
        { amount: 0, 'asset-id': 2254149, 'is-frozen': false },
        { amount: 0, 'asset-id': 2254150, 'is-frozen': false },
        { amount: 0, 'asset-id': 127745593, 'is-frozen': false },
        { amount: 0, 'asset-id': 127746157, 'is-frozen': false },
        { amount: 0, 'asset-id': 127746786, 'is-frozen': false },
        { amount: 1000000000000000000, 'asset-id': 1205372113, 'is-frozen': false },
        { amount: 1000000000000000000, 'asset-id': 1205372555, 'is-frozen': false },
        { amount: 1000000000000000000, 'asset-id': 1205372814, 'is-frozen': false },
      ],
      'created-apps': [],
      'created-assets': [
        {
          index: 1205372113,
          params: {
            clawback: 'JY2FRXQP7Q6SYH7QE2HF2XWNE644V6KUH3PYC4SYWPUSEATTDJSNUHMHR4',
            creator: 'JY2FRXQP7Q6SYH7QE2HF2XWNE644V6KUH3PYC4SYWPUSEATTDJSNUHMHR4',
            decimals: 0,
            'default-frozen': false,
            freeze: 'JY2FRXQP7Q6SYH7QE2HF2XWNE644V6KUH3PYC4SYWPUSEATTDJSNUHMHR4',
            manager: 'JY2FRXQP7Q6SYH7QE2HF2XWNE644V6KUH3PYC4SYWPUSEATTDJSNUHMHR4',
            name: 'World Chess Blitz Ranking',
            reserve: 'JY2FRXQP7Q6SYH7QE2HF2XWNE644V6KUH3PYC4SYWPUSEATTDJSNUHMHR4',
            total: 1000000000000000000,
            'unit-name': 'WCBR',
          },
        },
        {
          index: 1205372555,
          params: {
            clawback: 'JY2FRXQP7Q6SYH7QE2HF2XWNE644V6KUH3PYC4SYWPUSEATTDJSNUHMHR4',
            creator: 'JY2FRXQP7Q6SYH7QE2HF2XWNE644V6KUH3PYC4SYWPUSEATTDJSNUHMHR4',
            decimals: 0,
            'default-frozen': false,
            freeze: 'JY2FRXQP7Q6SYH7QE2HF2XWNE644V6KUH3PYC4SYWPUSEATTDJSNUHMHR4',
            manager: 'JY2FRXQP7Q6SYH7QE2HF2XWNE644V6KUH3PYC4SYWPUSEATTDJSNUHMHR4',
            name: 'World Chess Rapid Ranking',
            reserve: 'JY2FRXQP7Q6SYH7QE2HF2XWNE644V6KUH3PYC4SYWPUSEATTDJSNUHMHR4',
            total: 1000000000000000000,
            'unit-name': 'WCRR',
          },
        },
        {
          index: 1205372814,
          params: {
            clawback: 'JY2FRXQP7Q6SYH7QE2HF2XWNE644V6KUH3PYC4SYWPUSEATTDJSNUHMHR4',
            creator: 'JY2FRXQP7Q6SYH7QE2HF2XWNE644V6KUH3PYC4SYWPUSEATTDJSNUHMHR4',
            decimals: 0,
            'default-frozen': false,
            freeze: 'JY2FRXQP7Q6SYH7QE2HF2XWNE644V6KUH3PYC4SYWPUSEATTDJSNUHMHR4',
            manager: 'JY2FRXQP7Q6SYH7QE2HF2XWNE644V6KUH3PYC4SYWPUSEATTDJSNUHMHR4',
            name: 'World Chess Bullet Ranking',
            reserve: 'JY2FRXQP7Q6SYH7QE2HF2XWNE644V6KUH3PYC4SYWPUSEATTDJSNUHMHR4',
            total: 1000000000000000000,
            'unit-name': 'WCBUR',
          },
        },
      ],
      'min-balance': 1000000,
      'pending-rewards': 0,
      'reward-base': 218288,
      rewards: 0,
      round: 38880776,
      status: AccountStatus.Offline,
      'total-apps-opted-in': 0,
      'total-assets-opted-in': 9,
      'total-created-apps': 0,
      'total-created-assets': 3,
    } satisfies AccountResult)
  },
}
