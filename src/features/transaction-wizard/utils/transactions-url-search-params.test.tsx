import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vitest } from 'vitest'
import { TransactionWizardPage } from '../transaction-wizard-page'
import { render, screen, cleanup } from '@testing-library/react'
import { algorandFixture } from '@algorandfoundation/algokit-utils/testing'
import { TooltipProvider } from '@/features/common/components/tooltip'
import { ToastContainer } from 'react-toastify'

const renderTxnsWizardPageWithSearchParams = ({ searchParams }: { searchParams: URLSearchParams }) => {
  const urlSearchParams = new URLSearchParams(searchParams).toString()
  const router = createMemoryRouter(
    [
      {
        path: '/localnet/transaction-wizard',
        element: (
          <>
            <ToastContainer />
            <TooltipProvider>
              <TransactionWizardPage />
            </TooltipProvider>
          </>
        ),
      },
    ],
    {
      initialEntries: [`/localnet/transaction-wizard?${urlSearchParams}`],
    }
  )
  return render(<RouterProvider router={router} />)
}

describe('Render transactions page with search params', () => {
  const localnet = algorandFixture()
  beforeEach(localnet.newScope, 10e6)
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

    it('should render online key registration with url safe values', () => {
      const sender = 'I3345FUQQ2GRBHFZQPLYQQX5HJMMRZMABCHRLWV6RCJYC6OO4MOLEUBEGU'
      const selkey = '-lfw-Y04lTnllJfncgMjXuAePe8i8YyVeoR9c1Xi78c'
      const sprfkey = '3NoXc2sEWlvQZ7XIrwVJjgjM30ndhvwGgcqwKugk1u5W_iy_JITXrykuy0hUvAxbVv0njOgBPtGFsFif3yLJpg'
      const votefst = 1300
      const votekd = 100
      const votekey = 'UU8zLMrFVfZPnzbnL6ThAArXFsznV3TvFVAun2ONcEI'
      const votelst = 11300
      const fee = 2_000_000
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
      expect(screen.getByText('+lfw+Y04lTnllJfncgMjXuAePe8i8YyVeoR9c1Xi78c=')).toBeInTheDocument()
      expect(
        screen.getByText('3NoXc2sEWlvQZ7XIrwVJjgjM30ndhvwGgcqwKugk1u5W/iy/JITXrykuy0hUvAxbVv0njOgBPtGFsFif3yLJpg==')
      ).toBeInTheDocument()
      expect(screen.getByText(votefst.toString())).toBeInTheDocument()
      expect(screen.getByText(votekd.toString())).toBeInTheDocument()
      expect(screen.getByText('UU8zLMrFVfZPnzbnL6ThAArXFsznV3TvFVAun2ONcEI=')).toBeInTheDocument()
      expect(screen.getByText(votelst.toString())).toBeInTheDocument()
      expect(screen.getByText('2')).toBeInTheDocument()
    })

    it('should render online key registration with url encoded values', () => {
      const sender = 'I3345FUQQ2GRBHFZQPLYQQX5HJMMRZMABCHRLWV6RCJYC6OO4MOLEUBEGU'
      const selkey = '+lfw+Y04lTnllJfncgMjXuAePe8i8YyVeoR9c1Xi78c='
      const sprfkey = '3NoXc2sEWlvQZ7XIrwVJjgjM30ndhvwGgcqwKugk1u5W/iy/JITXrykuy0hUvAxbVv0njOgBPtGFsFif3yLJpg=='
      const votefst = 1300
      const votekd = 100
      const votekey = 'UU8zLMrFVfZPnzbnL6ThAArXFsznV3TvFVAun2ONcEI='
      const votelst = 11300
      const fee = 2_000_000
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
      expect(screen.getByText(selkey)).toBeInTheDocument()
      expect(screen.getByText(sprfkey)).toBeInTheDocument()
      expect(screen.getByText(votefst.toString())).toBeInTheDocument()
      expect(screen.getByText(votekd.toString())).toBeInTheDocument()
      expect(screen.getByText(votekey)).toBeInTheDocument()
      expect(screen.getByText(votelst.toString())).toBeInTheDocument()
      expect(screen.getByText('2')).toBeInTheDocument()
    })
  })

  describe('payment transaction search params', () => {
    const sender = 'I3345FUQQ2GRBHFZQPLYQQX5HJMMRZMABCHRLWV6RCJYC6OO4MOLEUBEGU'
    const receiver = 'AAOLENX3Z76HBMQOLQF4VW26ZQSORVX7ZQJ66LCPX36T2QNAUYOYEY76RM'
    const amount = 2_500_000
    const fee = 3_000_000
    const note = 'Some payment notes'

    it('should render payment transaction with minimal required fields only', () => {
      renderTxnsWizardPageWithSearchParams({
        searchParams: new URLSearchParams({
          'type[0]': 'pay',
          'sender[0]': sender,
          'receiver[0]': receiver,
          'amount[0]': amount.toString(),
        }),
      })

      expect(screen.getByText(sender)).toBeInTheDocument()
      expect(screen.getByText(receiver)).toBeInTheDocument()
      expect(screen.getByText('2.5')).toBeInTheDocument()
    })

    it('should render payment transaction with all optional fields', () => {
      renderTxnsWizardPageWithSearchParams({
        searchParams: new URLSearchParams({
          'type[0]': 'pay',
          'sender[0]': sender,
          'receiver[0]': receiver,
          'amount[0]': amount.toString(),
          'fee[0]': fee.toString(),
          'note[0]': note,
        }),
      })
      expect(screen.getByText(sender)).toBeInTheDocument()
      expect(screen.getByText(receiver)).toBeInTheDocument()
      expect(screen.getByText('2.5')).toBeInTheDocument()
      expect(screen.getByText('3')).toBeInTheDocument()
      expect(screen.getByText(note)).toBeInTheDocument()
    })

    it('should render payment transaction with fee only', () => {
      renderTxnsWizardPageWithSearchParams({
        searchParams: new URLSearchParams({
          'type[0]': 'pay',
          'sender[0]': sender,
          'receiver[0]': receiver,
          'amount[0]': amount.toString(),
          'fee[0]': fee.toString(),
        }),
      })
      expect(screen.getByText(sender)).toBeInTheDocument()
      expect(screen.getByText(receiver)).toBeInTheDocument()
      expect(screen.getByText('2.5')).toBeInTheDocument()
      expect(screen.getByText('3')).toBeInTheDocument()
    })

    it('should render payment transaction with note only', () => {
      renderTxnsWizardPageWithSearchParams({
        searchParams: new URLSearchParams({
          'type[0]': 'pay',
          'sender[0]': sender,
          'receiver[0]': receiver,
          'amount[0]': amount.toString(),
          'note[0]': note,
        }),
      })
      expect(screen.getByText(sender)).toBeInTheDocument()
      expect(screen.getByText(receiver)).toBeInTheDocument()
      expect(screen.getByText('2.5')).toBeInTheDocument()
      expect(screen.getByText(note)).toBeInTheDocument()
    })

    it.each([
      // Missing required field cases
      {
        key: 'sender[0]',
        mode: 'missing',
        expected: 'Error in transaction at index 0 in the following fields: sender-value, sender-resolvedAddress',
      },
      {
        key: 'receiver[0]',
        mode: 'missing',
        expected: 'Error in transaction at index 0 in the following fields: receiver-value, receiver-resolvedAddress',
      },
      {
        key: 'amount[0]',
        mode: 'missing',
        expected: 'Error in transaction at index 0: The number NaN cannot be converted to a BigInt because it is not an integer',
      },
      // Invalid field value cases
      {
        key: 'sender[0]',
        mode: 'invalid',
        value: 'invalid-address',
        expected: 'Error in transaction at index 0 in the following fields: sender-value, sender-value',
      },
      {
        key: 'receiver[0]',
        mode: 'invalid',
        value: 'invalid-address',
        expected: 'Error in transaction at index 0 in the following fields: receiver-value, receiver-value',
      },
      {
        key: 'amount[0]',
        mode: 'invalid',
        value: 'not-a-number',
        expected: 'Error in transaction at index 0: The number NaN cannot be converted to a BigInt because it is not an integer',
      },
      {
        key: 'amount[0]',
        mode: 'invalid',
        value: '-100',
        expected: 'Error in transaction at index 0: Microalgos should be positive and less than 2^53 - 1.',
      },
      {
        key: 'fee[0]',
        mode: 'invalid',
        value: 'not-a-number',
        expected: 'Error in transaction at index 0: The number NaN cannot be converted to a BigInt because it is not an integer',
      },
      {
        key: 'fee[0]',
        mode: 'invalid',
        value: '-100',
        expected: 'Error in transaction at index 0: Microalgos should be positive and less than 2^53 - 1.',
      },
    ])('should show error toast for $mode $key', async ({ key, mode, value, expected }) => {
      const baseParams: Record<string, string> = {
        'type[0]': 'pay',
        'sender[0]': sender,
        'receiver[0]': receiver,
        'amount[0]': amount.toString(),
      }
      if (mode === 'missing') {
        delete baseParams[key]
      } else if (mode === 'invalid' && value !== undefined) {
        baseParams[key] = value.toString()
      }
      const searchParams = new URLSearchParams(baseParams)
      renderTxnsWizardPageWithSearchParams({ searchParams })
      const toastElement = await screen.findByText(expected)
      expect(toastElement).toBeInTheDocument()
      cleanup()
    })
  })
})
