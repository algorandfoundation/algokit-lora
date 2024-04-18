import { Search } from './search'
import { describe, it, expect, vi } from 'vitest'
import { render, waitFor } from '@/tests/testing-library'
import { executeComponentTest } from '@/tests/test-component'
import { useNavigate } from 'react-router-dom'

vi.mock('react-router-dom', () => ({
  ...vi.importActual('react-router-dom'),
  useNavigate: vi.fn(),
}))

describe('search', () => {
  it('should render search input and button', () => {
    return executeComponentTest(
      () => render(<Search />),
      async (component) => {
        await waitFor(() => {
          expect(component.getByPlaceholderText('Search')).not.toBeNull()
          expect(component.getByRole('button', { name: 'Search' })).not.toBeNull()
        })
      }
    )
  })

  it('should call navigate when search button is clicked', () => {
    const mockNavigate = vi.fn()
    vi.mocked(useNavigate).mockReturnValue(mockNavigate)

    return executeComponentTest(
      () => render(<Search />),
      async (component, user) => {
        await waitFor(async () => {
          const input = component.getByPlaceholderText('Search')
          const button = component.getByRole('button', { name: 'Search' })

          await user.type(input, '123456')
          await user.click(button)

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
      async (component, user) => {
        await waitFor(async () => {
          const button = component.getByRole('button', { name: 'Search' })

          await user.click(button)

          expect(mockNavigate).not.toHaveBeenCalled()
        })
      }
    )
  })
})
