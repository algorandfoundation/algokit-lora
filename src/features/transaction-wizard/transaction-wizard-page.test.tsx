import { afterEach, beforeEach, describe, expect, vitest, it, vi } from 'vitest'
import { algorandFixture } from '@algorandfoundation/algokit-utils/testing'
import { executeComponentTest } from '@/tests/test-component'
import { fireEvent, render, waitFor, within } from '@/tests/testing-library'
import { useWallet } from '@txnlab/use-wallet'
import { algo } from '@algorandfoundation/algokit-utils'
import { sendButtonLabel, transactionTypeLabel, TransactionWizardPage } from './transaction-wizard-page'
import { selectOption } from '@/tests/utils/select-option'
import { setWalletAddressAndSigner } from '@/tests/utils/set-wallet-address-and-signer'
import { addTransactionLabel } from './components/transactions-builder'
import { groupSendResultsLabel } from './components/group-send-results'

describe('transaction-wizard-page', () => {
  const localnet = algorandFixture()
  beforeEach(localnet.beforeEach, 10e6)
  afterEach(() => {
    vitest.clearAllMocks()
  })

  describe('when a wallet is not connected', () => {
    beforeEach(async () => {
      const original = await vi.importActual<{ useWallet: () => ReturnType<typeof useWallet> }>('@txnlab/use-wallet')
      vi.mocked(useWallet).mockImplementation(() => {
        return {
          ...original.useWallet(),
          activeAddress: undefined,
          isActive: false,
          isReady: true,
        }
      })
    })

    it('transaction cannot be sent', () => {
      return executeComponentTest(
        () => {
          return render(<TransactionWizardPage />)
        },
        async (component) => {
          await waitFor(() => {
            const sendButton = component.getByRole('button', { name: sendButtonLabel })
            expect(sendButton).toBeDisabled()
          })
        }
      )
    })
  })

  describe('when a wallet is connected', () => {
    beforeEach(async () => {
      await setWalletAddressAndSigner(localnet)
    })

    describe('and a payment transaction is being sent', () => {
      it('reports validation errors when required fields have not been supplied', () => {
        return executeComponentTest(
          () => {
            return render(<TransactionWizardPage />)
          },
          async (component, user) => {
            const addTransactionButton = await waitFor(() => {
              const addTransactionButton = component.getByRole('button', { name: addTransactionLabel })
              expect(addTransactionButton).not.toBeDisabled()
              return addTransactionButton!
            })
            await user.click(addTransactionButton)

            const addButton = await waitFor(() => {
              const sendButton = component.getByRole('button', { name: 'Add' })
              expect(sendButton).not.toBeDisabled()
              return sendButton!
            })

            await user.click(addButton)

            await waitFor(() => {
              const requiredValidationMessages = component.getAllByText('Required')
              expect(requiredValidationMessages.length).toBeGreaterThan(0)
            })
          }
        )
      })

      it('succeeds when all fields have been correctly supplied', async () => {
        const { testAccount } = localnet.context
        const testAccount2 = await localnet.context.generateAccount({ initialFunds: algo(0) })

        await executeComponentTest(
          () => {
            return render(<TransactionWizardPage />)
          },
          async (component, user) => {
            const addTransactionButton = await waitFor(() => {
              const addTransactionButton = component.getByRole('button', { name: addTransactionLabel })
              expect(addTransactionButton).not.toBeDisabled()
              return addTransactionButton!
            })
            await user.click(addTransactionButton)

            const senderInput = await component.findByLabelText(/Sender/)
            fireEvent.input(senderInput, {
              target: { value: testAccount.addr },
            })

            const receiverInput = await component.findByLabelText(/Receiver/)
            fireEvent.input(receiverInput, {
              target: { value: testAccount2.addr },
            })

            const amountInput = await component.findByLabelText(/Amount/)
            fireEvent.input(amountInput, {
              target: { value: '0.5' },
            })

            const addButton = await waitFor(() => {
              const addButton = component.getByRole('button', { name: 'Add' })
              expect(addButton).not.toBeDisabled()
              return addButton!
            })
            await user.click(addButton)

            const sendButton = await waitFor(() => {
              const sendButton = component.getByRole('button', { name: sendButtonLabel })
              expect(sendButton).not.toBeDisabled()
              return sendButton!
            })
            await user.click(sendButton)

            const resultsDiv = await waitFor(
              () => {
                expect(component.queryByText('Required')).not.toBeInTheDocument()
                return component.getByText(groupSendResultsLabel).parentElement!
              },
              { timeout: 10_000 }
            )

            const transactionId = await waitFor(
              () => {
                const transactionLink = within(resultsDiv)
                  .getAllByRole('link')
                  .find((a) => a.getAttribute('href')?.startsWith('/localnet/transaction'))!
                return transactionLink.getAttribute('href')!.split('/').pop()!
              },
              { timeout: 10_000 }
            )

            const result = await localnet.context.waitForIndexerTransaction(transactionId)
            expect(result.transaction.sender).toBe(testAccount.addr)
            expect(result.transaction['payment-transaction']!).toMatchInlineSnapshot(`
              {
                "amount": 500000,
                "close-amount": 0,
                "receiver": "${testAccount2.addr}",
              }
            `)
          }
        )
      })
    })

    describe('and a close account transaction is being sent', () => {
      it('reports validation errors when required fields have not been supplied', () => {
        return executeComponentTest(
          () => {
            return render(<TransactionWizardPage />)
          },
          async (component, user) => {
            const addTransactionButton = await waitFor(() => {
              const addTransactionButton = component.getByRole('button', { name: addTransactionLabel })
              expect(addTransactionButton).not.toBeDisabled()
              return addTransactionButton!
            })
            await user.click(addTransactionButton)

            await selectOption(component.baseElement, user, transactionTypeLabel, 'Account Close (pay)')

            const addButton = await waitFor(() => {
              const addButton = component.getByRole('button', { name: 'Add' })
              expect(addButton).not.toBeDisabled()
              return addButton!
            })
            await user.click(addButton)

            await waitFor(() => {
              const requiredValidationMessages = component.getAllByText('Required')
              expect(requiredValidationMessages.length).toBeGreaterThan(0)
            })
          }
        )
      })

      it('succeeds when all fields have been correctly supplied', async () => {
        const { testAccount } = localnet.context
        const testAccount2 = await localnet.context.generateAccount({ initialFunds: algo(0) })

        await executeComponentTest(
          () => {
            return render(<TransactionWizardPage />)
          },
          async (component, user) => {
            const addTransactionButton = await waitFor(() => {
              const addTransactionButton = component.getByRole('button', { name: addTransactionLabel })
              expect(addTransactionButton).not.toBeDisabled()
              return addTransactionButton!
            })
            await user.click(addTransactionButton)

            await selectOption(component.baseElement, user, transactionTypeLabel, 'Account Close (pay)')

            const senderInput = await component.findByLabelText(/Sender/)
            fireEvent.input(senderInput, {
              target: { value: testAccount.addr },
            })

            const closeToInput = await component.findByLabelText(/Close remainder to/)
            fireEvent.input(closeToInput, {
              target: { value: testAccount2.addr },
            })

            const addButton = await waitFor(() => {
              const addButton = component.getByRole('button', { name: 'Add' })
              expect(addButton).not.toBeDisabled()
              return addButton!
            })
            await user.click(addButton)

            const sendButton = await waitFor(() => {
              const sendButton = component.getByRole('button', { name: sendButtonLabel })
              expect(sendButton).not.toBeDisabled()
              return sendButton!
            })
            await user.click(sendButton)

            const resultsDiv = await waitFor(
              () => {
                expect(component.queryByText('Required')).not.toBeInTheDocument()
                return component.getByText(groupSendResultsLabel).parentElement!
              },
              { timeout: 10_000 }
            )

            const transactionId = await waitFor(
              () => {
                const transactionLink = within(resultsDiv)
                  .getAllByRole('link')
                  .find((a) => a.getAttribute('href')?.startsWith('/localnet/transaction'))!
                return transactionLink.getAttribute('href')!.split('/').pop()!
              },
              { timeout: 10_000 }
            )

            const result = await localnet.context.waitForIndexerTransaction(transactionId)
            expect(result.transaction.sender).toBe(testAccount.addr)
            expect(result.transaction['payment-transaction']!).toMatchInlineSnapshot(`
              {
                "amount": 0,
                "close-amount": 9999000,
                "close-remainder-to": "${testAccount2.addr}",
                "receiver": "${testAccount.addr}",
              }
            `)
          }
        )
      })
    })
  })
})
