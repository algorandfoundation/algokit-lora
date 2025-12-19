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

vi.mock('@/features/common/data/algo-client', async () => {
  const original = await vi.importActual('@/features/common/data/algo-client')
  return {
    ...original,
    indexer: {
      lookupBlock: vi.fn().mockResolvedValue({}),
      lookupTransactionById: vi.fn().mockResolvedValue({
        currentRound: 1,
        transaction: {
          sender: 'sender',
          fee: 1000,
          firstValid: 1,
          lastValid: 1,
          note: 'note',
          txType: 'pay',
          confirmedRound: 1,
          roundTime: 1,
          paymentTransaction: {
            amount: 1000,
            receiver: 'receiver',
          },
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
      vi.mocked(indexer.lookupBlock).mockImplementation(() => Promise.reject(new HttpError('boom', 404)))

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
      vi.mocked(indexer.lookupBlock).mockImplementation(() => Promise.reject({}))

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
          [algoAssetResult.id, createReadOnlyAtomAndTimestamp(algoAssetResult)],
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
                { term: transactionsLabel, description: '15Application Call=6Asset Transfer=6Payment=3' },
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
          [algoAssetResult.id, createReadOnlyAtomAndTimestamp(algoAssetResult)],
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
                { term: transactionsLabel, description: '3Application Call=1Asset Transfer=1Payment=1' },
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
    const parentTransactionResult = transactionResultMother['mainnet-NW34GDVAISBUIOWTYHBW5CVVIACZROJRVM5ME3EJ76YNEPDYX7SA']().build()
    const transactionResults = [
      parentTransactionResult.innerTxns![1],
      parentTransactionResult.innerTxns![2],
      parentTransactionResult.innerTxns![3],
    ]
    const assets = [
      assetResultMother['mainnet-31566704']().build(),
      assetResultMother['mainnet-2982339967']().build(),
      assetResultMother['mainnet-2982339968']().build(),
    ]

    const group = groupResultMother
      .groupWithTransactions(transactionResults)
      .withId('+6zYx5gx0Iv3sLRso9Z1Xwr4niLcNyorFpQ+uBVkcBA=')
      .withRound(52121244n)
      .withTimestamp('2025-07-25T18:10:29.000Z')
      .build()

    it('should be rendered with the correct data', () => {
      vi.mocked(useParams).mockImplementation(() => ({ round: group.round.toString(), groupId: group.id }))

      const myStore = createStore()
      myStore.set(groupResultsAtom, new Map([[group.id, createReadOnlyAtomAndTimestamp(group)]]))

      myStore.set(transactionResultsAtom, new Map([[parentTransactionResult.id, createReadOnlyAtomAndTimestamp(parentTransactionResult)]]))
      myStore.set(
        assetResultsAtom,
        new Map([
          [algoAssetResult.id, createReadOnlyAtomAndTimestamp(algoAssetResult)],
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
                { term: groupIdLabel, description: '+6zYx5gx0Iv3sLRso9Z1Xwr4niLcNyorFpQ+uBVkcBA=' },
                { term: blockLabel, description: '52121244' },
                { term: timestampLabel, description: 'Fri, 25 July 2025 18:10:29' },
                { term: transactionsLabel, description: '6Application Call=1Asset Transfer=4Payment=1' },
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
                cells: ['', 'inner/2', '+6zYx5g…', 'RDRO…VM7Y', 'YPU2…BIZE', 'Payment', '0.403', '0.001'],
              },
              {
                cells: ['', 'inner/3', '+6zYx5g…', 'RDRO…VM7Y', '3137524476', 'Application Call', '', '0.001'],
              },
              {
                cells: ['', 'inner/4', '+6zYx5g…', 'RDRO…VM7Y', 'YPU2…BIZE', 'Asset Transfer', '301.238999USDC', '0.001'],
              },
            ],
          })
        }
      )
    })
  })
})
