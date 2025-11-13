import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vitest } from 'vitest'
import { TransactionWizardPage } from '../transaction-wizard-page'
import { render, screen, cleanup } from '@testing-library/react'
import { algorandFixture } from '@algorandfoundation/algokit-utils/testing'
import { TooltipProvider } from '@/features/common/components/tooltip'
import { ToastContainer } from 'react-toastify'
import { DataProvider } from '@/features/common/components/data-provider'
import { localnetId, defaultNetworkConfigs } from '@/features/network/data/'

const renderTxnsWizardPageWithSearchParams = ({ searchParams }: { searchParams: URLSearchParams }) => {
  const urlSearchParams = new URLSearchParams(searchParams).toString()

  const router = createMemoryRouter(
    [
      {
        path: '/localnet/transaction-wizard',
        element: (
          <DataProvider
            networkConfig={{
              id: 'localNet',
              ...defaultNetworkConfigs[localnetId],
            }}
          >
            <ToastContainer />
            <TooltipProvider>
              <TransactionWizardPage />
            </TooltipProvider>
          </DataProvider>
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
    it('should render offline key registration', async () => {
      const sender = 'I3345FUQQ2GRBHFZQPLYQQX5HJMMRZMABCHRLWV6RCJYC6OO4MOLEUBEGU'
      renderTxnsWizardPageWithSearchParams({
        searchParams: new URLSearchParams({
          'type[0]': 'keyreg',
          'sender[0]': sender,
        }),
      })
      expect(await screen.findByText('Offline')).toBeInTheDocument()
      expect(await screen.findByText(sender)).toBeInTheDocument()
    })

    it('should render online key registration with url safe values', async () => {
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
      expect(await screen.findByText('Online')).toBeInTheDocument()
      expect(await screen.findByText(sender)).toBeInTheDocument()
      expect(await screen.findByText('+lfw+Y04lTnllJfncgMjXuAePe8i8YyVeoR9c1Xi78c=')).toBeInTheDocument()
      expect(
        await screen.findByText('3NoXc2sEWlvQZ7XIrwVJjgjM30ndhvwGgcqwKugk1u5W/iy/JITXrykuy0hUvAxbVv0njOgBPtGFsFif3yLJpg==')
      ).toBeInTheDocument()
      expect(await screen.findByText(votefst.toString())).toBeInTheDocument()
      expect(await screen.findByText(votekd.toString())).toBeInTheDocument()
      expect(await screen.findByText('UU8zLMrFVfZPnzbnL6ThAArXFsznV3TvFVAun2ONcEI=')).toBeInTheDocument()
      expect(await screen.findByText(votelst.toString())).toBeInTheDocument()
      expect(await screen.findByText('2')).toBeInTheDocument()
    })

    it('should render online key registration with url encoded values', async () => {
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
      expect(await screen.findByText('Online')).toBeInTheDocument()
      expect(await screen.findByText(sender)).toBeInTheDocument()
      expect(await screen.findByText(selkey)).toBeInTheDocument()
      expect(await screen.findByText(sprfkey)).toBeInTheDocument()
      expect(await screen.findByText(votefst.toString())).toBeInTheDocument()
      expect(await screen.findByText(votekd.toString())).toBeInTheDocument()
      expect(await screen.findByText(votekey)).toBeInTheDocument()
      expect(await screen.findByText(votelst.toString())).toBeInTheDocument()
      expect(await screen.findByText('2')).toBeInTheDocument()
    })

    it('should render key registration without sender - auto populate sender with localnet address', async () => {
      const localnetDispenderAccount = await localnet.algorand.account.localNetDispenser()

      renderTxnsWizardPageWithSearchParams({
        searchParams: new URLSearchParams({
          'type[0]': 'keyreg',
        }),
      })

      expect(await screen.findByText('Offline')).toBeInTheDocument()
      // Find the yellow sender link (auto-populated)
      const senderLinks = await screen.findAllByText(localnetDispenderAccount.addr.toString())
      expect(senderLinks.some((link) => link.className.includes('text-yellow-500'))).toBe(true)
    })
  })

  describe('payment transaction search params', () => {
    const sender = 'I3345FUQQ2GRBHFZQPLYQQX5HJMMRZMABCHRLWV6RCJYC6OO4MOLEUBEGU'
    const receiver = 'AAOLENX3Z76HBMQOLQF4VW26ZQSORVX7ZQJ66LCPX36T2QNAUYOYEY76RM'
    const amount = 2_500_000
    const fee = 3_000_000
    const note = 'Some payment notes'

    it('should render payment transaction with minimal required fields only', async () => {
      renderTxnsWizardPageWithSearchParams({
        searchParams: new URLSearchParams({
          'type[0]': 'pay',
          'sender[0]': sender,
          'receiver[0]': receiver,
          'amount[0]': amount.toString(),
        }),
      })

      expect(await screen.findByText(sender)).toBeInTheDocument()
      expect(await screen.findByText(receiver)).toBeInTheDocument()
      expect(await screen.findByText('2.5')).toBeInTheDocument()
    })

    it('should render payment transaction with all optional fields', async () => {
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
      expect(await screen.findByText(sender)).toBeInTheDocument()
      expect(await screen.findByText(receiver)).toBeInTheDocument()
      expect(await screen.findByText('2.5')).toBeInTheDocument()
      expect(await screen.findByText('3')).toBeInTheDocument()
      expect(await screen.findByText(note)).toBeInTheDocument()
    })

    it('should render payment transaction with fee only', async () => {
      renderTxnsWizardPageWithSearchParams({
        searchParams: new URLSearchParams({
          'type[0]': 'pay',
          'sender[0]': sender,
          'receiver[0]': receiver,
          'amount[0]': amount.toString(),
          'fee[0]': fee.toString(),
        }),
      })
      expect(await screen.findByText(sender)).toBeInTheDocument()
      expect(await screen.findByText(receiver)).toBeInTheDocument()
      expect(await screen.findByText('2.5')).toBeInTheDocument()
      expect(await screen.findByText('3')).toBeInTheDocument()
    })

    it('should render payment transaction with note only', async () => {
      renderTxnsWizardPageWithSearchParams({
        searchParams: new URLSearchParams({
          'type[0]': 'pay',
          'sender[0]': sender,
          'receiver[0]': receiver,
          'amount[0]': amount.toString(),
          'note[0]': note,
        }),
      })
      expect(await screen.findByText(sender)).toBeInTheDocument()
      expect(await screen.findByText(receiver)).toBeInTheDocument()
      expect(await screen.findByText('2.5')).toBeInTheDocument()
      expect(await screen.findByText(note)).toBeInTheDocument()
    })

    // Test is failing with "Can't get LocalNet dispenser account from non LocalNet network""
    it('should render payment transaction without sender - auto populate sender with localnet address', async () => {
      const localnetDispenderAccount = await localnet.algorand.account.localNetDispenser()

      renderTxnsWizardPageWithSearchParams({
        searchParams: new URLSearchParams({
          'type[0]': 'pay',
          'receiver[0]': receiver,
          'amount[0]': amount.toString(),
          'fee[0]': fee.toString(),
          'note[0]': note,
        }),
      })

      expect(await screen.findByText(receiver)).toBeInTheDocument()
      expect(await screen.findByText('2.5')).toBeInTheDocument()
      expect(await screen.findByText(note)).toBeInTheDocument()
      expect(await screen.findByText(localnetDispenderAccount.toString())).toBeInTheDocument()
    })

    it.each([
      // Missing required field cases
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

    it('should render asset create transaction with minimal required fields only', async () => {
      renderTxnsWizardPageWithSearchParams({
        searchParams: new URLSearchParams({
          'type[0]': 'acfg',
          'sender[0]': sender,
          'total[0]': total,
          'decimals[0]': decimals,
        }),
      })

      expect(await screen.findByText(sender)).toBeInTheDocument()
      expect(await screen.findByText('1000000')).toBeInTheDocument()
      expect(await screen.findByText(decimals)).toBeInTheDocument()
    })

    it('should render asset create transaction with all optional fields', async () => {
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

      expect(await screen.findByText(sender)).toBeInTheDocument()
      expect(await screen.findByText('1000000')).toBeInTheDocument()
      expect(await screen.findByText(decimals)).toBeInTheDocument()
      expect(await screen.findByText(assetName)).toBeInTheDocument()
      expect(await screen.findByText(unitName)).toBeInTheDocument()
      expect(await screen.findByText(url)).toBeInTheDocument()
      expect(await screen.findByText(manager)).toBeInTheDocument()
      expect(await screen.findByText(reserve)).toBeInTheDocument()
      expect(await screen.findByText(freeze)).toBeInTheDocument()
      expect(await screen.findByText(clawback)).toBeInTheDocument()
      expect(await screen.findByText('0.002')).toBeInTheDocument()
      expect(await screen.findByText(note)).toBeInTheDocument()
    })

    it('should render asset create transaction with fee only', async () => {
      renderTxnsWizardPageWithSearchParams({
        searchParams: new URLSearchParams({
          'type[0]': 'acfg',
          'sender[0]': sender,
          'total[0]': total,
          'decimals[0]': decimals,
          'fee[0]': fee,
        }),
      })

      expect(await screen.findByText(sender)).toBeInTheDocument()
      expect(await screen.findByText('1000000')).toBeInTheDocument()
      expect(await screen.findByText(decimals)).toBeInTheDocument()
      expect(await screen.findByText('0.002')).toBeInTheDocument()
    })

    it('should render asset create transaction with note only', async () => {
      renderTxnsWizardPageWithSearchParams({
        searchParams: new URLSearchParams({
          'type[0]': 'acfg',
          'sender[0]': sender,
          'total[0]': total,
          'decimals[0]': decimals,
          'note[0]': note,
        }),
      })

      expect(await screen.findByText(sender)).toBeInTheDocument()
      expect(await screen.findByText('1000000')).toBeInTheDocument()
      expect(await screen.findByText(decimals)).toBeInTheDocument()
      expect(await screen.findByText(note)).toBeInTheDocument()
    })

    it('should render asset create transaction without sender - auto populate sender with localnet address', async () => {
      const localnetDispenderAccount = await localnet.algorand.account.localNetDispenser()

      renderTxnsWizardPageWithSearchParams({
        searchParams: new URLSearchParams({
          'type[0]': 'acfg',
          'total[0]': total,
          'decimals[0]': decimals,
          'note[0]': note,
        }),
      })

      expect(await screen.findByText(total)).toBeInTheDocument()
      expect(await screen.findByText(decimals)).toBeInTheDocument()
      expect(await screen.findByText(note)).toBeInTheDocument()
      expect(await screen.findByText(localnetDispenderAccount.addr.toString())).toBeInTheDocument()
    })

    it.each([
      // Missing required field cases

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
    const fee = '2000'
    const note = 'Asset opt-in test'

    it('should render asset opt-in transaction with minimal required fields', async () => {
      renderTxnsWizardPageWithSearchParams({
        searchParams: new URLSearchParams({
          'type[0]': 'axfer',
          'sender[0]': sender,
          'assetid[0]': assetId,
          'decimals[0]': decimals,
        }),
      })

      // Sender is displayed twice in the UI, once as the sender and once as the asset receiver.
      expect(await screen.findAllByText(sender)).toHaveLength(2)
      expect(await screen.findByText(assetId)).toBeInTheDocument()
    })

    it('should render asset opt-in transaction with all optional fields', async () => {
      renderTxnsWizardPageWithSearchParams({
        searchParams: new URLSearchParams({
          'type[0]': 'axfer',
          'sender[0]': sender,
          'assetid[0]': assetId,
          'decimals[0]': decimals,
          'unitname[0]': unitName,
          'fee[0]': fee,
          'note[0]': note,
        }),
      })
      screen.debug(undefined, 1000000)

      expect(await screen.findAllByText(sender)).toHaveLength(2)
      expect(await screen.findByText(assetId)).toBeInTheDocument()
      expect(await screen.findByText(`0 ${unitName}`)).toBeInTheDocument()
      expect(await screen.findByText('0.002')).toBeInTheDocument()
      expect(await screen.findByText(note)).toBeInTheDocument()
    })

    it('should render asset opt-in transaction with fee only', async () => {
      renderTxnsWizardPageWithSearchParams({
        searchParams: new URLSearchParams({
          'type[0]': 'axfer',
          'sender[0]': sender,
          'assetid[0]': assetId,
          'decimals[0]': decimals,
          'fee[0]': fee,
        }),
      })

      expect(await screen.findAllByText(sender)).toHaveLength(2)
      expect(await screen.findByText(assetId)).toBeInTheDocument()
      expect(await screen.findByText('0.002')).toBeInTheDocument()
    })

    it('should render asset opt-in transaction with note only', async () => {
      renderTxnsWizardPageWithSearchParams({
        searchParams: new URLSearchParams({
          'type[0]': 'axfer',
          'sender[0]': sender,
          'assetid[0]': assetId,
          'decimals[0]': decimals,
          'note[0]': note,
        }),
      })

      expect(await screen.findAllByText(sender)).toHaveLength(2)
      expect(await screen.findByText(assetId)).toBeInTheDocument()
      expect(await screen.findByText(note)).toBeInTheDocument()
    })

    it('should render asset opt-in transaction with unit name only', async () => {
      renderTxnsWizardPageWithSearchParams({
        searchParams: new URLSearchParams({
          'type[0]': 'axfer',
          'sender[0]': sender,
          'assetid[0]': assetId,
          'decimals[0]': decimals,
          'unitname[0]': unitName,
        }),
      })

      expect(await screen.findAllByText(sender)).toHaveLength(2)
      expect(await screen.findByText(assetId)).toBeInTheDocument()
      expect(await screen.findByText(`0 ${unitName}`)).toBeInTheDocument()
    })

    it('should render asset opt-in transaction without sender auto-populated', async () => {
      const localnetDispenderAccount = await localnet.algorand.account.localNetDispenser()

      renderTxnsWizardPageWithSearchParams({
        searchParams: new URLSearchParams({
          'type[0]': 'axfer',
          'assetid[0]': assetId,
          'decimals[0]': decimals,
          'unitname[0]': unitName,
        }),
      })

      expect(await screen.findByText(assetId)).toBeInTheDocument()
      expect(await screen.findByText(`0 ${unitName}`)).toBeInTheDocument()
      // Find the yellow sender link (auto-populated)
      const senderLinks = await screen.findAllByText(localnetDispenderAccount.addr.toString())
      expect(senderLinks.some((link) => link.className.includes('text-yellow-500'))).toBe(true)
    })

    it.each([
      // Missing required field cases

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
    const fee = '2000'
    const note = 'Asset opt-out test'

    it('should render asset opt-out transaction with minimal required fields', async () => {
      renderTxnsWizardPageWithSearchParams({
        searchParams: new URLSearchParams({
          'type[0]': 'AssetOptOut',
          'sender[0]': sender,
          'assetid[0]': assetId,
          'closeto[0]': closeto,
          'decimals[0]': decimals,
        }),
      })

      expect(await screen.findAllByText(sender)).toHaveLength(2)
      expect(await screen.findByText(assetId)).toBeInTheDocument()
      expect(await screen.findByText(closeto)).toBeInTheDocument()
    })

    it('should render asset opt-out transaction with all optional fields', async () => {
      renderTxnsWizardPageWithSearchParams({
        searchParams: new URLSearchParams({
          'type[0]': 'AssetOptOut',
          'sender[0]': sender,
          'assetid[0]': assetId,
          'closeto[0]': closeto,
          'decimals[0]': decimals,
          'unitname[0]': unitName,
          'fee[0]': fee,
          'note[0]': note,
        }),
      })

      expect(await screen.findAllByText(sender)).toHaveLength(2)
      expect(await screen.findByText(assetId)).toBeInTheDocument()
      expect(await screen.findByText(closeto)).toBeInTheDocument()
      expect(await screen.findByText(`0 ${unitName}`)).toBeInTheDocument()
      expect(await screen.findByText('0.002')).toBeInTheDocument()
      expect(await screen.findByText(note)).toBeInTheDocument()
    })

    it('should render asset opt-out transaction with fee only', async () => {
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

      expect(await screen.findAllByText(sender)).toHaveLength(2)
      expect(await screen.findByText(assetId)).toBeInTheDocument()
      expect(await screen.findByText(closeto)).toBeInTheDocument()
      expect(await screen.findByText('0.002')).toBeInTheDocument()
    })

    it('should render asset opt-out transaction with note only', async () => {
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

      expect(await screen.findAllByText(sender)).toHaveLength(2)
      expect(await screen.findByText(assetId)).toBeInTheDocument()
      expect(await screen.findByText(closeto)).toBeInTheDocument()
      expect(await screen.findByText(note)).toBeInTheDocument()
    })

    it('should render asset opt-out transaction with unit name only', async () => {
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

      expect(await screen.findAllByText(sender)).toHaveLength(2)
      expect(await screen.findByText(assetId)).toBeInTheDocument()
      expect(await screen.findByText(closeto)).toBeInTheDocument()
      expect(await screen.findByText(`0 ${unitName}`)).toBeInTheDocument()
    })

    it('should render asset opt-out transaction without sender - auto populate sender with localnet address', async () => {
      const localnetDispenderAccount = await localnet.algorand.account.localNetDispenser()

      renderTxnsWizardPageWithSearchParams({
        searchParams: new URLSearchParams({
          'type[0]': 'AssetOptOut',
          'assetid[0]': assetId,
          'closeto[0]': closeto,
          'decimals[0]': decimals,
        }),
      })

      expect(await screen.findByText(assetId)).toBeInTheDocument()
      expect(await screen.findByText(closeto)).toBeInTheDocument()
      // Find the yellow sender link (auto-populated)
      const senderLinks = await screen.findAllByText(localnetDispenderAccount.addr.toString())
      expect(senderLinks.some((link) => link.className.includes('text-yellow-500'))).toBe(true)
    })

    it.each([
      // Missing required field cases

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

  describe('asset transfer transaction search params', () => {
    const sender = 'I3345FUQQ2GRBHFZQPLYQQX5HJMMRZMABCHRLWV6RCJYC6OO4MOLEUBEGU'
    const receiver = 'AAOLENX3Z76HBMQOLQF4VW26ZQSORVX7ZQJ66LCPX36T2QNAUYOYEY76RM'
    const assetId = '12345'
    const amount = '10.5'
    const decimals = '6'
    const unitName = 'USDC'
    const clawback = 'DJ76C74DI7EDNSHQLAJXGMBHFINBLATVGNRAVCO3VILPCQR7LKY7GPUL7Y'
    const fee = '2000'
    const note = 'Asset transfer test'

    it('should render asset transfer transaction with minimal required fields', async () => {
      renderTxnsWizardPageWithSearchParams({
        searchParams: new URLSearchParams({
          'type[0]': 'AssetTransfer',
          'sender[0]': sender,
          'receiver[0]': receiver,
          'assetid[0]': assetId,
          'amount[0]': amount,
          'decimals[0]': decimals,
        }),
      })

      expect(await screen.findByText(sender)).toBeInTheDocument()
      expect(await screen.findByText(receiver)).toBeInTheDocument()
      expect(await screen.findByText(assetId)).toBeInTheDocument()
      expect(await screen.findByText(amount)).toBeInTheDocument()
    })

    it('should render asset transfer transaction with all optional fields', async () => {
      renderTxnsWizardPageWithSearchParams({
        searchParams: new URLSearchParams({
          'type[0]': 'AssetTransfer',
          'sender[0]': sender,
          'receiver[0]': receiver,
          'assetid[0]': assetId,
          'amount[0]': amount,
          'decimals[0]': decimals,
          'unitname[0]': unitName,
          'clawback[0]': clawback,
          'fee[0]': fee,
          'note[0]': note,
        }),
      })

      expect(await screen.findByText(sender)).toBeInTheDocument()
      expect(await screen.findByText(receiver)).toBeInTheDocument()
      expect(await screen.findByText(assetId)).toBeInTheDocument()
      expect(await screen.findByText(`${amount} ${unitName}`)).toBeInTheDocument()
      expect(await screen.findByText('0.002')).toBeInTheDocument()
      expect(await screen.findByText(note)).toBeInTheDocument()
    })

    it('should render asset transfer transaction with fee only', async () => {
      renderTxnsWizardPageWithSearchParams({
        searchParams: new URLSearchParams({
          'type[0]': 'AssetTransfer',
          'sender[0]': sender,
          'receiver[0]': receiver,
          'assetid[0]': assetId,
          'amount[0]': amount,
          'decimals[0]': decimals,
          'fee[0]': fee,
        }),
      })

      expect(await screen.findByText(sender)).toBeInTheDocument()
      expect(await screen.findByText(receiver)).toBeInTheDocument()
      expect(await screen.findByText(assetId)).toBeInTheDocument()
      expect(await screen.findByText(amount)).toBeInTheDocument()
      expect(await screen.findByText('0.002')).toBeInTheDocument()
    })

    it('should render asset transfer transaction with note only', async () => {
      renderTxnsWizardPageWithSearchParams({
        searchParams: new URLSearchParams({
          'type[0]': 'AssetTransfer',
          'sender[0]': sender,
          'receiver[0]': receiver,
          'assetid[0]': assetId,
          'amount[0]': amount,
          'decimals[0]': decimals,
          'note[0]': note,
        }),
      })

      expect(await screen.findByText(sender)).toBeInTheDocument()
      expect(await screen.findByText(receiver)).toBeInTheDocument()
      expect(await screen.findByText(assetId)).toBeInTheDocument()
      expect(await screen.findByText(amount)).toBeInTheDocument()
      expect(await screen.findByText(note)).toBeInTheDocument()
    })

    it('should render asset transfer transaction with unit name only', async () => {
      renderTxnsWizardPageWithSearchParams({
        searchParams: new URLSearchParams({
          'type[0]': 'AssetTransfer',
          'sender[0]': sender,
          'receiver[0]': receiver,
          'assetid[0]': assetId,
          'amount[0]': amount,
          'decimals[0]': decimals,
          'unitname[0]': unitName,
        }),
      })

      expect(await screen.findByText(sender)).toBeInTheDocument()
      expect(await screen.findByText(receiver)).toBeInTheDocument()
      expect(await screen.findByText(assetId)).toBeInTheDocument()
      expect(await screen.findByText(`${amount} ${unitName}`)).toBeInTheDocument()
    })

    it('should render asset transfer transaction without sender - auto populate sender with localnet address', async () => {
      const localnetDispenderAccount = await localnet.algorand.account.localNetDispenser()

      renderTxnsWizardPageWithSearchParams({
        searchParams: new URLSearchParams({
          'type[0]': 'AssetTransfer',
          'receiver[0]': receiver,
          'assetid[0]': assetId,
          'amount[0]': amount,
          'decimals[0]': decimals,
        }),
      })

      expect(await screen.findByText(receiver)).toBeInTheDocument()
      expect(await screen.findByText(assetId)).toBeInTheDocument()
      expect(await screen.findByText(amount)).toBeInTheDocument()
      // Find the yellow sender link (auto-populated)
      const senderLinks = await screen.findAllByText(localnetDispenderAccount.addr.toString())
      expect(senderLinks.some((link) => link.className.includes('text-yellow-500'))).toBe(true)
    })

    it.each([
      // Missing required field cases

      {
        key: 'receiver[0]',
        mode: 'missing',
        expected: 'Error in transaction at index 0 in the following fields: receiver-value, receiver-resolvedAddress',
      },
      {
        key: 'assetid[0]',
        mode: 'missing',
        expected: 'Error in transaction at index 0: Cannot convert undefined to a BigInt',
      },
      {
        key: 'amount[0]',
        mode: 'missing',
        expected: 'Error in transaction at index 0: [DecimalError] Invalid argument: undefined',
      },
      {
        key: 'decimals[0]',
        mode: 'missing',
        expected: 'Error in transaction at index 0 in the following fields: asset-id',
      },
      // Invalid field value cases

      {
        key: 'receiver[0]',
        mode: 'invalid',
        value: 'invalid-address',
        expected: 'Error in transaction at index 0 in the following fields: receiver-value, receiver-value',
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
        key: 'amount[0]',
        mode: 'invalid',
        value: 'not-a-number',
        expected: 'Error in transaction at index 0: [DecimalError] Invalid argument: not-a-number',
      },
      {
        key: 'amount[0]',
        mode: 'invalid',
        value: '-10',
        expected: 'Error in transaction at index 0 in the following fields: amount',
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
        'type[0]': 'AssetTransfer',
        'sender[0]': sender,
        'receiver[0]': receiver,
        'assetid[0]': assetId,
        'amount[0]': amount,
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
        'type[0]': 'AssetTransfer',
        'sender[0]': sender,
        'receiver[0]': receiver,
        'assetid[0]': assetId,
        'amount[0]': amount,
        // Note: deliberately omitting decimals[0] to trigger "asset does not exist"
      }
      const searchParams = new URLSearchParams(baseParams)
      renderTxnsWizardPageWithSearchParams({ searchParams })
      const toastElement = await screen.findByText('Error in transaction at index 0 in the following fields: asset-id')
      expect(toastElement).toBeInTheDocument()
      cleanup()
    })
  })

  describe('asset reconfigure transaction search params', () => {
    const sender = 'I3345FUQQ2GRBHFZQPLYQQX5HJMMRZMABCHRLWV6RCJYC6OO4MOLEUBEGU'
    const assetId = '12345'
    const assetManager = 'I3345FUQQ2GRBHFZQPLYQQX5HJMMRZMABCHRLWV6RCJYC6OO4MOLEUBEGU' // Must be same as sender
    const decimals = '6'
    const unitName = 'TOKEN'
    const manager = 'AAOLENX3Z76HBMQOLQF4VW26ZQSORVX7ZQJ66LCPX36T2QNAUYOYEY76RM'
    const reserve = 'DJ76C74DI7EDNSHQLAJXGMBHFINBLATVGNRAVCO3VILPCQR7LKY7GPUL7Y'
    const freeze = 'UJSXVS7TLTNFZF4PDRYDQI4IGMZNF7S4PO2F7ZNX372UWFJMNT4ZJ7RAEI'
    const clawback = 'U6S57IUI3EJIIKPGGGKGD5C6S2VCJQ3SBWDDWUO4LNI7QL5AA3LTZKEWZM'
    const fee = '2000'
    const note = 'Asset reconfigure test'

    it('should render asset reconfigure transaction with minimal required fields', async () => {
      renderTxnsWizardPageWithSearchParams({
        searchParams: new URLSearchParams({
          'type[0]': 'AssetReconfigure',
          'sender[0]': sender,
          'assetid[0]': assetId,
          'assetmanager[0]': assetManager,
          'decimals[0]': decimals,
        }),
      })

      expect(await screen.findByText(sender)).toBeInTheDocument()
      expect(await screen.findByText(assetId)).toBeInTheDocument()
    })

    it('should render asset reconfigure transaction with all optional fields', async () => {
      renderTxnsWizardPageWithSearchParams({
        searchParams: new URLSearchParams({
          'type[0]': 'AssetReconfigure',
          'sender[0]': sender,
          'assetid[0]': assetId,
          'assetmanager[0]': assetManager,
          'decimals[0]': decimals,
          'unitname[0]': unitName,
          'manager[0]': manager,
          'reserve[0]': reserve,
          'freeze[0]': freeze,
          'clawback[0]': clawback,
          'fee[0]': fee,
          'note[0]': note,
        }),
      })

      expect(await screen.findByText(sender)).toBeInTheDocument()
      expect(await screen.findByText(assetId)).toBeInTheDocument()
      expect(await screen.findByText(manager)).toBeInTheDocument()
      expect(await screen.findByText(reserve)).toBeInTheDocument()
      expect(await screen.findByText(freeze)).toBeInTheDocument()
      expect(await screen.findByText(clawback)).toBeInTheDocument()
      expect(await screen.findByText('0.002')).toBeInTheDocument()
      expect(await screen.findByText(note)).toBeInTheDocument()
    })

    it('should render asset reconfigure transaction with fee only', async () => {
      renderTxnsWizardPageWithSearchParams({
        searchParams: new URLSearchParams({
          'type[0]': 'AssetReconfigure',
          'sender[0]': sender,
          'assetid[0]': assetId,
          'assetmanager[0]': assetManager,
          'decimals[0]': decimals,
          'fee[0]': fee,
        }),
      })

      expect(await screen.findByText(sender)).toBeInTheDocument()
      expect(await screen.findByText(assetId)).toBeInTheDocument()
      expect(await screen.findByText('0.002')).toBeInTheDocument()
    })

    it('should render asset reconfigure transaction with note only', async () => {
      renderTxnsWizardPageWithSearchParams({
        searchParams: new URLSearchParams({
          'type[0]': 'AssetReconfigure',
          'sender[0]': sender,
          'assetid[0]': assetId,
          'assetmanager[0]': assetManager,
          'decimals[0]': decimals,
          'note[0]': note,
        }),
      })

      expect(await screen.findByText(sender)).toBeInTheDocument()
      expect(await screen.findByText(assetId)).toBeInTheDocument()
      expect(await screen.findByText(note)).toBeInTheDocument()
    })

    it('should render asset reconfigure transaction with unit name only', async () => {
      renderTxnsWizardPageWithSearchParams({
        searchParams: new URLSearchParams({
          'type[0]': 'AssetReconfigure',
          'sender[0]': sender,
          'assetid[0]': assetId,
          'assetmanager[0]': assetManager,
          'decimals[0]': decimals,
          'unitname[0]': unitName,
        }),
      })

      expect(await screen.findByText(sender)).toBeInTheDocument()
      expect(await screen.findByText(assetId)).toBeInTheDocument()
    })

    it.each([
      // Missing required field cases

      {
        key: 'assetid[0]',
        mode: 'missing',
        expected: 'Error in transaction at index 0: Cannot convert undefined to a BigInt',
      },
      {
        key: 'assetmanager[0]',
        mode: 'missing',
        expected: 'Error in transaction at index 0 in the following fields: asset-id',
      },
      {
        key: 'decimals[0]',
        mode: 'missing',
        expected: 'Error in transaction at index 0 in the following fields: asset-id',
      },

      // Invalid field value cases
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
        'type[0]': 'AssetReconfigure',
        'sender[0]': sender,
        'assetid[0]': assetId,
        'assetmanager[0]': assetManager,
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

    it('should show "Asset cannot be reconfigured" error when assetmanager is undefined', async () => {
      const baseParams: Record<string, string> = {
        'type[0]': 'AssetReconfigure',
        'sender[0]': sender,
        'assetid[0]': assetId,
        'decimals[0]': decimals,
        // Note: deliberately omitting assetmanager[0] to trigger "asset cannot be reconfigured"
      }
      const searchParams = new URLSearchParams(baseParams)
      renderTxnsWizardPageWithSearchParams({ searchParams })
      const toastElement = await screen.findByText('Error in transaction at index 0 in the following fields: asset-id')
      expect(toastElement).toBeInTheDocument()
      cleanup()
    })

    it('should show "Asset does not exist" error when decimals is undefined', async () => {
      const baseParams: Record<string, string> = {
        'type[0]': 'AssetReconfigure',
        'sender[0]': sender,
        'assetid[0]': assetId,
        'assetmanager[0]': assetManager,
        // Note: deliberately omitting decimals[0] to trigger "asset does not exist"
      }
      const searchParams = new URLSearchParams(baseParams)
      renderTxnsWizardPageWithSearchParams({ searchParams })
      const toastElement = await screen.findByText('Error in transaction at index 0 in the following fields: asset-id')
      expect(toastElement).toBeInTheDocument()
      cleanup()
    })

    it('should show "Must be the manager account of the asset" error when sender is not the asset manager', async () => {
      const differentSender = 'AAOLENX3Z76HBMQOLQF4VW26ZQSORVX7ZQJ66LCPX36T2QNAUYOYEY76RM'
      const baseParams: Record<string, string> = {
        'type[0]': 'AssetReconfigure',
        'sender[0]': differentSender, // Different from assetManager
        'assetid[0]': assetId,
        'assetmanager[0]': assetManager,
        'decimals[0]': decimals,
      }
      const searchParams = new URLSearchParams(baseParams)
      renderTxnsWizardPageWithSearchParams({ searchParams })
      const toastElement = await screen.findByText('Error in transaction at index 0 in the following fields: sender.value')
      expect(toastElement).toBeInTheDocument()
      cleanup()
    })
  })

  describe('asset destroy transaction search params', () => {
    const sender = 'I3345FUQQ2GRBHFZQPLYQQX5HJMMRZMABCHRLWV6RCJYC6OO4MOLEUBEGU'
    const assetId = '12345'
    const assetManager = 'I3345FUQQ2GRBHFZQPLYQQX5HJMMRZMABCHRLWV6RCJYC6OO4MOLEUBEGU' // Must be same as sender
    const decimals = '6'
    const fee = '2000'
    const note = 'Asset destroy test'

    it('should render asset destroy transaction with minimal required fields', async () => {
      renderTxnsWizardPageWithSearchParams({
        searchParams: new URLSearchParams({
          'type[0]': 'AssetDestroy',
          'sender[0]': sender,
          'assetid[0]': assetId,
          'assetmanager[0]': assetManager,
          'decimals[0]': decimals,
        }),
      })

      expect(await screen.findByText(sender)).toBeInTheDocument()
      expect(await screen.findByText(assetId)).toBeInTheDocument()
    })

    it('should render asset destroy transaction with all optional fields', async () => {
      renderTxnsWizardPageWithSearchParams({
        searchParams: new URLSearchParams({
          'type[0]': 'AssetDestroy',
          'sender[0]': sender,
          'assetid[0]': assetId,
          'assetmanager[0]': assetManager,
          'decimals[0]': decimals,
          'fee[0]': fee,
          'note[0]': note,
        }),
      })

      expect(await screen.findByText(sender)).toBeInTheDocument()
      expect(await screen.findByText(assetId)).toBeInTheDocument()
    })

    it('should render asset destroy transaction with fee only', async () => {
      renderTxnsWizardPageWithSearchParams({
        searchParams: new URLSearchParams({
          'type[0]': 'AssetDestroy',
          'sender[0]': sender,
          'assetid[0]': assetId,
          'assetmanager[0]': assetManager,
          'decimals[0]': decimals,
          'fee[0]': fee,
        }),
      })

      expect(await screen.findByText(sender)).toBeInTheDocument()
      expect(await screen.findByText(assetId)).toBeInTheDocument()
    })

    it('should render asset destroy transaction with note only', async () => {
      renderTxnsWizardPageWithSearchParams({
        searchParams: new URLSearchParams({
          'type[0]': 'AssetDestroy',
          'sender[0]': sender,
          'assetid[0]': assetId,
          'assetmanager[0]': assetManager,
          'decimals[0]': decimals,
          'note[0]': note,
        }),
      })

      expect(await screen.findByText(sender)).toBeInTheDocument()
      expect(await screen.findByText(assetId)).toBeInTheDocument()
    })

    it('should render asset destroy transaction without sender - auto populate sender with localnet address', async () => {
      const localnetDispenderAccount = await localnet.algorand.account.localNetDispenser()

      renderTxnsWizardPageWithSearchParams({
        searchParams: new URLSearchParams({
          'type[0]': 'AssetDestroy',
          'assetid[0]': assetId,
          'assetmanager[0]': assetManager,
          'decimals[0]': decimals,
        }),
      })

      expect(await screen.findByText(assetId)).toBeInTheDocument()
      // Find the yellow sender link (auto-populated)
      const senderLinks = await screen.findAllByText(localnetDispenderAccount.addr.toString())
      expect(senderLinks.some((link) => link.className.includes('text-yellow-500'))).toBe(true)
    })

    it.each([
      // Missing required field cases

      {
        key: 'assetid[0]',
        mode: 'missing',
        expected: 'Error in transaction at index 0: Cannot convert undefined to a BigInt',
      },
      {
        key: 'assetmanager[0]',
        mode: 'missing',
        expected: 'Error in transaction at index 0 in the following fields: asset-id',
      },
      {
        key: 'decimals[0]',
        mode: 'missing',
        expected: 'Error in transaction at index 0 in the following fields: asset-id',
      },
      // Invalid field value cases

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
        'type[0]': 'AssetDestroy',
        'sender[0]': sender,
        'assetid[0]': assetId,
        'assetmanager[0]': assetManager,
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
        'type[0]': 'AssetDestroy',
        'sender[0]': sender,
        'assetid[0]': assetId,
        'assetmanager[0]': assetManager,
        // Note: deliberately omitting decimals[0] to trigger "asset does not exist"
      }
      const searchParams = new URLSearchParams(baseParams)
      renderTxnsWizardPageWithSearchParams({ searchParams })
      const toastElement = await screen.findByText('Error in transaction at index 0 in the following fields: asset-id')
      expect(toastElement).toBeInTheDocument()
      cleanup()
    })

    it('should show "Asset cannot be destroyed" error when assetmanager is undefined', async () => {
      const baseParams: Record<string, string> = {
        'type[0]': 'AssetDestroy',
        'sender[0]': sender,
        'assetid[0]': assetId,
        'decimals[0]': decimals,
        // Note: deliberately omitting assetmanager[0] to trigger "asset cannot be destroyed"
      }
      const searchParams = new URLSearchParams(baseParams)
      renderTxnsWizardPageWithSearchParams({ searchParams })
      const toastElement = await screen.findByText('Error in transaction at index 0 in the following fields: asset-id')
      expect(toastElement).toBeInTheDocument()
      cleanup()
    })
  })

  describe('asset freeze transaction search params', () => {
    const sender = 'I3345FUQQ2GRBHFZQPLYQQX5HJMMRZMABCHRLWV6RCJYC6OO4MOLEUBEGU'
    const freezeto = 'AAOLENX3Z76HBMQOLQF4VW26ZQSORVX7ZQJ66LCPX36T2QNAUYOYEY76RM'
    const assetId = '12345'
    const assetfreeze = 'I3345FUQQ2GRBHFZQPLYQQX5HJMMRZMABCHRLWV6RCJYC6OO4MOLEUBEGU' // Must be same as sender
    const frozen = 'true'
    const decimals = '6'
    const unitName = 'TOKEN'
    const fee = '2000'
    const note = 'Asset freeze test'

    it('should render asset freeze transaction with minimal required fields', async () => {
      renderTxnsWizardPageWithSearchParams({
        searchParams: new URLSearchParams({
          'type[0]': 'AssetFreeze',
          'sender[0]': sender,
          'freezeto[0]': freezeto,
          'assetid[0]': assetId,
          'assetfreeze[0]': assetfreeze,
          'frozen[0]': frozen,
          'decimals[0]': decimals,
        }),
      })

      expect(await screen.findByText(sender)).toBeInTheDocument()
      expect(await screen.findByText(freezeto)).toBeInTheDocument()
      expect(await screen.findByText(assetId)).toBeInTheDocument()
      expect(await screen.findByText('Freeze asset')).toBeInTheDocument()
    })

    it('should render asset freeze transaction with all optional fields', async () => {
      renderTxnsWizardPageWithSearchParams({
        searchParams: new URLSearchParams({
          'type[0]': 'AssetFreeze',
          'sender[0]': sender,
          'freezeto[0]': freezeto,
          'assetid[0]': assetId,
          'assetfreeze[0]': assetfreeze,
          'frozen[0]': frozen,
          'decimals[0]': decimals,
          'unitname[0]': unitName,
          'fee[0]': fee,
          'note[0]': note,
        }),
      })

      expect(await screen.findByText(sender)).toBeInTheDocument()
      expect(await screen.findByText(freezeto)).toBeInTheDocument()
      expect(await screen.findByText(assetId)).toBeInTheDocument()
      expect(await screen.findByText('Freeze asset')).toBeInTheDocument()
      expect(await screen.findByText('0.002')).toBeInTheDocument()
      expect(await screen.findByText(note)).toBeInTheDocument()
    })

    it('should render asset unfreeze transaction', async () => {
      renderTxnsWizardPageWithSearchParams({
        searchParams: new URLSearchParams({
          'type[0]': 'AssetFreeze',
          'sender[0]': sender,
          'freezeto[0]': freezeto,
          'assetid[0]': assetId,
          'assetfreeze[0]': assetfreeze,
          'frozen[0]': 'false',
          'decimals[0]': decimals,
        }),
      })

      expect(await screen.findByText(sender)).toBeInTheDocument()
      expect(await screen.findByText(freezeto)).toBeInTheDocument()
      expect(await screen.findByText(assetId)).toBeInTheDocument()
      expect(await screen.findByText('Unfreeze asset')).toBeInTheDocument()
    })

    it('should render asset freeze transaction with fee only', async () => {
      renderTxnsWizardPageWithSearchParams({
        searchParams: new URLSearchParams({
          'type[0]': 'AssetFreeze',
          'sender[0]': sender,
          'freezeto[0]': freezeto,
          'assetid[0]': assetId,
          'assetfreeze[0]': assetfreeze,
          'frozen[0]': frozen,
          'decimals[0]': decimals,
          'fee[0]': fee,
        }),
      })

      expect(await screen.findByText(sender)).toBeInTheDocument()
      expect(await screen.findByText(freezeto)).toBeInTheDocument()
      expect(await screen.findByText(assetId)).toBeInTheDocument()
      expect(await screen.findByText('Freeze asset')).toBeInTheDocument()
      expect(await screen.findByText('0.002')).toBeInTheDocument()
    })

    it('should render asset freeze transaction with note only', async () => {
      renderTxnsWizardPageWithSearchParams({
        searchParams: new URLSearchParams({
          'type[0]': 'AssetFreeze',
          'sender[0]': sender,
          'freezeto[0]': freezeto,
          'assetid[0]': assetId,
          'assetfreeze[0]': assetfreeze,
          'frozen[0]': frozen,
          'decimals[0]': decimals,
          'note[0]': note,
        }),
      })

      expect(await screen.findByText(sender)).toBeInTheDocument()
      expect(await screen.findByText(freezeto)).toBeInTheDocument()
      expect(await screen.findByText(assetId)).toBeInTheDocument()
      expect(await screen.findByText('Freeze asset')).toBeInTheDocument()
      expect(await screen.findByText(note)).toBeInTheDocument()
    })

    it('should render asset freeze transaction with unit name only', async () => {
      renderTxnsWizardPageWithSearchParams({
        searchParams: new URLSearchParams({
          'type[0]': 'AssetFreeze',
          'sender[0]': sender,
          'freezeto[0]': freezeto,
          'assetid[0]': assetId,
          'assetfreeze[0]': assetfreeze,
          'frozen[0]': frozen,
          'decimals[0]': decimals,
          'unitname[0]': unitName,
        }),
      })

      expect(await screen.findByText(sender)).toBeInTheDocument()
      expect(await screen.findByText(freezeto)).toBeInTheDocument()
      expect(await screen.findByText(assetId)).toBeInTheDocument()
      expect(await screen.findByText('Freeze asset')).toBeInTheDocument()
    })

    it.each([
      // Missing required field cases

      {
        key: 'freezeto[0]',
        mode: 'missing',
        expected: 'Error in transaction at index 0 in the following fields: freezeTarget-value, freezeTarget-resolvedAddress',
      },
      {
        key: 'assetid[0]',
        mode: 'missing',
        expected: 'Error in transaction at index 0: Cannot convert undefined to a BigInt',
      },
      {
        key: 'assetfreeze[0]',
        mode: 'missing',
        expected: 'Error in transaction at index 0 in the following fields: asset-id',
      },
      {
        key: 'decimals[0]',
        mode: 'missing',
        expected: 'Error in transaction at index 0 in the following fields: asset-id',
      },
      // Invalid field value cases
      {
        key: 'freezeto[0]',
        mode: 'invalid',
        value: 'invalid-address',
        expected: 'Error in transaction at index 0 in the following fields: freezeTarget-value, freezeTarget-value',
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
        'type[0]': 'AssetFreeze',
        'sender[0]': sender,
        'freezeto[0]': freezeto,
        'assetid[0]': assetId,
        'assetfreeze[0]': assetfreeze,
        'frozen[0]': frozen,
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
        'type[0]': 'AssetFreeze',
        'sender[0]': sender,
        'freezeto[0]': freezeto,
        'assetid[0]': assetId,
        'assetfreeze[0]': assetfreeze,
        'frozen[0]': frozen,
        // Note: deliberately omitting decimals[0] to trigger "asset does not exist"
      }
      const searchParams = new URLSearchParams(baseParams)
      renderTxnsWizardPageWithSearchParams({ searchParams })
      const toastElement = await screen.findByText('Error in transaction at index 0 in the following fields: asset-id')
      expect(toastElement).toBeInTheDocument()
      cleanup()
    })

    it('should show "Asset cannot be frozen or unfrozen" error when assetfreeze is undefined', async () => {
      const baseParams: Record<string, string> = {
        'type[0]': 'AssetFreeze',
        'sender[0]': sender,
        'freezeto[0]': freezeto,
        'assetid[0]': assetId,
        'frozen[0]': frozen,
        'decimals[0]': decimals,
        // Note: deliberately omitting assetfreeze[0] to trigger "asset cannot be frozen or unfrozen"
      }
      const searchParams = new URLSearchParams(baseParams)
      renderTxnsWizardPageWithSearchParams({ searchParams })
      const toastElement = await screen.findByText('Error in transaction at index 0 in the following fields: asset-id')
      expect(toastElement).toBeInTheDocument()
      cleanup()
    })

    it('should show "Must be the freeze account of the asset" error when sender is not the asset freeze account', async () => {
      const differentSender = 'AAOLENX3Z76HBMQOLQF4VW26ZQSORVX7ZQJ66LCPX36T2QNAUYOYEY76RM'
      const baseParams: Record<string, string> = {
        'type[0]': 'AssetFreeze',
        'sender[0]': differentSender, // Different from assetfreeze
        'freezeto[0]': freezeto,
        'assetid[0]': assetId,
        'assetfreeze[0]': assetfreeze,
        'frozen[0]': frozen,
        'decimals[0]': decimals,
      }
      const searchParams = new URLSearchParams(baseParams)
      renderTxnsWizardPageWithSearchParams({ searchParams })
      const toastElement = await screen.findByText('Error in transaction at index 0 in the following fields: sender.value')
      expect(toastElement).toBeInTheDocument()
      cleanup()
    })
  })

  describe('asset clawback transaction search params', () => {
    const sender = 'I3345FUQQ2GRBHFZQPLYQQX5HJMMRZMABCHRLWV6RCJYC6OO4MOLEUBEGU'
    const receiver = 'AAOLENX3Z76HBMQOLQF4VW26ZQSORVX7ZQJ66LCPX36T2QNAUYOYEY76RM'
    const clawbackfrom = 'DJ76C74DI7EDNSHQLAJXGMBHFINBLATVGNRAVCO3VILPCQR7LKY7GPUL7Y'
    const assetId = '12345'
    const amount = '10.5'
    const decimals = '6'
    const unitName = 'USDC'
    const assetclawback = 'I3345FUQQ2GRBHFZQPLYQQX5HJMMRZMABCHRLWV6RCJYC6OO4MOLEUBEGU' // Must be same as sender
    const fee = '2000'
    const note = 'Asset clawback test'

    it('should render asset clawback transaction with minimal required fields', async () => {
      renderTxnsWizardPageWithSearchParams({
        searchParams: new URLSearchParams({
          'type[0]': 'AssetClawback',
          'sender[0]': sender,
          'receiver[0]': receiver,
          'clawbackfrom[0]': clawbackfrom,
          'assetid[0]': assetId,
          'amount[0]': amount,
          'decimals[0]': decimals,
          'assetclawback[0]': assetclawback,
        }),
      })

      expect(await screen.findByText(sender)).toBeInTheDocument()
      expect(await screen.findByText(receiver)).toBeInTheDocument()
      expect(await screen.findByText(clawbackfrom)).toBeInTheDocument()
      expect(await screen.findByText(assetId)).toBeInTheDocument()
      expect(await screen.findByText(amount)).toBeInTheDocument()
    })

    it('should render asset clawback transaction with all optional fields', async () => {
      renderTxnsWizardPageWithSearchParams({
        searchParams: new URLSearchParams({
          'type[0]': 'AssetClawback',
          'sender[0]': sender,
          'receiver[0]': receiver,
          'clawbackfrom[0]': clawbackfrom,
          'assetid[0]': assetId,
          'amount[0]': amount,
          'decimals[0]': decimals,
          'assetclawback[0]': assetclawback,
          'unitname[0]': unitName,
          'fee[0]': fee,
          'note[0]': note,
        }),
      })

      expect(await screen.findByText(sender)).toBeInTheDocument()
      expect(await screen.findByText(receiver)).toBeInTheDocument()
      expect(await screen.findByText(clawbackfrom)).toBeInTheDocument()
      expect(await screen.findByText(assetId)).toBeInTheDocument()
      expect(await screen.findByText(`${amount} ${unitName}`)).toBeInTheDocument()
      expect(await screen.findByText('0.002')).toBeInTheDocument()
      expect(await screen.findByText(note)).toBeInTheDocument()
    })

    it('should render asset clawback transaction with fee only', async () => {
      renderTxnsWizardPageWithSearchParams({
        searchParams: new URLSearchParams({
          'type[0]': 'AssetClawback',
          'sender[0]': sender,
          'receiver[0]': receiver,
          'clawbackfrom[0]': clawbackfrom,
          'assetid[0]': assetId,
          'amount[0]': amount,
          'decimals[0]': decimals,
          'assetclawback[0]': assetclawback,
          'fee[0]': fee,
        }),
      })

      expect(await screen.findByText(sender)).toBeInTheDocument()
      expect(await screen.findByText(receiver)).toBeInTheDocument()
      expect(await screen.findByText(clawbackfrom)).toBeInTheDocument()
      expect(await screen.findByText(assetId)).toBeInTheDocument()
      expect(await screen.findByText(amount)).toBeInTheDocument()
      expect(await screen.findByText('0.002')).toBeInTheDocument()
    })

    it('should render asset clawback transaction with note only', async () => {
      renderTxnsWizardPageWithSearchParams({
        searchParams: new URLSearchParams({
          'type[0]': 'AssetClawback',
          'sender[0]': sender,
          'receiver[0]': receiver,
          'clawbackfrom[0]': clawbackfrom,
          'assetid[0]': assetId,
          'amount[0]': amount,
          'decimals[0]': decimals,
          'assetclawback[0]': assetclawback,
          'note[0]': note,
        }),
      })

      expect(await screen.findByText(sender)).toBeInTheDocument()
      expect(await screen.findByText(receiver)).toBeInTheDocument()
      expect(await screen.findByText(clawbackfrom)).toBeInTheDocument()
      expect(await screen.findByText(assetId)).toBeInTheDocument()
      expect(await screen.findByText(amount)).toBeInTheDocument()
      expect(await screen.findByText(note)).toBeInTheDocument()
    })

    it('should render asset clawback transaction with unit name only', async () => {
      renderTxnsWizardPageWithSearchParams({
        searchParams: new URLSearchParams({
          'type[0]': 'AssetClawback',
          'sender[0]': sender,
          'receiver[0]': receiver,
          'clawbackfrom[0]': clawbackfrom,
          'assetid[0]': assetId,
          'amount[0]': amount,
          'decimals[0]': decimals,
          'assetclawback[0]': assetclawback,
          'unitname[0]': unitName,
        }),
      })

      expect(await screen.findByText(sender)).toBeInTheDocument()
      expect(await screen.findByText(receiver)).toBeInTheDocument()
      expect(await screen.findByText(clawbackfrom)).toBeInTheDocument()
      expect(await screen.findByText(assetId)).toBeInTheDocument()
      expect(await screen.findByText(`${amount} ${unitName}`)).toBeInTheDocument()
    })

    it('should render asset clawback transaction with clawbacktarget parameter', async () => {
      renderTxnsWizardPageWithSearchParams({
        searchParams: new URLSearchParams({
          'type[0]': 'AssetClawback',
          'sender[0]': sender,
          'receiver[0]': receiver,
          'clawbacktarget[0]': clawbackfrom, // Using clawbacktarget instead of clawbackfrom
          'assetid[0]': assetId,
          'amount[0]': amount,
          'decimals[0]': decimals,
          'assetclawback[0]': assetclawback,
        }),
      })

      expect(await screen.findByText(sender)).toBeInTheDocument()
      expect(await screen.findByText(receiver)).toBeInTheDocument()
      expect(await screen.findByText(clawbackfrom)).toBeInTheDocument()
      expect(await screen.findByText(assetId)).toBeInTheDocument()
      expect(await screen.findByText(amount)).toBeInTheDocument()
    })

    it.each([
      // Missing required field cases

      {
        key: 'receiver[0]',
        mode: 'missing',
        expected: 'Error in transaction at index 0 in the following fields: receiver-value, receiver-resolvedAddress',
      },
      {
        key: 'clawbackfrom[0]',
        mode: 'missing',
        expected: 'Error in transaction at index 0 in the following fields: clawbackTarget-value, clawbackTarget-resolvedAddress',
      },
      {
        key: 'assetid[0]',
        mode: 'missing',
        expected: 'Error in transaction at index 0: Cannot convert undefined to a BigInt',
      },
      {
        key: 'amount[0]',
        mode: 'missing',
        expected: 'Error in transaction at index 0: [DecimalError] Invalid argument: undefined',
      },
      {
        key: 'decimals[0]',
        mode: 'missing',
        expected: 'Error in transaction at index 0 in the following fields: asset-id',
      },
      {
        key: 'assetclawback[0]',
        mode: 'missing',
        expected: 'Error in transaction at index 0 in the following fields: asset-id',
      },
      // Invalid field value cases
      {
        key: 'receiver[0]',
        mode: 'invalid',
        value: 'invalid-address',
        expected: 'Error in transaction at index 0 in the following fields: receiver-value, receiver-value',
      },
      {
        key: 'clawbackfrom[0]',
        mode: 'invalid',
        value: 'invalid-address',
        expected: 'Error in transaction at index 0 in the following fields: clawbackTarget-value, clawbackTarget-value',
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
        key: 'amount[0]',
        mode: 'invalid',
        value: 'not-a-number',
        expected: 'Error in transaction at index 0: [DecimalError] Invalid argument: not-a-number',
      },
      {
        key: 'amount[0]',
        mode: 'invalid',
        value: '-10',
        expected: 'Error in transaction at index 0 in the following fields: amount',
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
        'type[0]': 'AssetClawback',
        'sender[0]': sender,
        'receiver[0]': receiver,
        'clawbackfrom[0]': clawbackfrom,
        'assetid[0]': assetId,
        'amount[0]': amount,
        'decimals[0]': decimals,
        'assetclawback[0]': assetclawback,
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
        'type[0]': 'AssetClawback',
        'sender[0]': sender,
        'receiver[0]': receiver,
        'clawbackfrom[0]': clawbackfrom,
        'assetid[0]': assetId,
        'amount[0]': amount,
        'assetclawback[0]': assetclawback,
        // Note: deliberately omitting decimals[0] to trigger "asset does not exist"
      }
      const searchParams = new URLSearchParams(baseParams)
      renderTxnsWizardPageWithSearchParams({ searchParams })
      const toastElement = await screen.findByText('Error in transaction at index 0 in the following fields: asset-id')
      expect(toastElement).toBeInTheDocument()
      cleanup()
    })

    it('should show "Asset cannot be clawed back" error when assetclawback is undefined', async () => {
      const baseParams: Record<string, string> = {
        'type[0]': 'AssetClawback',
        'sender[0]': sender,
        'receiver[0]': receiver,
        'clawbackfrom[0]': clawbackfrom,
        'assetid[0]': assetId,
        'amount[0]': amount,
        'decimals[0]': decimals,
        // Note: deliberately omitting assetclawback[0] to trigger "asset cannot be clawed back"
      }
      const searchParams = new URLSearchParams(baseParams)
      renderTxnsWizardPageWithSearchParams({ searchParams })
      const toastElement = await screen.findByText('Error in transaction at index 0 in the following fields: asset-id')
      expect(toastElement).toBeInTheDocument()
      cleanup()
    })

    it('should show "Must be the clawback account of the asset" error when sender is not the asset clawback account', async () => {
      const differentSender = 'AAOLENX3Z76HBMQOLQF4VW26ZQSORVX7ZQJ66LCPX36T2QNAUYOYEY76RM'
      const baseParams: Record<string, string> = {
        'type[0]': 'AssetClawback',
        'sender[0]': differentSender, // Different from assetclawback
        'receiver[0]': receiver,
        'clawbackfrom[0]': clawbackfrom,
        'assetid[0]': assetId,
        'amount[0]': amount,
        'decimals[0]': decimals,
        'assetclawback[0]': assetclawback,
      }
      const searchParams = new URLSearchParams(baseParams)
      renderTxnsWizardPageWithSearchParams({ searchParams })
      const toastElement = await screen.findByText('Error in transaction at index 0 in the following fields: sender.value')
      expect(toastElement).toBeInTheDocument()
      cleanup()
    })
  })
})
