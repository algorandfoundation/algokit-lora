import { describe, expect, it, vi } from 'vitest'
import { transactionResultMother } from '@/tests/object-mother/transaction-result'
import { assetResultMother } from '@/tests/object-mother/asset-result'
import { transactionResultsAtom } from '@/features/transactions/data'
import { createAtomAndTimestamp } from '@/features/common/data'
import { assetResultsAtom } from '@/features/assets/data'
import AuctionAppSpec from '@/features/abi-methods/data/test-app-specs/auction.arc32.json'
import SampleThreeAppSpec from '@/features/abi-methods/data/test-app-specs/sample-three.arc32.json'
import SampleFourAppSpec from '@/features/abi-methods/data/test-app-specs/sample-four.arc32.json'
import { applicationsAppSpecsAtom } from '@/features/abi-methods/data/index'
import { AlgoAppSpec } from '@/features/abi-methods/data/types/arc-32/application'
import { AbiValueType } from '@/features/abi-methods/models'
import { abiMethodResolver } from '@/features/abi-methods/data/abi-method'
import { groupResultMother } from '@/tests/object-mother/group-result'
import { groupResultsAtom } from '@/features/groups/data'

const { myStore } = await vi.hoisted(async () => {
  const { getDefaultStore } = await import('jotai/index')
  const result = getDefaultStore()
  return { myStore: result }
})

vi.mock('@/features/common/data/data-store', async () => {
  const original = await vi.importActual('@/features/common/data/data-store')
  return {
    ...original,
    dataStore: myStore,
  }
})

describe('resolving ABI method', () => {
  describe('for an app call with referenced asset', () => {
    const transaction = transactionResultMother['testnet-QY4K4IC2Z5RQ5OM2LHZH7UAFJJ44VUDSVOIAI67LMVTU4BHODP5A']().build()
    const asset = assetResultMother['testnet-705457144']().build()

    it('should resolve the correct data', async () => {
      myStore.set(transactionResultsAtom, new Map([[transaction.id, createAtomAndTimestamp(transaction)]]))
      myStore.set(assetResultsAtom, new Map([[asset.index, createAtomAndTimestamp(asset)]]))

      const applicationId = transaction['application-transaction']!['application-id']!
      await myStore.set(applicationsAppSpecsAtom(applicationId), {
        applicationId: applicationId,
        appSpecVersions: [
          {
            standard: 'ARC-32',
            appSpec: AuctionAppSpec as unknown as AlgoAppSpec,
          },
        ],
      })

      const abiMethod = await myStore.get(abiMethodResolver(transaction))
      expect(abiMethod).toBeDefined()
      expect(abiMethod!.name).toBe('opt_into_asset')
      expect(abiMethod!.arguments).toStrictEqual([
        {
          name: 'asset',
          type: AbiValueType.Asset,
          value: 705457144,
        },
      ])
      expect(abiMethod!.return).toBe('void')
    })
  })

  describe('for an app call with a reference to another transaction', () => {
    const axferTransaction = transactionResultMother['testnet-5JZDTA4H7SMWADF4TNE447CNBEOJEBZ5ECKEPHH5LEWQ7DMBRGXQ']().build()
    const appCallTransaction = transactionResultMother['testnet-MEF2BZU4JXIU2I7ORQRFZQ3QVT7ZWJ5VQQ4HZ4BWVZK4CEDERQ3A']().build()
    const group = groupResultMother
      .groupWithTransactions([axferTransaction, appCallTransaction])
      .withId('kk6u1A9C9x1roBZOci/4Ne3XtHOtxKRq2O7OLVCbKOc=')
      .withRound(appCallTransaction['confirmed-round']!)
      .build()

    it('should resolve the correct data', async () => {
      myStore.set(groupResultsAtom, new Map([[group.id, createAtomAndTimestamp(group)]]))
      myStore.set(transactionResultsAtom, new Map([[appCallTransaction.id, createAtomAndTimestamp(appCallTransaction)]]))

      const applicationId = appCallTransaction['application-transaction']!['application-id']!
      await myStore.set(applicationsAppSpecsAtom(applicationId), {
        applicationId: applicationId,
        appSpecVersions: [
          {
            standard: 'ARC-32',
            appSpec: AuctionAppSpec as unknown as AlgoAppSpec,
          },
        ],
      })

      const abiMethod = await myStore.get(abiMethodResolver(appCallTransaction))
      expect(abiMethod).toBeDefined()
      expect(abiMethod!.name).toBe('start_auction')
      expect(abiMethod!.arguments).toStrictEqual([
        {
          name: 'starting_price',
          type: AbiValueType.Number,
          value: 10000,
        },
        {
          name: 'length',
          type: AbiValueType.Number,
          value: 36000,
        },
        {
          name: 'axfer',
          type: AbiValueType.Transaction,
          value: '5JZDTA4H7SMWADF4TNE447CNBEOJEBZ5ECKEPHH5LEWQ7DMBRGXQ',
        },
      ])
    })
  })

  describe('for an app call with more than 15 parameters', () => {
    const payTransaction = transactionResultMother['testnet-O3PWUKD7HK23GI2MWSSGQ2F7MKG4VBSS3NNIJFOIF5ABE7YF3BSA']().build()
    const appCallTransaction = transactionResultMother['testnet-QYKMVTOB4JF5PKLGJVYUD3ATSOTMVOHPE36UYDETNUG7LWPEFLKQ']().build()
    const group = groupResultMother
      .groupWithTransactions([payTransaction, appCallTransaction])
      .withId('V5t9TByjm6M6pY9B76O+myDggseVS6bZP1lgizX665w=')
      .withRound(appCallTransaction['confirmed-round']!)
      .build()

    it('should resolve the correct data', async () => {
      myStore.set(groupResultsAtom, new Map([[group.id, createAtomAndTimestamp(group)]]))
      myStore.set(transactionResultsAtom, new Map([[appCallTransaction.id, createAtomAndTimestamp(appCallTransaction)]]))

      const applicationId = appCallTransaction['application-transaction']!['application-id']!
      await myStore.set(applicationsAppSpecsAtom(applicationId), {
        applicationId: applicationId,
        appSpecVersions: [
          {
            standard: 'ARC-32',
            appSpec: SampleThreeAppSpec as unknown as AlgoAppSpec,
          },
        ],
      })

      const abiMethod = await myStore.get(abiMethodResolver(appCallTransaction))
      expect(abiMethod).toBeDefined()
      expect(abiMethod!.name).toBe('test_ref_types_in_big_method')
      expect(abiMethod!.arguments).toStrictEqual([
        {
          name: 'a1',
          type: AbiValueType.Number,
          value: 1,
        },
        {
          name: 'a2',
          type: AbiValueType.Number,
          value: 2,
        },
        {
          name: 'a3',
          type: AbiValueType.Number,
          value: 3,
        },
        {
          name: 'a4',
          type: AbiValueType.Number,
          value: 4,
        },
        {
          name: 'a5',
          type: AbiValueType.Number,
          value: 5,
        },
        {
          name: 'a6',
          type: AbiValueType.Number,
          value: 6,
        },
        {
          name: 'a7',
          type: AbiValueType.Number,
          value: 7,
        },
        {
          name: 'a8',
          type: AbiValueType.Number,
          value: 8,
        },
        {
          name: 'a9',
          type: AbiValueType.Number,
          value: 9,
        },
        {
          name: 'a10',
          type: AbiValueType.Number,
          value: 10,
        },
        {
          name: 'a11',
          type: AbiValueType.Number,
          value: 11,
        },
        {
          name: 'a12',
          type: AbiValueType.Number,
          value: 12,
        },
        {
          name: 'a13',
          type: AbiValueType.Number,
          value: 13,
        },
        {
          name: 'a14',
          type: AbiValueType.Number,
          value: 14,
        },
        {
          name: 'a15',
          type: AbiValueType.Number,
          value: 15,
        },
        {
          name: 'a16',
          type: AbiValueType.Number,
          value: 16,
        },
        {
          name: 'a17',
          type: AbiValueType.Number,
          value: 17,
        },
        {
          name: 'asset',
          type: AbiValueType.Asset,
          value: 705457144,
        },
        {
          name: 'a18',
          type: AbiValueType.Number,
          value: 18,
        },
        {
          name: 'application',
          type: AbiValueType.Application,
          value: 705410358,
        },
        {
          name: 'pay',
          type: AbiValueType.Transaction,
          value: 'O3PWUKD7HK23GI2MWSSGQ2F7MKG4VBSS3NNIJFOIF5ABE7YF3BSA',
        },
        {
          name: 'account',
          type: AbiValueType.Account,
          value: '25M5BT2DMMED3V6CWDEYKSNEFGPXX4QBIINCOICLXXRU3UGTSGRMF3MTOE',
        },
      ])
      expect(abiMethod!.return).toStrictEqual({
        type: AbiValueType.Tuple,
        value: [
          { type: AbiValueType.Number, value: 705457144 },
          { type: AbiValueType.Number, value: 705410358 },
          { type: AbiValueType.Number, value: 9780000 },
          {
            type: AbiValueType.Array,
            value: [
              { type: AbiValueType.Number, value: 118 },
              { type: AbiValueType.Number, value: 223 },
              { type: AbiValueType.Number, value: 106 },
              { type: AbiValueType.Number, value: 40 },
              { type: AbiValueType.Number, value: 127 },
              { type: AbiValueType.Number, value: 58 },
              { type: AbiValueType.Number, value: 181 },
              { type: AbiValueType.Number, value: 179 },
              { type: AbiValueType.Number, value: 35 },
              { type: AbiValueType.Number, value: 76 },
              { type: AbiValueType.Number, value: 180 },
              { type: AbiValueType.Number, value: 164 },
              { type: AbiValueType.Number, value: 104 },
              { type: AbiValueType.Number, value: 104 },
              { type: AbiValueType.Number, value: 191 },
              { type: AbiValueType.Number, value: 98 },
              { type: AbiValueType.Number, value: 141 },
              { type: AbiValueType.Number, value: 202 },
              { type: AbiValueType.Number, value: 134 },
              { type: AbiValueType.Number, value: 82 },
              { type: AbiValueType.Number, value: 219 },
              { type: AbiValueType.Number, value: 90 },
              { type: AbiValueType.Number, value: 132 },
              { type: AbiValueType.Number, value: 149 },
              { type: AbiValueType.Number, value: 200 },
              { type: AbiValueType.Number, value: 47 },
              { type: AbiValueType.Number, value: 64 },
              { type: AbiValueType.Number, value: 18 },
              { type: AbiValueType.Number, value: 127 },
              { type: AbiValueType.Number, value: 5 },
              { type: AbiValueType.Number, value: 216 },
              { type: AbiValueType.Number, value: 100 },
            ],
          },
        ],
      })
    })
  })

  describe('for an app all with nested array and tuple arguments', () => {
    const transaction = transactionResultMother['testnet-QLQS5F2U2OZJQJVQWZE5F6DKPDMY4LXEKHWE6NFHGTWJJGKKFA7A']().build()

    it('should resolve the correct data', async () => {
      myStore.set(transactionResultsAtom, new Map([[transaction.id, createAtomAndTimestamp(transaction)]]))

      const applicationId = transaction['application-transaction']!['application-id']!
      await myStore.set(applicationsAppSpecsAtom(applicationId), {
        applicationId: applicationId,
        appSpecVersions: [
          {
            standard: 'ARC-32',
            appSpec: SampleFourAppSpec as unknown as AlgoAppSpec,
          },
        ],
      })

      const abiMethod = await myStore.get(abiMethodResolver(transaction))
      expect(abiMethod).toBeDefined()
      expect(abiMethod!.name).toBe('nest_array_and_tuple')
      expect(abiMethod!.arguments).toStrictEqual([
        {
          name: 'arr',
          type: AbiValueType.Array,
          value: [
            {
              type: AbiValueType.Array,
              value: [
                { type: AbiValueType.Number, value: 1 },
                { type: AbiValueType.Number, value: 2 },
                { type: AbiValueType.Number, value: 3 },
                { type: AbiValueType.Number, value: 4 },
                { type: AbiValueType.Number, value: 5 },
              ],
            },
            {
              type: AbiValueType.Array,
              value: [
                { type: AbiValueType.Number, value: 6 },
                { type: AbiValueType.Number, value: 7 },
                { type: AbiValueType.Number, value: 8 },
                { type: AbiValueType.Number, value: 9 },
                { type: AbiValueType.Number, value: 10 },
              ],
            },
            {
              type: AbiValueType.Array,
              value: [
                { type: AbiValueType.Number, value: 111 },
                { type: AbiValueType.Number, value: 222 },
                { type: AbiValueType.Number, value: 333 },
                { type: AbiValueType.Number, value: 444 },
                { type: AbiValueType.Number, value: 555 },
              ],
            },
          ],
        },
        {
          name: 'tuple',
          type: AbiValueType.Tuple,
          value: [
            {
              type: AbiValueType.Array,
              value: [
                { type: AbiValueType.Number, value: 666 },
                { type: AbiValueType.Number, value: 777 },
                { type: AbiValueType.Number, value: 888 },
                { type: AbiValueType.Number, value: 999 },
                { type: AbiValueType.Number, value: 1111 },
              ],
            },
            {
              type: AbiValueType.String,
              value:
                'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
            },
          ],
        },
      ])
    })
  })
})
