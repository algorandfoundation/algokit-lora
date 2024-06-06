import { executeComponentTest } from '@/tests/test-component'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { render, waitFor } from '@testing-library/react'
import { TxPage } from './tx-page'

vi.mock('react-router-dom', async () => ({
  ...(await vi.importActual('react-router-dom')),
  useParams: vi.fn(),
  useLocation: vi.fn(),
  useNavigate: vi.fn(),
}))

describe('tx page', () => {
  describe.each([
    {
      txUrl: '/tx/M3XXBGXHOXPP32S6UVT64U34H3VM67W5ZSARW5AY6KOP7XI4E4SA',
      expectedRedirectUrl: '/transaction/M3XXBGXHOXPP32S6UVT64U34H3VM67W5ZSARW5AY6KOP7XI4E4SA',
    },
    {
      txUrl: '/tx/JC4VRVWOA7ZQX6OJX5GCAPJVAEEQB3Q4MYWJXVJC7LCNH6HW62WQ/inner/41-1',
      expectedRedirectUrl: '/transaction/JC4VRVWOA7ZQX6OJX5GCAPJVAEEQB3Q4MYWJXVJC7LCNH6HW62WQ/inner/41-1',
    },
  ])('when the tx url is $txUrl', ({ txUrl, expectedRedirectUrl }) => {
    afterEach(() => {
      localStorage.clear()
    })

    it('should redirect to the expected url', () => {
      const transactionId = txUrl.split('/')[2]
      vi.mocked(useParams).mockImplementation(() => ({ transactionId: transactionId }))
      vi.mocked(useLocation).mockImplementation(() => ({ pathname: txUrl, search: '', key: '', state: undefined, hash: '' }))
      const mockNavigate = vi.fn()
      vi.mocked(useNavigate).mockReturnValue(mockNavigate)

      return executeComponentTest(
        () => render(<TxPage />),
        async () => {
          await waitFor(async () => {
            expect(mockNavigate).toHaveBeenCalledWith(expectedRedirectUrl)
          })
        }
      )
    })
  })
})
