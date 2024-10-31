import { describe, expect, it, vi } from 'vitest'
import { assetResultMother } from '@/tests/object-mother/asset-result'
import { createStore } from 'jotai/index'
import { createReadOnlyAtomAndTimestamp } from '@/features/common/data'
import { assetResultsAtom } from '@/features/assets/data'
import { executeComponentTest } from '@/tests/test-component'
import { render, waitFor } from '@/tests/testing-library'
import { AssetTransactionHistory } from '@/features/assets/components/asset-transaction-history'
import { indexer } from '@/features/common/data/algo-client'
import { transactionResultMother } from '@/tests/object-mother/transaction-result'
import { getAllByRole } from '@testing-library/dom'
import { ANY_NUMBER, ANY_STRING, searchTransactionsMock } from '@/tests/setup/mocks'
import { RenderResult } from '@testing-library/react'

vi.mock('@/features/common/data/algo-client', async () => {
  const original = await vi.importActual('@/features/common/data/algo-client')
  return {
    ...original,
    indexer: {
      searchForTransactions: vi.fn().mockImplementation(() => searchTransactionsMock),
    },
  }
})

describe('asset-transaction-history', () => {
  const asset = assetResultMother['testnet-642327435']().build()

  it('should be able to handle pagination', () => {
    const myStore = createStore()
    myStore.set(assetResultsAtom, new Map([[asset.index, createReadOnlyAtomAndTimestamp(asset)]]))

    // Given 18 transactions and the page size is 10
    vi.mocked(indexer.searchForTransactions().assetID(ANY_NUMBER).nextToken(ANY_STRING).limit(ANY_NUMBER).do).mockImplementation(() => {
      const args = searchTransactionsMock.args
      if (args.nextToken === '') {
        return Promise.resolve({
          transactions: Array.from({ length: 18 }).map(() => transactionResultMother.transfer(asset).build()),
          ['next-token']: '4652AgAAAAAFAAAA',
        })
      }
      return Promise.resolve({
        transactions: [],
      })
    })

    // First page should have 10 items
    function assertFirstPage(component: RenderResult) {
      const tableBody = component.container.querySelector('tbody')!

      expect(getAllByRole(tableBody, 'row').length).toBe(10)

      expect(component.getByRole('button', { name: 'Go to previous page' }).hasAttribute('disabled')).toBeTruthy()
      expect(component.getByRole('button', { name: 'Go to next page' }).hasAttribute('disabled')).toBeFalsy()
    }
    // First page should have 8 items
    function assertSecondPage(component: RenderResult) {
      const tableBody = component.container.querySelector('tbody')!

      expect(getAllByRole(tableBody, 'row').length).toBe(8)

      expect(component.getByRole('button', { name: 'Go to previous page' }).hasAttribute('disabled')).toBeFalsy()
      expect(component.getByRole('button', { name: 'Go to next page' }).hasAttribute('disabled')).toBeTruthy()
    }

    return executeComponentTest(
      () => {
        return render(<AssetTransactionHistory assetId={asset.index} />, undefined, myStore)
      },
      async (component, user) => {
        await waitFor(() => {
          assertFirstPage(component)
        })

        await user.click(component.getByRole('button', { name: 'Go to next page' }))
        await waitFor(() => {
          assertSecondPage(component)
        })

        await user.click(component.getByRole('button', { name: 'Go to previous page' }))
        await waitFor(() => {
          assertFirstPage(component)
        })

        await user.click(component.getByRole('button', { name: 'Go to next page' }))
        await waitFor(() => {
          assertSecondPage(component)
        })
      }
    )
  })
})
