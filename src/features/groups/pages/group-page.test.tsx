import { executeComponentTest } from '@/tests/test-component'
import { getByRole, render, waitFor } from '@/tests/testing-library'
import { useParams } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { GroupPage, blockInvalidRoundMessage, groupNotFoundMessage, groupFailedToLoadMessage } from './group-page'
import { createReadOnlyAtomAndTimestamp } from '@/features/common/data'
import { HttpError } from '@/tests/errors'
import { groupResultMother } from '@/tests/object-mother/group-result'
import { createStore } from 'jotai'
import { groupResultsAtom } from '../data'
import { descriptionListAssertion } from '@/tests/assertions/description-list-assertion'
import { blockLabel, groupIdLabel, timestampLabel, transactionsLabel } from '../components/group-details'
import { transactionResultMother } from '@/tests/object-mother/transaction-result'
import { assetResultMother } from '@/tests/object-mother/asset-result'
import { algoAssetResult } from '@/features/assets/data'
import { transactionResultsAtom } from '@/features/transactions/data'
import { groupVisual, groupVisualGraphLabel, groupVisualTableLabel } from '../components/group-transactions-view-tabs'
import { tableAssertion } from '@/tests/assertions/table-assertion'
import { assetResultsAtom } from '@/features/assets/data'
import { indexer } from '@/features/common/data/algo-client'
import { genesisHashAtom } from '@/features/blocks/data'
import algosdk from 'algosdk'

vi.mock('@/features/common/data/algo-client', async () => {
  const original = await vi.importActual('@/features/common/data/algo-client')
  return {
    ...original,
    indexer: {
      lookupBlock: vi.fn().mockReturnValue({
        do: vi.fn(),
      }),
      lookupTransactionByID: vi.fn().mockReturnValue({
        do: () => {
          return Promise.resolve(
            new algosdk.indexerModels.TransactionResponse({
              currentRound: 1,
              transaction: new algosdk.indexerModels.Transaction({
                sender: 'sender',
                fee: 1000,
                firstValid: 1,
                lastValid: 1,
                note: 'note',
                txType: 'pay',
                confirmedRound: 1,
                roundTime: 1,
                paymentTransaction: new algosdk.indexerModels.TransactionPayment({
                  amount: 1000,
                  receiver: 'receiver',
                }),
              }),
            })
          )
        },
      }),
    },
  }
})

describe('group-page', () => {
  describe('when rendering a group using an invalid round number', () => {
    it('should display invalid round message', () => {
      vi.mocked(useParams).mockImplementation(() => ({ round: 'invalid-id', groupId: 'some-id' }))

      return executeComponentTest(
        () => render(<GroupPage />),
        async (component) => {
          await waitFor(() => expect(component.getByText(blockInvalidRoundMessage)).toBeTruthy())
        }
      )
    })
  })

  describe('when rendering a group with a round number that does not exist', () => {
    it('should display not found message', () => {
      vi.mocked(useParams).mockImplementation(() => ({ round: '123456', groupId: 'some-id' }))
      vi.mocked(indexer.lookupBlock(123456).do).mockImplementation(() => Promise.reject(new HttpError('boom', 404)))

      return executeComponentTest(
        () => render(<GroupPage />),
        async (component) => {
          await waitFor(() => expect(component.getByText(groupNotFoundMessage)).toBeTruthy())
        }
      )
    })
  })

  describe('when rendering a group within a block that was failed to load', () => {
    it('should display failed to load message', () => {
      vi.mocked(useParams).mockImplementation(() => ({ round: '123456', groupId: 'some-id' }))
      vi.mocked(indexer.lookupBlock(0).do).mockImplementation(() => Promise.reject({}))

      return executeComponentTest(
        () => render(<GroupPage />),
        async (component) => {
          await waitFor(() => expect(component.getByText(groupFailedToLoadMessage)).toBeTruthy())
        }
      )
    })
  })

  describe('when rendering a group', () => {
    const transactionResult1 = transactionResultMother['mainnet-INDQXWQXHF22SO45EZY7V6FFNI6WUD5FHRVDV6NCU6HD424BJGGA']().build()
    const transactionResult2 = transactionResultMother['mainnet-7VSN7QTNBT7X4V5JH2ONKTJYF6VSQSE2H5J7VTDWFCJGSJED3QUA']().build()
    const transactionResults = [transactionResult1, transactionResult2]
    const assets = [
      assetResultMother['mainnet-31566704']().build(),
      assetResultMother['mainnet-386195940']().build(),
      assetResultMother['mainnet-408898501']().build(),
    ]
    const group = groupResultMother
      .groupWithTransactions(transactionResults)
      .withId('/oRSr2uMFemQhwQliJO18b64Nl1QIkjA39ZszRCeSCI=')
      .withRound(36591812n)
      .withTimestamp('2024-03-01T01:07:53Z')
      .build()

    it('should be rendered with the correct data', () => {
      vi.mocked(useParams).mockImplementation(() => ({ round: group.round.toString(), groupId: group.id }))

      const myStore = createStore()
      myStore.set(groupResultsAtom, new Map([[group.id, createReadOnlyAtomAndTimestamp(group)]]))
      myStore.set(transactionResultsAtom, new Map(transactionResults.map((t) => [t.id, createReadOnlyAtomAndTimestamp(t)])))
      myStore.set(
        assetResultsAtom,
        new Map([
          [algoAssetResult.index, createReadOnlyAtomAndTimestamp(algoAssetResult)],
          ...assets.map((a) => [a.index, createReadOnlyAtomAndTimestamp(a)] as const),
        ])
      )
      myStore.set(genesisHashAtom, 'some-hash')

      return executeComponentTest(
        () => render(<GroupPage />, undefined, myStore),
        async (component, user) => {
          await waitFor(() =>
            descriptionListAssertion({
              container: component.container,
              items: [
                { term: groupIdLabel, description: '/oRSr2uMFemQhwQliJO18b64Nl1QIkjA39ZszRCeSCI=' },
                { term: blockLabel, description: '36591812' },
                { term: timestampLabel, description: 'Fri, 01 March 2024 01:07:53' },
                { term: transactionsLabel, description: '15Application Call=6Payment=3Asset Transfer=6' },
              ],
            })
          )

          const groupVisualTabList = component.getByRole('tablist', { name: groupVisual })
          expect(groupVisualTabList).toBeTruthy()
          expect(
            component.getByRole('tabpanel', { name: groupVisualGraphLabel }).getAttribute('data-state'),
            'Visual tab should be active'
          ).toBe('active')

          // After click on the Table tab
          await user.click(getByRole(groupVisualTabList, 'tab', { name: groupVisualTableLabel }))
          const tableViewTab = component.getByRole('tabpanel', { name: groupVisualTableLabel })
          await waitFor(() => expect(tableViewTab.getAttribute('data-state'), 'Table tab should be active').toBe('active'))
          await tableAssertion({
            container: tableViewTab,
            // This table has 10+ row, we only test the first row
            rows: [
              {
                cells: ['', 'INDQXWQ…', '/oRSr2u…', 'AACC…EN4A', '1201559522', 'Application Call', ''],
              },
            ],
          })
        }
      )
    })
  })

  describe('when rendering a group of inner transactions', () => {
    const transactionResults = [transactionResultMother['mainnet-INDQXWQXHF22SO45EZY7V6FFNI6WUD5FHRVDV6NCU6HD424BJGGA']().build()]
    const assets = [
      assetResultMother['mainnet-31566704']().build(),
      assetResultMother['mainnet-386195940']().build(),
      assetResultMother['mainnet-408898501']().build(),
    ]
    const group = groupResultMother
      .groupWithTransactions(transactionResults)
      .withId('aWpPwlog0oZYHQe9uDlwReKzIgb9HVKLv8Z4GX0wMO0=')
      .withRound(36591812n)
      .withTimestamp('2024-03-01T01:07:53Z')
      .build()

    it('should be rendered with the correct data', () => {
      vi.mocked(useParams).mockImplementation(() => ({ round: group.round.toString(), groupId: group.id }))

      const myStore = createStore()
      myStore.set(groupResultsAtom, new Map([[group.id, createReadOnlyAtomAndTimestamp(group)]]))
      myStore.set(transactionResultsAtom, new Map(transactionResults.map((t) => [t.id, createReadOnlyAtomAndTimestamp(t)])))
      myStore.set(
        assetResultsAtom,
        new Map([
          [algoAssetResult.index, createReadOnlyAtomAndTimestamp(algoAssetResult)],
          ...assets.map((a) => [a.index, createReadOnlyAtomAndTimestamp(a)] as const),
        ])
      )
      myStore.set(genesisHashAtom, 'some-hash')

      return executeComponentTest(
        () => render(<GroupPage />, undefined, myStore),
        async (component, user) => {
          await waitFor(() =>
            descriptionListAssertion({
              container: component.container,
              items: [
                { term: groupIdLabel, description: 'aWpPwlog0oZYHQe9uDlwReKzIgb9HVKLv8Z4GX0wMO0=' },
                { term: blockLabel, description: '36591812' },
                { term: timestampLabel, description: 'Fri, 01 March 2024 01:07:53' },
                { term: transactionsLabel, description: '3Payment=1Application Call=1Asset Transfer=1' },
              ],
            })
          )

          const groupVisualTabList = component.getByRole('tablist', { name: groupVisual })
          expect(groupVisualTabList).toBeTruthy()
          expect(
            component.getByRole('tabpanel', { name: groupVisualGraphLabel }).getAttribute('data-state'),
            'Visual tab should be active'
          ).toBe('active')

          // After click on the Table tab
          await user.click(getByRole(groupVisualTabList, 'tab', { name: groupVisualTableLabel }))
          const tableViewTab = component.getByRole('tabpanel', { name: groupVisualTableLabel })
          await waitFor(() => expect(tableViewTab.getAttribute('data-state'), 'Table tab should be active').toBe('active'))
          await tableAssertion({
            container: tableViewTab,
            rows: [
              {
                cells: ['', 'inner/1', 'aWpPwlo…', 'AACC…EN4A', '2PIF…RNMM', 'Payment', '2.770045'],
              },
              {
                cells: ['', 'inner/2', 'aWpPwlo…', 'AACC…EN4A', '1002541853', 'Application Call', ''],
              },
            ],
          })
        }
      )
    })
  })

  describe('when rendering an inner transaction group', () => {
    const transaction1 = transactionResultMother.payment().withId('MNVQ6KV2HCFDX4GBXGVNODIIK3ATIPH5KG4TS7L3WZT2JM6ETLLQ/inner/1').build()
    const transaction2 = transactionResultMother.appCall().withId('MNVQ6KV2HCFDX4GBXGVNODIIK3ATIPH5KG4TS7L3WZT2JM6ETLLQ/inner/2').build()

    const group = groupResultMother
      .groupWithTransactions([transaction1, transaction2])
      .withId('ZlhheIuy1l/olQhJQt0eMMgbxPAsmElYrL6Is0A2Qno=')
      .withRound(2215n)
      .withTimestamp('2025-01-27T01:07:53Z')
      .build()

    it('should be rendered with the correct data', () => {
      vi.mocked(useParams).mockImplementation(() => ({ round: group.round.toString(), groupId: group.id }))

      const myStore = createStore()
      myStore.set(groupResultsAtom, new Map([[group.id, createReadOnlyAtomAndTimestamp(group)]]))

      return executeComponentTest(
        () => render(<GroupPage />, undefined, myStore),
        async () => {
          const mock = vi.mocked(indexer.lookupTransactionByID)

          expect(mock).toHaveBeenCalledWith('MNVQ6KV2HCFDX4GBXGVNODIIK3ATIPH5KG4TS7L3WZT2JM6ETLLQ')
          expect(mock).toHaveBeenCalledTimes(1)
        }
      )
    })
  })
})
