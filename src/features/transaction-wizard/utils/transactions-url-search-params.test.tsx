import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vitest } from 'vitest'
import { TransactionWizardPage } from '../transaction-wizard-page'
import { render, screen } from '@testing-library/react'
import { algorandFixture } from '@algorandfoundation/algokit-utils/testing'
import { TooltipProvider } from '@/features/common/components/tooltip'

const renderTxnsWizardPageWithSearchParams = ({ searchParams }: { searchParams: URLSearchParams }) => {
  const urlSearchParams = new URLSearchParams(searchParams).toString()
  const router = createMemoryRouter(
    [
      {
        path: '/transaction-wizard',
        element: (
          <TooltipProvider>
            <TransactionWizardPage />
          </TooltipProvider>
        ),
      },
    ],
    {
      initialEntries: [`/transaction-wizard?${urlSearchParams}`],
    }
  )
  return render(<RouterProvider router={router} />)
}

describe('Render transactions page with search params', () => {
  const localnet = algorandFixture()
  beforeEach(localnet.beforeEach, 10e6)
  afterEach(() => {
    vitest.clearAllMocks()
  })
  describe('key registration search params', () => {
    beforeEach(() => {})
    it('should render offline key registration', () => {
      const sender = 'I3345FUQQ2GRBHFZQPLYQQX5HJMMRZMABCHRLWV6RCJYC6OO4MOLEUBEGU'
      renderTxnsWizardPageWithSearchParams({
        searchParams: new URLSearchParams({
          'type[0]': 'keyreg',
          'sender[0]': sender,
        }),
      })
      expect(screen.getByText('Offline')).toBeInTheDocument()
      expect(screen.getByText(sender)).toBeInTheDocument()
    })
    it('should render online key registration', () => {
      const sender = 'I3345FUQQ2GRBHFZQPLYQQX5HJMMRZMABCHRLWV6RCJYC6OO4MOLEUBEGU'
      const selkey = '-lfw-Y04lTnllJfncgMjXuAePe8i8YyVeoR9c1Xi78c='
      const sprfkey = '3NoXc2sEWlvQZ7XIrwVJjgjM30ndhvwGgcqwKugk1u5W_iy_JITXrykuy0hUvAxbVv0njOgBPtGFsFif3yLJpg'
      const votefst = 1300
      const votekd = 100
      const votekey = 'UU8zLMrFVfZPnzbnL6ThAArXFsznV3TvFVAun2ONcEI'
      const votelst = 11300
      const fee = 2000000
      renderTxnsWizardPageWithSearchParams({
        searchParams: new URLSearchParams({
          'type[0]': 'keyreg',
          'sender[0]': sender,
          'selkey[0]': selkey,
          'sprfkey[0]': sprfkey,
          'votefst[0]': votefst.toString(),
          'votekd[0]': votekd.toString(),
          'votekey[0]': votekey,
          'votelst[0]': votelst.toString(),
          'fee[0]': fee.toString(),
        }),
      })
      expect(screen.getByText('Online')).toBeInTheDocument()
      expect(screen.getByText(sender)).toBeInTheDocument()
      //   expect(screen.getByText(selkey)).toBeInTheDocument()
      //   expect(screen.getByText(sprfkey)).toBeInTheDocument()
      expect(screen.getByText(votefst.toString())).toBeInTheDocument()
      expect(screen.getByText(votekd.toString())).toBeInTheDocument()
      //   expect(screen.getByText(votekey)).toBeInTheDocument()
      expect(screen.getByText(votelst.toString())).toBeInTheDocument()
      expect(screen.getByText(fee.toString())).toBeInTheDocument()
    })
  })
})
