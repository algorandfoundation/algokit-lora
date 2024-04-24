import { Search, searchPlaceholderLabel } from './search'
import { describe, it, expect, vi } from 'vitest'
import { render, waitFor } from '@/tests/testing-library'
import { executeComponentTest } from '@/tests/test-component'

vi.mock('react-router-dom', () => ({
  ...vi.importActual('react-router-dom'),
  useNavigate: vi.fn(),
}))

describe('search', () => {
  it('should render search input', () => {
    return executeComponentTest(
      () => render(<Search />),
      async (component) => {
        await waitFor(() => {
          expect(component.getByPlaceholderText(searchPlaceholderLabel)).not.toBeNull()
        })
      }
    )
  })
})
