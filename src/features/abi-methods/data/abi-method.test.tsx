import { beforeEach, describe, expect, it, vi } from 'vitest'
import { transactionResultMother } from '@/tests/object-mother/transaction-result'
import { assetResultMother } from '@/tests/object-mother/asset-result'
import { transactionResultsAtom } from '@/features/transactions/data'
import { createReadOnlyAtomAndTimestamp, createTimestamp } from '@/features/common/data'
import { assetResultsAtom } from '@/features/assets/data'
import AuctionAppSpecArc32 from '@/tests/test-app-specs/auction.arc32.json'
import AuctionAppSpecArc4 from '@/tests/test-app-specs/auction.arc4.json'
import SampleThreeAppSpec from '@/tests/test-app-specs/sample-three.arc32.json'
import SampleFourAppSpec from '@/tests/test-app-specs/sample-four.arc32.json'
import { AppSpecStandard, Arc32AppSpec, Arc4AppSpec } from '@/features/app-interfaces/data/types'
import { AbiType } from '@/features/abi-methods/models'
import { abiMethodResolver } from '@/features/abi-methods/data'
import { groupResultMother } from '@/tests/object-mother/group-result'
import { getGroupResultAtom, groupResultsAtom } from '@/features/groups/data'
import { AppInterfaceEntity, dbConnectionAtom } from '@/features/common/data/indexed-db'
import { writeAppInterface } from '@/features/app-interfaces/data'
import { genesisHashAtom } from '@/features/blocks/data'

const myStore = await vi.hoisted(async () => {
  const { getDefaultStore } = await import('jotai/index')
  const myStore = getDefaultStore()
  return myStore
})

vi.mock('@/features/common/data/data-store', async () => {
  const original = await vi.importActual('@/features/common/data/data-store')
  return {
    ...original,
    dataStore: myStore,
  }
})

describe('resolving ABI method', () => {
  beforeEach(() => {
    myStore.set(genesisHashAtom, 'some-hash')
  })

  describe('for an app call with referenced asset', () => {
    const transaction = transactionResultMother['testnet-QY4K4IC2Z5RQ5OM2LHZH7UAFJJ44VUDSVOIAI67LMVTU4BHODP5A']().build()
    const asset = assetResultMother['testnet-705457144']().build()

    it('should resolve the correct data with arc32 appspec', async () => {
      myStore.set(transactionResultsAtom, new Map([[transaction.id, createReadOnlyAtomAndTimestamp(transaction)]]))
      myStore.set(assetResultsAtom, new Map([[asset.index, createReadOnlyAtomAndTimestamp(asset)]]))

      const applicationId = transaction['application-transaction']!['application-id']!
      const dbConnection = await myStore.get(dbConnectionAtom)
      await writeAppInterface(dbConnection, {
        applicationId: applicationId,
        name: 'test',
        appSpecVersions: [
          {
            standard: AppSpecStandard.ARC32,
            appSpec: AuctionAppSpecArc32 as unknown as Arc32AppSpec,
          },
        ],
        lastModified: createTimestamp(),
      } satisfies AppInterfaceEntity)

      const abiMethod = await myStore.get(abiMethodResolver(transaction, getGroupResultAtom))
      expect(abiMethod).toBeDefined()
      expect(abiMethod!.name).toBe('opt_into_asset')
      expect(abiMethod!.arguments).toStrictEqual([
        {
          name: 'asset',
          type: AbiType.Asset,
          value: 705457144,
          length: 9,
          multiline: false,
        },
      ])
      expect(abiMethod!.return).toBe('void')
    })

    it('should resolve the correct data with arc4 appspec', async () => {
      myStore.set(transactionResultsAtom, new Map([[transaction.id, createReadOnlyAtomAndTimestamp(transaction)]]))
      myStore.set(assetResultsAtom, new Map([[asset.index, createReadOnlyAtomAndTimestamp(asset)]]))

      const applicationId = transaction['application-transaction']!['application-id']!
      const dbConnection = await myStore.get(dbConnectionAtom)
      await writeAppInterface(dbConnection, {
        applicationId: applicationId,
        name: 'test',
        appSpecVersions: [
          {
            standard: AppSpecStandard.ARC4,
            appSpec: AuctionAppSpecArc4 as unknown as Arc4AppSpec,
          },
        ],
        lastModified: createTimestamp(),
      } satisfies AppInterfaceEntity)

      const abiMethod = await myStore.get(abiMethodResolver(transaction, getGroupResultAtom))
      expect(abiMethod).toBeDefined()
      expect(abiMethod!.name).toBe('opt_into_asset')
      expect(abiMethod!.arguments).toStrictEqual([
        {
          name: 'asset',
          type: AbiType.Asset,
          value: 705457144,
          length: 9,
          multiline: false,
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

    it('should resolve the correct data with arc32 appspec', async () => {
      myStore.set(groupResultsAtom, new Map([[group.id, createReadOnlyAtomAndTimestamp(group)]]))
      myStore.set(transactionResultsAtom, new Map([[appCallTransaction.id, createReadOnlyAtomAndTimestamp(appCallTransaction)]]))

      const applicationId = appCallTransaction['application-transaction']!['application-id']!
      const dbConnection = await myStore.get(dbConnectionAtom)
      await writeAppInterface(dbConnection, {
        applicationId: applicationId,
        name: 'test',
        appSpecVersions: [
          {
            standard: AppSpecStandard.ARC32,
            appSpec: AuctionAppSpecArc32 as unknown as Arc32AppSpec,
          },
        ],
        lastModified: createTimestamp(),
      } satisfies AppInterfaceEntity)

      const abiMethod = await myStore.get(abiMethodResolver(appCallTransaction, getGroupResultAtom))
      expect(abiMethod).toBeDefined()
      expect(abiMethod!.name).toBe('start_auction')
      expect(abiMethod!.arguments).toStrictEqual([
        {
          name: 'starting_price',
          type: AbiType.Uint,
          value: 10000n,
          length: 5,
          multiline: false,
        },
        {
          name: 'length',
          type: AbiType.Uint,
          value: 36000n,
          length: 5,
          multiline: false,
        },
        {
          name: 'axfer',
          type: AbiType.Transaction,
          value: '5JZDTA4H7SMWADF4TNE447CNBEOJEBZ5ECKEPHH5LEWQ7DMBRGXQ',
          length: 52,
          multiline: false,
        },
      ])
    })

    it('should resolve the correct data with arc4 appspec', async () => {
      myStore.set(groupResultsAtom, new Map([[group.id, createReadOnlyAtomAndTimestamp(group)]]))
      myStore.set(transactionResultsAtom, new Map([[appCallTransaction.id, createReadOnlyAtomAndTimestamp(appCallTransaction)]]))

      const applicationId = appCallTransaction['application-transaction']!['application-id']!
      const dbConnection = await myStore.get(dbConnectionAtom)
      await writeAppInterface(dbConnection, {
        applicationId: applicationId,
        name: 'test',
        appSpecVersions: [
          {
            standard: AppSpecStandard.ARC4,
            appSpec: AuctionAppSpecArc4 as unknown as Arc4AppSpec,
          },
        ],
        lastModified: createTimestamp(),
      } satisfies AppInterfaceEntity)

      const abiMethod = await myStore.get(abiMethodResolver(appCallTransaction, getGroupResultAtom))
      expect(abiMethod).toBeDefined()
      expect(abiMethod!.name).toBe('start_auction')
      expect(abiMethod!.arguments).toStrictEqual([
        {
          name: 'starting_price',
          type: AbiType.Uint,
          value: 10000n,
          length: 5,
          multiline: false,
        },
        {
          name: 'length',
          type: AbiType.Uint,
          value: 36000n,
          length: 5,
          multiline: false,
        },
        {
          name: 'axfer',
          type: AbiType.Transaction,
          value: '5JZDTA4H7SMWADF4TNE447CNBEOJEBZ5ECKEPHH5LEWQ7DMBRGXQ',
          length: 52,
          multiline: false,
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
      const dbConnection = await myStore.get(dbConnectionAtom)
      await writeAppInterface(dbConnection, {
        applicationId: applicationId,
        name: 'test',
        appSpecVersions: [
          {
            standard: AppSpecStandard.ARC32,
            appSpec: SampleThreeAppSpec as unknown as Arc32AppSpec,
          },
        ],
        lastModified: createTimestamp(),
      } satisfies AppInterfaceEntity)

      const abiMethod = await myStore.get(abiMethodResolver(appCallTransaction, getGroupResultAtom))
      expect(abiMethod).toBeDefined()
      expect(abiMethod!.name).toBe('test_ref_types_in_big_method')
      expect(abiMethod!.arguments).toStrictEqual([
        {
          name: 'a1',
          type: AbiType.Uint,
          value: 1n,
          length: 1,
          multiline: false,
        },
        {
          name: 'a2',
          type: AbiType.Uint,
          value: 2n,
          length: 1,
          multiline: false,
        },
        {
          name: 'a3',
          type: AbiType.Uint,
          value: 3n,
          length: 1,
          multiline: false,
        },
        {
          name: 'a4',
          type: AbiType.Uint,
          value: 4n,
          length: 1,
          multiline: false,
        },
        {
          name: 'a5',
          type: AbiType.Uint,
          value: 5n,
          length: 1,
          multiline: false,
        },
        {
          name: 'a6',
          type: AbiType.Uint,
          value: 6n,
          length: 1,
          multiline: false,
        },
        {
          name: 'a7',
          type: AbiType.Uint,
          value: 7n,
          length: 1,
          multiline: false,
        },
        {
          name: 'a8',
          type: AbiType.Uint,
          value: 8n,
          length: 1,
          multiline: false,
        },
        {
          name: 'a9',
          type: AbiType.Uint,
          value: 9n,
          length: 1,
          multiline: false,
        },
        {
          name: 'a10',
          type: AbiType.Uint,
          value: 10n,
          length: 2,
          multiline: false,
        },
        {
          name: 'a11',
          type: AbiType.Uint,
          value: 11n,
          length: 2,
          multiline: false,
        },
        {
          name: 'a12',
          type: AbiType.Uint,
          value: 12n,
          length: 2,
          multiline: false,
        },
        {
          name: 'a13',
          type: AbiType.Uint,
          value: 13n,
          length: 2,
          multiline: false,
        },
        {
          name: 'a14',
          type: AbiType.Uint,
          value: 14n,
          length: 2,
          multiline: false,
        },
        {
          name: 'a15',
          type: AbiType.Uint,
          value: 15n,
          length: 2,
          multiline: false,
        },
        {
          name: 'a16',
          type: AbiType.Uint,
          value: 16n,
          length: 2,
          multiline: false,
        },
        {
          name: 'a17',
          type: AbiType.Uint,
          value: 17n,
          length: 2,
          multiline: false,
        },
        {
          name: 'asset',
          type: AbiType.Asset,
          value: 705457144,
          length: 9,
          multiline: false,
        },
        {
          name: 'a18',
          type: AbiType.Uint,
          value: 18n,
          length: 2,
          multiline: false,
        },
        {
          name: 'application',
          type: AbiType.Application,
          value: 705410358,
          length: 9,
          multiline: false,
        },
        {
          name: 'pay',
          type: AbiType.Transaction,
          value: 'O3PWUKD7HK23GI2MWSSGQ2F7MKG4VBSS3NNIJFOIF5ABE7YF3BSA',
          length: 52,
          multiline: false,
        },
        {
          name: 'account',
          type: AbiType.Account,
          value: '25M5BT2DMMED3V6CWDEYKSNEFGPXX4QBIINCOICLXXRU3UGTSGRMF3MTOE',
          length: 58,
          multiline: false,
        },
      ])
      expect(abiMethod!.return).toStrictEqual({
        type: AbiType.Tuple,
        length: 69,
        multiline: true,
        values: [
          { type: AbiType.Uint, value: 705457144n, length: 9, multiline: false },
          { type: AbiType.Uint, value: 705410358n, length: 9, multiline: false },
          { type: AbiType.Uint, value: 9780000n, length: 7, multiline: false },
          {
            length: 44,
            multiline: false,
            type: 'String',
            value: 'dt9qKH86tbMjTLSkaGi/Yo3KhlLbWoSVyC9AEn8F2GQ=',
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
      const dbConnection = await myStore.get(dbConnectionAtom)
      await writeAppInterface(dbConnection, {
        applicationId: applicationId,
        name: 'test',
        appSpecVersions: [
          {
            standard: AppSpecStandard.ARC32,
            appSpec: SampleFourAppSpec as unknown as Arc32AppSpec,
          },
        ],
        lastModified: createTimestamp(),
      } satisfies AppInterfaceEntity)

      const abiMethod = await myStore.get(abiMethodResolver(transaction, getGroupResultAtom))
      expect(abiMethod).toBeDefined()
      expect(abiMethod!.name).toBe('nest_array_and_tuple')
      expect(abiMethod!.arguments).toStrictEqual([
        {
          name: 'arr',
          type: AbiType.Array,
          length: 26,
          multiline: true,
          values: [
            {
              type: AbiType.Array,
              length: 5,
              multiline: false,
              values: [
                { type: AbiType.Uint, value: 1n, length: 1, multiline: false },
                { type: AbiType.Uint, value: 2n, length: 1, multiline: false },
                { type: AbiType.Uint, value: 3n, length: 1, multiline: false },
                { type: AbiType.Uint, value: 4n, length: 1, multiline: false },
                { type: AbiType.Uint, value: 5n, length: 1, multiline: false },
              ],
            },
            {
              type: AbiType.Array,
              length: 6,
              multiline: false,
              values: [
                { type: AbiType.Uint, value: 6n, length: 1, multiline: false },
                { type: AbiType.Uint, value: 7n, length: 1, multiline: false },
                { type: AbiType.Uint, value: 8n, length: 1, multiline: false },
                { type: AbiType.Uint, value: 9n, length: 1, multiline: false },
                { type: AbiType.Uint, value: 10n, length: 2, multiline: false },
              ],
            },
            {
              type: AbiType.Array,
              length: 15,
              multiline: false,
              values: [
                { type: AbiType.Uint, value: 111n, length: 3, multiline: false },
                { type: AbiType.Uint, value: 222n, length: 3, multiline: false },
                { type: AbiType.Uint, value: 333n, length: 3, multiline: false },
                { type: AbiType.Uint, value: 444n, length: 3, multiline: false },
                { type: AbiType.Uint, value: 555n, length: 3, multiline: false },
              ],
            },
          ],
        },
        {
          name: 'tuple',
          type: AbiType.Tuple,
          length: 350,
          multiline: true,
          values: [
            {
              type: AbiType.Array,
              length: 16,
              multiline: false,
              values: [
                { type: AbiType.Uint, value: 666n, length: 3, multiline: false },
                { type: AbiType.Uint, value: 777n, length: 3, multiline: false },
                { type: AbiType.Uint, value: 888n, length: 3, multiline: false },
                { type: AbiType.Uint, value: 999n, length: 3, multiline: false },
                { type: AbiType.Uint, value: 1111n, length: 4, multiline: false },
              ],
            },
            {
              type: AbiType.String,
              length: 334,
              multiline: false,
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

      const abiMethod = await myStore.get(abiMethodResolver(transaction, getGroupResultAtom))
      expect(abiMethod).toBeUndefined()
    })
  })
})
