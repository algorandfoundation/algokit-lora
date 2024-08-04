import { describe, expect, it } from 'vitest'
import { transactionResultMother } from '@/tests/object-mother/transaction-result'
import { assetResultMother } from '@/tests/object-mother/asset-result'
import { createStore } from 'jotai/index'
import { transactionResultsAtom } from '@/features/transactions/data'
import { createAtomAndTimestamp } from '@/features/common/data'
import { assetResultsAtom } from '@/features/assets/data'
import { abiMethodResolver } from '@/features/abi-methods/data/abi-method'
import { executeComponentTest } from '@/tests/test-component'
import { render } from '@/tests/testing-library'
import AuctionAppSpec from '@/features/abi-methods/data/test-app-specs/auction.arc32.json'
import { applicationsAppSpecsAtom } from '@/features/abi-methods/data/index'
import { AlgoAppSpec } from '@/features/abi-methods/data/types/arc-32/application'
import { AbiValueType } from '@/features/abi-methods/models'

describe('resolving ABI method', () => {
  describe('for an app call with referenced asset', () => {
    const transaction = transactionResultMother['testnet-QY4K4IC2Z5RQ5OM2LHZH7UAFJJ44VUDSVOIAI67LMVTU4BHODP5A']().build()
    const asset = assetResultMother['testnet-705457144']().build()

    it('should resolve the correct data', async () => {
      const myStore = createStore()
      myStore.set(transactionResultsAtom, new Map([[transaction.id, createAtomAndTimestamp(transaction)]]))
      myStore.set(assetResultsAtom, new Map([[asset.index, createAtomAndTimestamp(asset)]]))

      return executeComponentTest(
        () => {
          return render(<div></div>, undefined, myStore)
        },
        async () => {
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
        }
      )
    })
  })
})
