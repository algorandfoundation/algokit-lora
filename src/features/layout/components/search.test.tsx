// test search component
import userEvent from '@testing-library/user-event'
import { Search } from './search'
import { describe, it, expect, vi } from 'vitest'
import { render, waitFor } from '@/tests/testing-library'
import { executeComponentTest } from '@/tests/test-component'
import { useNavigate } from 'react-router-dom'
import { TransactionPage } from '@/features/transactions/pages/transaction-page'

vi.mock('react-router-dom', () => ({
  ...vi.importActual('react-router-dom'),
  useNavigate: vi.fn(),
  useParams: () => ({ transactionId: 'invalid-id' }),
}))

describe('Search', () => {
  it('should render search input and button', () => {
    return executeComponentTest(
      () => render(<Search />),
      async (component) => {
        await waitFor(() => {
          expect(component.getByPlaceholderText('Search')).not.toBeNull()
          expect(component.getByRole('button', { name: 'search' })).not.toBeNull()
        })
      }
    )
  })

  it('should call navigate when search button is clicked', () => {
    const mockNavigate = vi.fn()
    vi.mocked(useNavigate).mockReturnValue(mockNavigate)

    return executeComponentTest(
      () => render(<Search />),
      async (component) => {
        await waitFor(async () => {
          const input = component.getByPlaceholderText('Search')
          const button = component.getByRole('button', { name: 'search' })

          await userEvent.type(input, '123456')
          await userEvent.click(button)

          expect(mockNavigate).toHaveBeenCalledWith('/explore/transaction/123456')
          expect(input).toHaveProperty('value', '')
        })
      }
    )
  })

  it('should not call navigate when search button is clicked and search query is empty', () => {
    const mockNavigate = vi.fn()
    vi.mocked(useNavigate).mockReturnValue(mockNavigate)

    return executeComponentTest(
      () => render(<Search />),
      async (component) => {
        await waitFor(async () => {
          const button = component.getByRole('button', { name: 'search' })

          await userEvent.click(button)

          expect(mockNavigate).not.toHaveBeenCalled()
        })
      }
    )
  })
  it('should show "Transaction does not exist" for an invalid transaction ID', () => {
    const mockNavigate = vi.fn()
    vi.mocked(useNavigate).mockReturnValue(mockNavigate)

    return executeComponentTest(
      () => render(<Search />),
      async (component) => {
        await waitFor(async () => {
          const input = component.getByPlaceholderText('Search')
          const button = component.getByRole('button', { name: 'search' })

          await userEvent.type(input, '0x123456')
          await userEvent.click(button)
          expect(mockNavigate).toHaveBeenCalledWith('/explore/transaction/0x123456')
        })
        const transactionPage = render(<TransactionPage />)
        expect(transactionPage.getByText('Transaction does not exist')).toBeTruthy()
      }
    )
  })
})
