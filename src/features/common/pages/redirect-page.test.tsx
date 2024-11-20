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
      from: Urls.Network.Explore.Tx,
      fromPath: '/localnet/tx/M3XXBGXHOXPP32S6UVT64U34H3VM67W5ZSARW5AY6KOP7XI4E4SA',
      to: Urls.Network.Explore.Transaction,
      toPath: Urls.Network.Explore.Transaction.ById.build({
        networkId: 'localnet',
        transactionId: 'M3XXBGXHOXPP32S6UVT64U34H3VM67W5ZSARW5AY6KOP7XI4E4SA',
      }),
    },
    {
      from: Urls.Network.Explore.Tx,
      fromPath: '/localnet/tx/JC4VRVWOA7ZQX6OJX5GCAPJVAEEQB3Q4MYWJXVJC7LCNH6HW62WQ/inner/41-1',
      to: Urls.Network.Explore.Transaction,
      toPath: Urls.Network.Explore.Transaction.ById.Inner.ById.build({
        networkId: 'localnet',
        transactionId: 'JC4VRVWOA7ZQX6OJX5GCAPJVAEEQB3Q4MYWJXVJC7LCNH6HW62WQ',
        splat: '41-1',
      }),
    },
    {
      from: Urls.Network.Explore.Txn,
      fromPath: '/localnet/txn/M3XXBGXHOXPP32S6UVT64U34H3VM67W5ZSARW5AY6KOP7XI4E4SA',
      to: Urls.Network.Explore.Transaction,
      toPath: Urls.Network.Explore.Transaction.ById.build({
        networkId: 'localnet',
        transactionId: 'M3XXBGXHOXPP32S6UVT64U34H3VM67W5ZSARW5AY6KOP7XI4E4SA',
      }),
    },
    {
      from: Urls.Network.Explore.Txn,
      fromPath: '/localnet/txn/JC4VRVWOA7ZQX6OJX5GCAPJVAEEQB3Q4MYWJXVJC7LCNH6HW62WQ/inner/41-1',
      to: Urls.Network.Explore.Transaction,
      toPath: Urls.Network.Explore.Transaction.ById.Inner.ById.build({
        networkId: 'localnet',
        transactionId: 'JC4VRVWOA7ZQX6OJX5GCAPJVAEEQB3Q4MYWJXVJC7LCNH6HW62WQ',
        splat: '41-1',
      }),
    },
    {
      from: Urls.TxWizard,
      fromPath: Urls.TxWizard.build({}),
      to: Urls.Network.TransactionWizard,
      toPath: Urls.Network.TransactionWizard.build({ networkId: 'localnet' }),
    },
    {
      from: Urls.TxnWizard,
      fromPath: Urls.TxnWizard.build({}),
      to: Urls.Network.TransactionWizard,
      toPath: Urls.Network.TransactionWizard.build({ networkId: 'localnet' }),
    },
    {
      from: Urls.TransactionWizard,
      fromPath: Urls.TransactionWizard.build({}),
      to: Urls.Network.TransactionWizard,
      toPath: Urls.Network.TransactionWizard.build({ networkId: 'localnet' }),
    },
    {
      from: Urls.TxnWizard,
      fromPath: Urls.TxnWizard.build({}),
      to: Urls.Network.TransactionWizard,
      toPath: Urls.Network.TransactionWizard.build({ networkId: 'localnet' }),
    },
    {
      from: Urls.Network.TxWizard,
      fromPath: Urls.Network.TxWizard.build({ networkId: 'localnet' }),
      to: Urls.Network.TransactionWizard,
      toPath: Urls.Network.TransactionWizard.build({ networkId: 'localnet' }),
    },
    {
      from: Urls.Network.TxnWizard,
      fromPath: Urls.Network.TxnWizard.build({ networkId: 'localnet' }),
      to: Urls.Network.TransactionWizard,
      toPath: Urls.Network.TransactionWizard.build({ networkId: 'localnet' }),
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
