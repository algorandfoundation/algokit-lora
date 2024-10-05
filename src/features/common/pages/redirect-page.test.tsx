import { executeComponentTest } from '@/tests/test-component'
import { useLocation, useNavigate } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { render, waitFor } from '@testing-library/react'
import { RedirectPage } from './redirect-page'
import { Urls } from '@/routes/urls'

vi.mock('react-router-dom', async () => ({
  ...(await vi.importActual('react-router-dom')),
  useParams: vi.fn(),
  useLocation: vi.fn(),
  useNavigate: vi.fn(),
}))

describe('redirect page', () => {
  describe.each([
    {
      from: Urls.Explore.Tx,
      fromPath: '/tx/M3XXBGXHOXPP32S6UVT64U34H3VM67W5ZSARW5AY6KOP7XI4E4SA',
      to: Urls.Explore.Transaction,
      toPath: '/transaction/M3XXBGXHOXPP32S6UVT64U34H3VM67W5ZSARW5AY6KOP7XI4E4SA',
    },
    {
      from: Urls.Explore.Tx,
      fromPath: '/tx/JC4VRVWOA7ZQX6OJX5GCAPJVAEEQB3Q4MYWJXVJC7LCNH6HW62WQ/inner/41-1',
      to: Urls.Explore.Transaction,
      toPath: '/transaction/JC4VRVWOA7ZQX6OJX5GCAPJVAEEQB3Q4MYWJXVJC7LCNH6HW62WQ/inner/41-1',
    },
    {
      from: Urls.Explore.Txn,
      fromPath: '/txn/M3XXBGXHOXPP32S6UVT64U34H3VM67W5ZSARW5AY6KOP7XI4E4SA',
      to: Urls.Explore.Transaction,
      toPath: '/transaction/M3XXBGXHOXPP32S6UVT64U34H3VM67W5ZSARW5AY6KOP7XI4E4SA',
    },
    {
      from: Urls.Explore.Txn,
      fromPath: '/txn/JC4VRVWOA7ZQX6OJX5GCAPJVAEEQB3Q4MYWJXVJC7LCNH6HW62WQ/inner/41-1',
      to: Urls.Explore.Transaction,
      toPath: '/transaction/JC4VRVWOA7ZQX6OJX5GCAPJVAEEQB3Q4MYWJXVJC7LCNH6HW62WQ/inner/41-1',
    },
    {
      from: Urls.TxWizard,
      fromPath: '/tx-wizard',
      to: Urls.TransactionWizard,
      toPath: '/transaction-wizard',
    },
    {
      from: Urls.TxnWizard,
      fromPath: '/txn-wizard',
      to: Urls.TransactionWizard,
      toPath: '/transaction-wizard',
    },
  ])('when the url is $txUrl', ({ from, fromPath, to, toPath }) => {
    afterEach(() => {
      localStorage.clear()
    })

    it('should redirect to the expected url', () => {
      vi.mocked(useLocation).mockImplementation(() => ({ pathname: fromPath, search: '', key: '', state: undefined, hash: '' }))
      const mockNavigate = vi.fn()
      vi.mocked(useNavigate).mockReturnValue(mockNavigate)

      return executeComponentTest(
        () => render(<RedirectPage from={from} to={to} />),
        async () => {
          await waitFor(async () => {
            expect(mockNavigate).toHaveBeenCalledWith(toPath)
          })
        }
      )
    })
  })
})
