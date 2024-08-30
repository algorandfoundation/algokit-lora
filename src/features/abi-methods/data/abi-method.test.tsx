import { describe, expect, it, vi } from 'vitest'
import { transactionResultMother } from '@/tests/object-mother/transaction-result'
import { assetResultMother } from '@/tests/object-mother/asset-result'
import { transactionResultsAtom } from '@/features/transactions/data'
import { createReadOnlyAtomAndTimestamp, createTimestamp } from '@/features/common/data'
import { assetResultsAtom } from '@/features/assets/data'
import AuctionAppSpec from '@/tests/test-app-specs/auction.arc32.json'
import SampleThreeAppSpec from '@/tests/test-app-specs/sample-three.arc32.json'
import SampleFourAppSpec from '@/tests/test-app-specs/sample-four.arc32.json'
import { appInterfacesAtom } from '@/features/app-interfaces/data'
import { AppSpecStandard, Arc32AppSpec } from '@/features/app-interfaces/data/types'
import { AbiType } from '@/features/abi-methods/models'
import { abiMethodResolver } from '@/features/abi-methods/data'
import { groupResultMother } from '@/tests/object-mother/group-result'
import { groupResultsAtom } from '@/features/groups/data'
import { AppInterfaceEntity } from '@/features/common/data/indexed-db'
import { atom } from 'jotai/index'
import { genesisHashAtom } from '@/features/blocks/data'

const { myStore } = await vi.hoisted(async () => {
  const { getDefaultStore } = await import('jotai/index')
  return { myStore: getDefaultStore() }
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
      myStore.set(transactionResultsAtom, new Map([[transaction.id, createReadOnlyAtomAndTimestamp(transaction)]]))
      myStore.set(assetResultsAtom, new Map([[asset.index, createReadOnlyAtomAndTimestamp(asset)]]))

      const applicationId = transaction['application-transaction']!['application-id']!
      myStore.set(
        appInterfacesAtom,
        new Map([
          [
            applicationId,
            createAppInterfaceAtomAndTimestamp({
              applicationId: applicationId,
              name: 'test',
              appSpecVersions: [
                {
                  standard: AppSpecStandard.ARC32,
                  appSpec: AuctionAppSpec as unknown as Arc32AppSpec,
                },
              ],
              lastModified: createTimestamp(),
            } satisfies AppInterfaceEntity),
          ],
        ])
      )

      const abiMethod = await myStore.get(abiMethodResolver(transaction))
      expect(abiMethod).toBeDefined()
      expect(abiMethod!.name).toBe('opt_into_asset')
      expect(abiMethod!.arguments).toStrictEqual([
        {
          name: 'asset',
          type: AbiType.Asset,
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
      myStore.set(groupResultsAtom, new Map([[group.id, createReadOnlyAtomAndTimestamp(group)]]))
      myStore.set(transactionResultsAtom, new Map([[appCallTransaction.id, createReadOnlyAtomAndTimestamp(appCallTransaction)]]))

      const applicationId = appCallTransaction['application-transaction']!['application-id']!
      myStore.set(
        appInterfacesAtom,
        new Map([
          [
            applicationId,
            createAppInterfaceAtomAndTimestamp({
              applicationId: applicationId,
              name: 'test',
              appSpecVersions: [
                {
                  standard: AppSpecStandard.ARC32,
                  appSpec: AuctionAppSpec as unknown as Arc32AppSpec,
                },
              ],
              lastModified: createTimestamp(),
            } satisfies AppInterfaceEntity),
          ],
        ])
      )

      const abiMethod = await myStore.get(abiMethodResolver(appCallTransaction))
      expect(abiMethod).toBeDefined()
      expect(abiMethod!.name).toBe('start_auction')
      expect(abiMethod!.arguments).toStrictEqual([
        {
          name: 'starting_price',
          type: AbiType.Number,
          value: 10000,
        },
        {
          name: 'length',
          type: AbiType.Number,
          value: 36000,
        },
        {
          name: 'axfer',
          type: AbiType.Transaction,
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
      myStore.set(groupResultsAtom, new Map([[group.id, createReadOnlyAtomAndTimestamp(group)]]))
      myStore.set(transactionResultsAtom, new Map([[appCallTransaction.id, createReadOnlyAtomAndTimestamp(appCallTransaction)]]))

      const applicationId = appCallTransaction['application-transaction']!['application-id']!
      myStore.set(
        appInterfacesAtom,
        new Map([
          [
            applicationId,
            createAppInterfaceAtomAndTimestamp({
              applicationId: applicationId,
              name: 'test',
              appSpecVersions: [
                {
                  standard: AppSpecStandard.ARC32,
                  appSpec: SampleThreeAppSpec as unknown as Arc32AppSpec,
                },
              ],
              lastModified: createTimestamp(),
            } satisfies AppInterfaceEntity),
          ],
        ])
      )

      const abiMethod = await myStore.get(abiMethodResolver(appCallTransaction))
      expect(abiMethod).toBeDefined()
      expect(abiMethod!.name).toBe('test_ref_types_in_big_method')
      expect(abiMethod!.arguments).toStrictEqual([
        {
          name: 'a1',
          type: AbiType.Number,
          value: 1,
        },
        {
          name: 'a2',
          type: AbiType.Number,
          value: 2,
        },
        {
          name: 'a3',
          type: AbiType.Number,
          value: 3,
        },
        {
          name: 'a4',
          type: AbiType.Number,
          value: 4,
        },
        {
          name: 'a5',
          type: AbiType.Number,
          value: 5,
        },
        {
          name: 'a6',
          type: AbiType.Number,
          value: 6,
        },
        {
          name: 'a7',
          type: AbiType.Number,
          value: 7,
        },
        {
          name: 'a8',
          type: AbiType.Number,
          value: 8,
        },
        {
          name: 'a9',
          type: AbiType.Number,
          value: 9,
        },
        {
          name: 'a10',
          type: AbiType.Number,
          value: 10,
        },
        {
          name: 'a11',
          type: AbiType.Number,
          value: 11,
        },
        {
          name: 'a12',
          type: AbiType.Number,
          value: 12,
        },
        {
          name: 'a13',
          type: AbiType.Number,
          value: 13,
        },
        {
          name: 'a14',
          type: AbiType.Number,
          value: 14,
        },
        {
          name: 'a15',
          type: AbiType.Number,
          value: 15,
        },
        {
          name: 'a16',
          type: AbiType.Number,
          value: 16,
        },
        {
          name: 'a17',
          type: AbiType.Number,
          value: 17,
        },
        {
          name: 'asset',
          type: AbiType.Asset,
          value: 705457144,
        },
        {
          name: 'a18',
          type: AbiType.Number,
          value: 18,
        },
        {
          name: 'application',
          type: AbiType.Application,
          value: 705410358,
        },
        {
          name: 'pay',
          type: AbiType.Transaction,
          value: 'O3PWUKD7HK23GI2MWSSGQ2F7MKG4VBSS3NNIJFOIF5ABE7YF3BSA',
        },
        {
          name: 'account',
          type: AbiType.Account,
          value: '25M5BT2DMMED3V6CWDEYKSNEFGPXX4QBIINCOICLXXRU3UGTSGRMF3MTOE',
        },
      ])
      expect(abiMethod!.return).toStrictEqual({
        type: AbiType.Tuple,
        values: [
          { type: AbiType.Number, value: 705457144 },
          { type: AbiType.Number, value: 705410358 },
          { type: AbiType.Number, value: 9780000 },
          {
            type: AbiType.Array,
            values: [
              { type: AbiType.Number, value: 118 },
              { type: AbiType.Number, value: 223 },
              { type: AbiType.Number, value: 106 },
              { type: AbiType.Number, value: 40 },
              { type: AbiType.Number, value: 127 },
              { type: AbiType.Number, value: 58 },
              { type: AbiType.Number, value: 181 },
              { type: AbiType.Number, value: 179 },
              { type: AbiType.Number, value: 35 },
              { type: AbiType.Number, value: 76 },
              { type: AbiType.Number, value: 180 },
              { type: AbiType.Number, value: 164 },
              { type: AbiType.Number, value: 104 },
              { type: AbiType.Number, value: 104 },
              { type: AbiType.Number, value: 191 },
              { type: AbiType.Number, value: 98 },
              { type: AbiType.Number, value: 141 },
              { type: AbiType.Number, value: 202 },
              { type: AbiType.Number, value: 134 },
              { type: AbiType.Number, value: 82 },
              { type: AbiType.Number, value: 219 },
              { type: AbiType.Number, value: 90 },
              { type: AbiType.Number, value: 132 },
              { type: AbiType.Number, value: 149 },
              { type: AbiType.Number, value: 200 },
              { type: AbiType.Number, value: 47 },
              { type: AbiType.Number, value: 64 },
              { type: AbiType.Number, value: 18 },
              { type: AbiType.Number, value: 127 },
              { type: AbiType.Number, value: 5 },
              { type: AbiType.Number, value: 216 },
              { type: AbiType.Number, value: 100 },
            ],
          },
        ],
      })
    })
  })

  describe('for an app all with nested array and tuple arguments', () => {
    const transaction = transactionResultMother['testnet-QLQS5F2U2OZJQJVQWZE5F6DKPDMY4LXEKHWE6NFHGTWJJGKKFA7A']().build()

    it('should resolve the correct data', async () => {
      myStore.set(transactionResultsAtom, new Map([[transaction.id, createReadOnlyAtomAndTimestamp(transaction)]]))

      const applicationId = transaction['application-transaction']!['application-id']!
      myStore.set(
        appInterfacesAtom,
        new Map([
          [
            applicationId,
            createAppInterfaceAtomAndTimestamp({
              applicationId: applicationId,
              name: 'test',
              appSpecVersions: [
                {
                  standard: AppSpecStandard.ARC32,
                  appSpec: SampleFourAppSpec as unknown as Arc32AppSpec,
                },
              ],
              lastModified: createTimestamp(),
            } satisfies AppInterfaceEntity),
          ],
        ])
      )

      const abiMethod = await myStore.get(abiMethodResolver(transaction))
      expect(abiMethod).toBeDefined()
      expect(abiMethod!.name).toBe('nest_array_and_tuple')
      expect(abiMethod!.arguments).toStrictEqual([
        {
          name: 'arr',
          type: AbiType.Array,
          values: [
            {
              type: AbiType.Array,
              values: [
                { type: AbiType.Number, value: 1 },
                { type: AbiType.Number, value: 2 },
                { type: AbiType.Number, value: 3 },
                { type: AbiType.Number, value: 4 },
                { type: AbiType.Number, value: 5 },
              ],
            },
            {
              type: AbiType.Array,
              values: [
                { type: AbiType.Number, value: 6 },
                { type: AbiType.Number, value: 7 },
                { type: AbiType.Number, value: 8 },
                { type: AbiType.Number, value: 9 },
                { type: AbiType.Number, value: 10 },
              ],
            },
            {
              type: AbiType.Array,
              values: [
                { type: AbiType.Number, value: 111 },
                { type: AbiType.Number, value: 222 },
                { type: AbiType.Number, value: 333 },
                { type: AbiType.Number, value: 444 },
                { type: AbiType.Number, value: 555 },
              ],
            },
          ],
        },
        {
          name: 'tuple',
          type: AbiType.Tuple,
          values: [
            {
              type: AbiType.Array,
              values: [
                { type: AbiType.Number, value: 666 },
                { type: AbiType.Number, value: 777 },
                { type: AbiType.Number, value: 888 },
                { type: AbiType.Number, value: 999 },
                { type: AbiType.Number, value: 1111 },
              ],
            },
            {
              type: AbiType.String,
              value:
                'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
            },
          ],
        },
      ])
    })
  })

  describe('for an create application transaction received from algod', () => {
    const transaction = transactionResultMother['localnet-AV37TJVLBWXPI3EAUJJSDTAIQX22ECPMVADIOCR47TTRCPVPRG3Q']().build()

    it('abiMethod should be undefined', async () => {
      myStore.set(transactionResultsAtom, new Map([[transaction.id, createReadOnlyAtomAndTimestamp(transaction)]]))
      myStore.set(genesisHashAtom, 'some-hash')

      const abiMethod = await myStore.get(abiMethodResolver(transaction))
      expect(abiMethod).toBeUndefined()
    })
  })
})

function createAppInterfaceAtomAndTimestamp(appInterface: AppInterfaceEntity) {
  return [
    atom(
      () => appInterface,
      () => {
        return Promise.resolve()
      }
    ),
    createTimestamp(),
  ] as const
}
