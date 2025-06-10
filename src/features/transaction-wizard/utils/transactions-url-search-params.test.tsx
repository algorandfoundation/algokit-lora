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

  describe('asset create transaction search params', () => {
    const sender = 'I3345FUQQ2GRBHFZQPLYQQX5HJMMRZMABCHRLWV6RCJYC6OO4MOLEUBEGU'
    const total = '1000000'
    const decimals = '2'
    const assetName = 'TestCoin'
    const unitName = 'TC'
    const url = 'https://example.com/asset.json'
    const metadataHash = 'SGVsbG8gV29ybGQ='
    const manager = 'AAOLENX3Z76HBMQOLQF4VW26ZQSORVX7ZQJ66LCPX36T2QNAUYOYEY76RM'
    const reserve = 'DJ76C74DI7EDNSHQLAJXGMBHFINBLATVGNRAVCO3VILPCQR7LKY7GPUL7Y'
    const freeze = 'UJSXVS7TLTNFZF4PDRYDQI4IGMZNF7S4PO2F7ZNX372UWFJMNT4ZJ7RAEI'
    const clawback = 'U6S57IUI3EJIIKPGGGKGD5C6S2VCJQ3SBWDDWUO4LNI7QL5AA3LTZKEWZM'
    const fee = '2000'
    const note = 'Asset creation test'

    it('should render asset create transaction with minimal required fields only', () => {
      renderTxnsWizardPageWithSearchParams({
        searchParams: new URLSearchParams({
          'type[0]': 'acfg',
          'sender[0]': sender,
          'total[0]': total,
          'decimals[0]': decimals,
        }),
      })

      expect(screen.getByText(sender)).toBeInTheDocument()
      expect(screen.getByText('1000000')).toBeInTheDocument()
      expect(screen.getByText(decimals)).toBeInTheDocument()
    })

    it('should render asset create transaction with all optional fields', () => {
      renderTxnsWizardPageWithSearchParams({
        searchParams: new URLSearchParams({
          'type[0]': 'acfg',
          'sender[0]': sender,
          'total[0]': total,
          'decimals[0]': decimals,
          'assetname[0]': assetName,
          'unitname[0]': unitName,
          'url[0]': url,
          'metadatahash[0]': metadataHash,
          'defaultfrozen[0]': 'false',
          'manager[0]': manager,
          'reserve[0]': reserve,
          'freeze[0]': freeze,
          'clawback[0]': clawback,
          'fee[0]': fee,
          'note[0]': note,
        }),
      })

      expect(screen.getByText(sender)).toBeInTheDocument()
      expect(screen.getByText('1000000')).toBeInTheDocument()
      expect(screen.getByText(decimals)).toBeInTheDocument()
      expect(screen.getByText(assetName)).toBeInTheDocument()
      expect(screen.getByText(unitName)).toBeInTheDocument()
      expect(screen.getByText(url)).toBeInTheDocument()
      expect(screen.getByText(manager)).toBeInTheDocument()
      expect(screen.getByText(reserve)).toBeInTheDocument()
      expect(screen.getByText(freeze)).toBeInTheDocument()
      expect(screen.getByText(clawback)).toBeInTheDocument()
      expect(screen.getByText('0.002')).toBeInTheDocument()
      expect(screen.getByText(note)).toBeInTheDocument()
    })

    it('should render asset create transaction with fee only', () => {
      renderTxnsWizardPageWithSearchParams({
        searchParams: new URLSearchParams({
          'type[0]': 'acfg',
          'sender[0]': sender,
          'total[0]': total,
          'decimals[0]': decimals,
          'fee[0]': fee,
        }),
      })

      expect(screen.getByText(sender)).toBeInTheDocument()
      expect(screen.getByText('1000000')).toBeInTheDocument()
      expect(screen.getByText(decimals)).toBeInTheDocument()
      expect(screen.getByText('0.002')).toBeInTheDocument()
    })

    it('should render asset create transaction with note only', () => {
      renderTxnsWizardPageWithSearchParams({
        searchParams: new URLSearchParams({
          'type[0]': 'acfg',
          'sender[0]': sender,
          'total[0]': total,
          'decimals[0]': decimals,
          'note[0]': note,
        }),
      })

      expect(screen.getByText(sender)).toBeInTheDocument()
      expect(screen.getByText('1000000')).toBeInTheDocument()
      expect(screen.getByText(decimals)).toBeInTheDocument()
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
        key: 'total[0]',
        mode: 'missing',
        expected: 'Error in transaction at index 0: Cannot convert undefined to a BigInt',
      },
      {
        key: 'decimals[0]',
        mode: 'missing',
        expected: 'Error in transaction at index 0 in the following fields: decimals',
      },
      // Invalid field value cases
      {
        key: 'sender[0]',
        mode: 'invalid',
        value: 'invalid-address',
        expected: 'Error in transaction at index 0 in the following fields: sender-value, sender-value',
      },
      {
        key: 'total[0]',
        mode: 'invalid',
        value: 'not-a-number',
        expected: 'Error in transaction at index 0: Cannot convert not-a-number to a BigInt',
      },
      {
        key: 'total[0]',
        mode: 'invalid',
        value: '-100',
        expected: 'Error in transaction at index 0 in the following fields: total',
      },
      {
        key: 'decimals[0]',
        mode: 'invalid',
        value: 'not-a-number',
        expected: 'Error in transaction at index 0 in the following fields: decimals',
      },
      {
        key: 'decimals[0]',
        mode: 'invalid',
        value: '-1',
        expected: 'Error in transaction at index 0 in the following fields: decimals',
      },
      {
        key: 'decimals[0]',
        mode: 'invalid',
        value: '20',
        expected: 'Error in transaction at index 0 in the following fields: decimals',
      },
      {
        key: 'manager[0]',
        mode: 'invalid',
        value: 'invalid-address',
        expected: 'Error in transaction at index 0 in the following fields: manager-value, manager-value',
      },
      {
        key: 'reserve[0]',
        mode: 'invalid',
        value: 'invalid-address',
        expected: 'Error in transaction at index 0 in the following fields: reserve-value, reserve-value',
      },
      {
        key: 'freeze[0]',
        mode: 'invalid',
        value: 'invalid-address',
        expected: 'Error in transaction at index 0 in the following fields: freeze-value, freeze-value',
      },
      {
        key: 'clawback[0]',
        mode: 'invalid',
        value: 'invalid-address',
        expected: 'Error in transaction at index 0 in the following fields: clawback-value, clawback-value',
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
        'type[0]': 'acfg',
        'sender[0]': sender,
        'total[0]': total,
        'decimals[0]': decimals,
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

  describe('asset opt-in transaction search params', () => {
    const sender = 'I3345FUQQ2GRBHFZQPLYQQX5HJMMRZMABCHRLWV6RCJYC6OO4MOLEUBEGU'
    const assetId = '12345'
    const decimals = '6'
    const unitName = 'USDC'
    const clawback = 'AAOLENX3Z76HBMQOLQF4VW26ZQSORVX7ZQJ66LCPX36T2QNAUYOYEY76RM'
    const fee = '2000'
    const note = 'Asset opt-in test'

    it('should render asset opt-in transaction with minimal required fields', () => {
      renderTxnsWizardPageWithSearchParams({
        searchParams: new URLSearchParams({
          'type[0]': 'axfer',
          'sender[0]': sender,
          'assetid[0]': assetId,
          'decimals[0]': decimals,
        }),
      })

      // Sender is displayed twice in the UI, once as the sender and once as the asset receiver.
      expect(screen.getAllByText(sender)).toHaveLength(2)
      expect(screen.getByText(assetId)).toBeInTheDocument()
    })

    it('should render asset opt-in transaction with all optional fields', () => {
      renderTxnsWizardPageWithSearchParams({
        searchParams: new URLSearchParams({
          'type[0]': 'axfer',
          'sender[0]': sender,
          'assetid[0]': assetId,
          'decimals[0]': decimals,
          'unitname[0]': unitName,
          'clawback[0]': clawback,
          'fee[0]': fee,
          'note[0]': note,
        }),
      })
      screen.debug(undefined, 1000000)

      expect(screen.getAllByText(sender)).toHaveLength(2)
      expect(screen.getByText(assetId)).toBeInTheDocument()
      expect(screen.getByText(`0 ${unitName}`)).toBeInTheDocument()
      // Clawback is not displayed in the UI, nor in the edit form. WHY?
      // expect(screen.getByText(clawback)).toBeInTheDocument()
      expect(screen.getByText('0.002')).toBeInTheDocument()
      expect(screen.getByText(note)).toBeInTheDocument()
    })

    it('should render asset opt-in transaction with fee only', () => {
      renderTxnsWizardPageWithSearchParams({
        searchParams: new URLSearchParams({
          'type[0]': 'axfer',
          'sender[0]': sender,
          'assetid[0]': assetId,
          'decimals[0]': decimals,
          'fee[0]': fee,
        }),
      })

      expect(screen.getAllByText(sender)).toHaveLength(2)
      expect(screen.getByText(assetId)).toBeInTheDocument()
      expect(screen.getByText('0.002')).toBeInTheDocument()
    })

    it('should render asset opt-in transaction with note only', () => {
      renderTxnsWizardPageWithSearchParams({
        searchParams: new URLSearchParams({
          'type[0]': 'axfer',
          'sender[0]': sender,
          'assetid[0]': assetId,
          'decimals[0]': decimals,
          'note[0]': note,
        }),
      })

      expect(screen.getAllByText(sender)).toHaveLength(2)
      expect(screen.getByText(assetId)).toBeInTheDocument()
      expect(screen.getByText(note)).toBeInTheDocument()
    })

    it('should render asset opt-in transaction with unit name only', () => {
      renderTxnsWizardPageWithSearchParams({
        searchParams: new URLSearchParams({
          'type[0]': 'axfer',
          'sender[0]': sender,
          'assetid[0]': assetId,
          'decimals[0]': decimals,
          'unitname[0]': unitName,
        }),
      })

      expect(screen.getAllByText(sender)).toHaveLength(2)
      expect(screen.getByText(assetId)).toBeInTheDocument()
      expect(screen.getByText(`0 ${unitName}`)).toBeInTheDocument()
    })

    it.each([
      // Missing required field cases
      {
        key: 'sender[0]',
        mode: 'missing',
        expected: 'Error in transaction at index 0 in the following fields: sender-value, sender-resolvedAddress',
      },
      {
        key: 'assetid[0]',
        mode: 'missing',
        expected: 'Error in transaction at index 0: Cannot convert undefined to a BigInt',
      },
      {
        key: 'decimals[0]',
        mode: 'missing',
        expected: 'Error in transaction at index 0 in the following fields: asset-id',
      },
      // Invalid field value cases
      {
        key: 'sender[0]',
        mode: 'invalid',
        value: 'invalid-address',
        expected: 'Error in transaction at index 0 in the following fields: sender-value, sender-value',
      },
      {
        key: 'assetid[0]',
        mode: 'invalid',
        value: 'not-a-number',
        expected: 'Error in transaction at index 0: Cannot convert not-a-number to a BigInt',
      },
      {
        key: 'assetid[0]',
        mode: 'invalid',
        value: '0',
        expected: 'Error in transaction at index 0 in the following fields: asset-id',
      },
      {
        key: 'assetid[0]',
        mode: 'invalid',
        value: '-1',
        expected: 'Error in transaction at index 0 in the following fields: asset-id',
      },
      // This test passes because there is not address validation for clawback. Is this correct?
      // {
      //   key: 'clawback[0]',
      //   mode: 'invalid',
      //   value: 'invalid-address',
      //   expected: 'Error in transaction at index 0 in the following fields: sender-value, sender-value',
      // },
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
        'type[0]': 'axfer',
        'sender[0]': sender,
        'assetid[0]': assetId,
        'decimals[0]': decimals,
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

    it('should show "Asset does not exist" error when decimals is undefined', async () => {
      const baseParams: Record<string, string> = {
        'type[0]': 'axfer',
        'sender[0]': sender,
        'assetid[0]': assetId,
        // Note: deliberately omitting decimals[0] to trigger "asset does not exist"
      }
      const searchParams = new URLSearchParams(baseParams)
      renderTxnsWizardPageWithSearchParams({ searchParams })
      const toastElement = await screen.findByText('Error in transaction at index 0 in the following fields: asset-id')
      expect(toastElement).toBeInTheDocument()
      cleanup()
    })
  })

  describe('asset opt-out transaction search params', () => {
    const sender = 'I3345FUQQ2GRBHFZQPLYQQX5HJMMRZMABCHRLWV6RCJYC6OO4MOLEUBEGU'
    const assetId = '12345'
    const closeto = 'AAOLENX3Z76HBMQOLQF4VW26ZQSORVX7ZQJ66LCPX36T2QNAUYOYEY76RM'
    const decimals = '6'
    const unitName = 'USDC'
    const clawback = 'DJ76C74DI7EDNSHQLAJXGMBHFINBLATVGNRAVCO3VILPCQR7LKY7GPUL7Y'
    const fee = '2000'
    const note = 'Asset opt-out test'

    it('should render asset opt-out transaction with minimal required fields', () => {
      renderTxnsWizardPageWithSearchParams({
        searchParams: new URLSearchParams({
          'type[0]': 'AssetOptOut',
          'sender[0]': sender,
          'assetid[0]': assetId,
          'closeto[0]': closeto,
          'decimals[0]': decimals,
        }),
      })

      expect(screen.getAllByText(sender)).toHaveLength(2)
      expect(screen.getByText(assetId)).toBeInTheDocument()
      expect(screen.getByText(closeto)).toBeInTheDocument()
    })

    it('should render asset opt-out transaction with all optional fields', () => {
      renderTxnsWizardPageWithSearchParams({
        searchParams: new URLSearchParams({
          'type[0]': 'AssetOptOut',
          'sender[0]': sender,
          'assetid[0]': assetId,
          'closeto[0]': closeto,
          'decimals[0]': decimals,
          'unitname[0]': unitName,
          'clawback[0]': clawback,
          'fee[0]': fee,
          'note[0]': note,
        }),
      })

      expect(screen.getAllByText(sender)).toHaveLength(2)
      expect(screen.getByText(assetId)).toBeInTheDocument()
      expect(screen.getByText(closeto)).toBeInTheDocument()
      expect(screen.getByText(`0 ${unitName}`)).toBeInTheDocument()
      expect(screen.getByText('0.002')).toBeInTheDocument()
      expect(screen.getByText(note)).toBeInTheDocument()
    })

    it('should render asset opt-out transaction with fee only', () => {
      renderTxnsWizardPageWithSearchParams({
        searchParams: new URLSearchParams({
          'type[0]': 'AssetOptOut',
          'sender[0]': sender,
          'assetid[0]': assetId,
          'closeto[0]': closeto,
          'decimals[0]': decimals,
          'fee[0]': fee,
        }),
      })

      expect(screen.getAllByText(sender)).toHaveLength(2)
      expect(screen.getByText(assetId)).toBeInTheDocument()
      expect(screen.getByText(closeto)).toBeInTheDocument()
      expect(screen.getByText('0.002')).toBeInTheDocument()
    })

    it('should render asset opt-out transaction with note only', () => {
      renderTxnsWizardPageWithSearchParams({
        searchParams: new URLSearchParams({
          'type[0]': 'AssetOptOut',
          'sender[0]': sender,
          'assetid[0]': assetId,
          'closeto[0]': closeto,
          'decimals[0]': decimals,
          'note[0]': note,
        }),
      })

      expect(screen.getAllByText(sender)).toHaveLength(2)
      expect(screen.getByText(assetId)).toBeInTheDocument()
      expect(screen.getByText(closeto)).toBeInTheDocument()
      expect(screen.getByText(note)).toBeInTheDocument()
    })

    it('should render asset opt-out transaction with unit name only', () => {
      renderTxnsWizardPageWithSearchParams({
        searchParams: new URLSearchParams({
          'type[0]': 'AssetOptOut',
          'sender[0]': sender,
          'assetid[0]': assetId,
          'closeto[0]': closeto,
          'decimals[0]': decimals,
          'unitname[0]': unitName,
        }),
      })

      expect(screen.getAllByText(sender)).toHaveLength(2)
      expect(screen.getByText(assetId)).toBeInTheDocument()
      expect(screen.getByText(closeto)).toBeInTheDocument()
      expect(screen.getByText(`0 ${unitName}`)).toBeInTheDocument()
    })

    it.each([
      // Missing required field cases
      {
        key: 'sender[0]',
        mode: 'missing',
        expected: 'Error in transaction at index 0 in the following fields: sender-value, sender-resolvedAddress',
      },
      {
        key: 'assetid[0]',
        mode: 'missing',
        expected: 'Error in transaction at index 0: Cannot convert undefined to a BigInt',
      },
      {
        key: 'closeto[0]',
        mode: 'missing',
        expected: 'Error in transaction at index 0 in the following fields: closeRemainderTo-value, closeRemainderTo-resolvedAddress',
      },
      {
        key: 'decimals[0]',
        mode: 'missing',
        expected: 'Error in transaction at index 0 in the following fields: asset-id',
      },
      // Invalid field value cases
      {
        key: 'sender[0]',
        mode: 'invalid',
        value: 'invalid-address',
        expected: 'Error in transaction at index 0 in the following fields: sender-value, sender-value',
      },
      {
        key: 'assetid[0]',
        mode: 'invalid',
        value: 'not-a-number',
        expected: 'Error in transaction at index 0: Cannot convert not-a-number to a BigInt',
      },
      {
        key: 'assetid[0]',
        mode: 'invalid',
        value: '0',
        expected: 'Error in transaction at index 0 in the following fields: asset-id',
      },
      {
        key: 'assetid[0]',
        mode: 'invalid',
        value: '-1',
        expected: 'Error in transaction at index 0 in the following fields: asset-id',
      },
      {
        key: 'closeto[0]',
        mode: 'invalid',
        value: 'invalid-address',
        expected: 'Error in transaction at index 0 in the following fields: closeRemainderTo-value, closeRemainderTo-value',
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
        'type[0]': 'AssetOptOut',
        'sender[0]': sender,
        'assetid[0]': assetId,
        'closeto[0]': closeto,
        'decimals[0]': decimals,
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

    it('should show "Asset does not exist" error when decimals is undefined', async () => {
      const baseParams: Record<string, string> = {
        'type[0]': 'AssetOptOut',
        'sender[0]': sender,
        'assetid[0]': assetId,
        'closeto[0]': closeto,
        // Note: deliberately omitting decimals[0] to trigger "asset does not exist"
      }
      const searchParams = new URLSearchParams(baseParams)
      renderTxnsWizardPageWithSearchParams({ searchParams })
      const toastElement = await screen.findByText('Error in transaction at index 0 in the following fields: asset-id')
      expect(toastElement).toBeInTheDocument()
      cleanup()
    })
  })
})
