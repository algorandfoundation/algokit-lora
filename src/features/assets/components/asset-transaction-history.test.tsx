import { describe, expect, it, vi } from 'vitest'
import { assetResultMother } from '@/tests/object-mother/asset-result'
import { createStore } from 'jotai/index'
import { createAtomAndTimestamp } from '@/features/common/data'
import { assetResultsAtom } from '@/features/assets/data'
import { executeComponentTest } from '@/tests/test-component'
import { render, waitFor } from '@/tests/testing-library'
import { AssetTransactionHistory } from '@/features/assets/components/asset-transaction-history'
import { indexer } from '@/features/common/data/algo-client'
import { transactionResultMother } from '@/tests/object-mother/transaction-result'
import { getAllByRole } from '@testing-library/dom'
import { ANY_NUMBER, ANY_STRING, mockSearchAssetTransactions } from '@/tests/setup/mocks'

describe('asset-transaction-history', () => {
  const asset = assetResultMother['testnet-642327435']().build()

  it('should run', () => {
    const myStore = createStore()
    myStore.set(assetResultsAtom, new Map([[asset.index, createAtomAndTimestamp(asset)]]))

    vi.mocked(indexer.searchForTransactions().assetID(ANY_NUMBER).nextToken(ANY_STRING).limit(ANY_NUMBER).do).mockImplementation(() => {
      const args = mockSearchAssetTransactions.args
      if (args['nextToken'] === '') {
        return Promise.resolve({
          transactions: Array.from({ length: 18 }).map(() => transactionResultMother.transfer(asset).build()),
          ['next-token']: '4652AgAAAAAFAAAA',
        })
      }
      return Promise.resolve({
        transactions: [],
      })
    })

    return executeComponentTest(
      () => {
        return render(<AssetTransactionHistory assetId={asset.index} />, undefined, myStore)
      },
      async (component, user) => {
        // waitFor the loading state to be finished
        await waitFor(() => {
          const tableBody = component.container.querySelector('tbody')
          expect(getAllByRole(tableBody!, 'row').length).toBe(10)
        })

        await user.click(component.getByText('Go to next page'))
        await waitFor(() => {
          const tableBody = component.container.querySelector('tbody')
          expect(getAllByRole(tableBody!, 'row').length).toBe(8)
        })

        await user.click(component.getByText('Go to previous page'))
        await waitFor(() => {
          const tableBody = component.container.querySelector('tbody')
          expect(getAllByRole(tableBody!, 'row').length).toBe(10)
        })

        await user.click(component.getByText('Go to next page'))
        await waitFor(() => {
          const tableBody = component.container.querySelector('tbody')
          expect(getAllByRole(tableBody!, 'row').length).toBe(8)
        })
      }
    )
  })
})
