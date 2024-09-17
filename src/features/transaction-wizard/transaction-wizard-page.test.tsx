import { afterEach, beforeEach, describe, expect, vitest, it, vi } from 'vitest'
import { algorandFixture } from '@algorandfoundation/algokit-utils/testing'
import { executeComponentTest } from '@/tests/test-component'
import { fireEvent, render, waitFor } from '@/tests/testing-library'
import { useWallet } from '@txnlab/use-wallet'
import { algo, assetOptIn } from '@algorandfoundation/algokit-utils'
import { transactionIdLabel } from '../transactions/components/transaction-info'
import { getByDescriptionTerm } from '@/tests/custom-queries/get-description'
import { accountCloseTransaction } from './data/payment-transactions'
import { sendButtonLabel, transactionTypeLabel, TransactionWizardPage } from './transaction-wizard-page'
import { selectOption } from '@/tests/utils/select-option'
import { setWalletAddressAndSigner } from '@/tests/utils/set-wallet-address-and-signer'
import { assetOptInTransaction, assetOptOutTransaction, assetRevokeTransaction, assetTransferTransaction } from './data/asset-transactions'
import { generateTestAsset } from './models/__asset'
import { algod } from '../common/data/algo-client'

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
            const sendButton = await waitFor(() => {
              const sendButton = component.getByRole('button', { name: sendButtonLabel })
              expect(sendButton).not.toBeDisabled()
              return sendButton!
            })

            await user.click(sendButton)

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
            const sendButton = await waitFor(() => {
              const sendButton = component.getByRole('button', { name: sendButtonLabel })
              expect(sendButton).not.toBeDisabled()
              return sendButton!
            })

            const senderInput = await component.findByLabelText(/Sender address/)
            fireEvent.input(senderInput, {
              target: { value: testAccount.addr },
            })

            const receiverInput = await component.findByLabelText(/Receiver address/)
            fireEvent.input(receiverInput, {
              target: { value: testAccount2.addr },
            })

            const amountInput = await component.findByLabelText(/Amount/)
            fireEvent.input(amountInput, {
              target: { value: '0.5' },
            })

            await user.click(sendButton)

            const transactionId = await waitFor(
              () => {
                expect(component.queryByText('Required')).not.toBeInTheDocument()
                const transactionIdComponent = getByDescriptionTerm(component.container, transactionIdLabel)
                expect(transactionIdComponent).toBeDefined()
                return transactionIdComponent.textContent!
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
            await selectOption(component.container, user, transactionTypeLabel, accountCloseTransaction.label)

            const sendButton = await waitFor(() => {
              const sendButton = component.getByRole('button', { name: sendButtonLabel })
              expect(sendButton).not.toBeDisabled()
              return sendButton!
            })

            await user.click(sendButton)

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
            await selectOption(component.container, user, transactionTypeLabel, accountCloseTransaction.label)

            const sendButton = await waitFor(() => {
              const sendButton = component.getByRole('button', { name: sendButtonLabel })
              expect(sendButton).not.toBeDisabled()
              return sendButton!
            })

            const senderInput = await component.findByLabelText(/Sender address/)
            fireEvent.input(senderInput, {
              target: { value: testAccount.addr },
            })

            const closeToInput = await component.findByLabelText(/Close remainder to/)
            fireEvent.input(closeToInput, {
              target: { value: testAccount2.addr },
            })

            await user.click(sendButton)

            const transactionId = await waitFor(
              () => {
                expect(component.queryByText('Required')).not.toBeInTheDocument()
                const transactionIdComponent = getByDescriptionTerm(component.container, transactionIdLabel)
                expect(transactionIdComponent).toBeDefined()
                return transactionIdComponent.textContent!
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

    describe('and a asset opt in transaction is being sent', () => {
      it('reports validation errors when required fields have not been supplied', () => {
        return executeComponentTest(
          () => {
            return render(<TransactionWizardPage />)
          },
          async (component, user) => {
            await selectOption(component.container, user, transactionTypeLabel, assetOptInTransaction.label)

            const sendButton = await waitFor(() => {
              const sendButton = component.getByRole('button', { name: sendButtonLabel })
              expect(sendButton).not.toBeDisabled()
              return sendButton!
            })

            await user.click(sendButton)

            await waitFor(() => {
              const requiredValidationMessages = component.getAllByText('Required')
              expect(requiredValidationMessages.length).toBeGreaterThan(0)
            })
          }
        )
      })

      it('succeeds when all fields have been correctly supplied', async () => {
        const { testAccount } = localnet.context
        const dummyAssetId = await generateTestAsset(algod, testAccount, 1)

        await executeComponentTest(
          () => {
            return render(<TransactionWizardPage />)
          },
          async (component, user) => {
            await selectOption(component.container, user, transactionTypeLabel, assetOptInTransaction.label)

            const sendButton = await waitFor(() => {
              const sendButton = component.getByRole('button', { name: sendButtonLabel })
              expect(sendButton).not.toBeDisabled()
              return sendButton!
            })

            const senderInput = await component.findByLabelText(/Sender address/)
            fireEvent.input(senderInput, {
              target: { value: testAccount.addr },
            })

            const assetIdInput = await component.findByLabelText(/Asset ID/)
            fireEvent.input(assetIdInput, {
              target: { value: dummyAssetId },
            })

            await user.click(sendButton)

            const transactionId = await waitFor(
              () => {
                expect(component.queryByText('Required')).not.toBeInTheDocument()
                const transactionIdComponent = getByDescriptionTerm(component.container, transactionIdLabel)
                expect(transactionIdComponent).toBeDefined()
                return transactionIdComponent.textContent!
              },
              { timeout: 10_000 }
            )

            const result = await localnet.context.waitForIndexerTransaction(transactionId)
            expect(result.transaction.sender).toBe(testAccount.addr)
            expect(result.transaction['asset-transfer-transaction']!).toMatchInlineSnapshot(`
              {
                "amount": 0,
                "asset-id": ${dummyAssetId},
                "close-amount": 0,
                "receiver": "${testAccount.addr}",
              }
            `)
          }
        )
      })
    })

    describe('and a asset transfer transaction is being sent', () => {
      it('reports validation errors when required fields have not been supplied', () => {
        return executeComponentTest(
          () => {
            return render(<TransactionWizardPage />)
          },
          async (component, user) => {
            await selectOption(component.container, user, transactionTypeLabel, assetTransferTransaction.label)

            const sendButton = await waitFor(() => {
              const sendButton = component.getByRole('button', { name: sendButtonLabel })
              expect(sendButton).not.toBeDisabled()
              return sendButton!
            })

            await user.click(sendButton)

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
        const dummyAssetId = await generateTestAsset(algod, testAccount, 1)
        await assetOptIn({ account: testAccount, assetId: dummyAssetId }, algod)

        await executeComponentTest(
          () => {
            return render(<TransactionWizardPage />)
          },
          async (component, user) => {
            await selectOption(component.container, user, transactionTypeLabel, assetTransferTransaction.label)

            const sendButton = await waitFor(() => {
              const sendButton = component.getByRole('button', { name: sendButtonLabel })
              expect(sendButton).not.toBeDisabled()
              return sendButton!
            })

            const assetIdInput = await component.findByLabelText(/Asset ID/)
            fireEvent.input(assetIdInput, {
              target: { value: dummyAssetId },
            })

            const senderInput = await component.findByLabelText(/Sender address/)
            fireEvent.input(senderInput, {
              target: { value: testAccount.addr },
            })

            const receiverInput = await component.findByLabelText(/Receiver address/)
            fireEvent.input(receiverInput, {
              target: { value: testAccount2.addr },
            })

            const amountInput = await component.findByLabelText(/Amount/)
            fireEvent.input(amountInput, {
              target: { value: '0' },
            })

            await user.click(sendButton)

            const transactionId = await waitFor(
              () => {
                expect(component.queryByText('Required')).not.toBeInTheDocument()
                const transactionIdComponent = getByDescriptionTerm(component.container, transactionIdLabel)
                expect(transactionIdComponent).toBeDefined()
                return transactionIdComponent.textContent!
              },
              { timeout: 10_000 }
            )

            const result = await localnet.context.waitForIndexerTransaction(transactionId)
            expect(result.transaction.sender).toBe(testAccount.addr)
            expect(result.transaction['asset-transfer-transaction']!).toMatchInlineSnapshot(`
              {
                "amount": 0,
                "asset-id": ${dummyAssetId},
                "close-amount": 0,
                "receiver": "${testAccount2.addr}",
              }
            `)
          }
        )
      })
    })

    describe('and a asset opt out transaction is being sent', () => {
      it('reports validation errors when required fields have not been supplied', () => {
        return executeComponentTest(
          () => {
            return render(<TransactionWizardPage />)
          },
          async (component, user) => {
            await selectOption(component.container, user, transactionTypeLabel, assetOptOutTransaction.label)

            const sendButton = await waitFor(() => {
              const sendButton = component.getByRole('button', { name: sendButtonLabel })
              expect(sendButton).not.toBeDisabled()
              return sendButton!
            })

            await user.click(sendButton)

            await waitFor(() => {
              const requiredValidationMessages = component.getAllByText('Required')
              expect(requiredValidationMessages.length).toBeGreaterThan(0)
            })
          }
        )
      })

      it('succeeds when all fields have been correctly supplied', async () => {
        const { testAccount } = localnet.context
        const dummyAssetId = await generateTestAsset(algod, testAccount, 1)
        const testAccount2 = await localnet.context.generateAccount({ initialFunds: algo(10) })
        await assetOptIn({ account: testAccount2, assetId: dummyAssetId }, algod)

        await executeComponentTest(
          () => {
            return render(<TransactionWizardPage />)
          },
          async (component, user) => {
            await selectOption(component.container, user, transactionTypeLabel, assetOptOutTransaction.label)

            const sendButton = await waitFor(() => {
              const sendButton = component.getByRole('button', { name: sendButtonLabel })
              expect(sendButton).not.toBeDisabled()
              return sendButton!
            })

            const assetIdInput = await component.findByLabelText(/Asset ID/)
            fireEvent.input(assetIdInput, {
              target: { value: dummyAssetId },
            })

            const senderInput = await component.findByLabelText(/Sender address/)
            fireEvent.input(senderInput, {
              target: { value: testAccount2.addr },
            })

            await user.click(sendButton)

            const transactionId = await waitFor(
              () => {
                expect(component.queryByText('Required')).not.toBeInTheDocument()
                const transactionIdComponent = getByDescriptionTerm(component.container, transactionIdLabel)
                expect(transactionIdComponent).toBeDefined()
                return transactionIdComponent.textContent!
              },
              { timeout: 10_000 }
            )

            const result = await localnet.context.waitForIndexerTransaction(transactionId)
            expect(result.transaction.sender).toBe(testAccount.addr)
            expect(result.transaction['asset-transfer-transaction']!).toMatchInlineSnapshot(`
              {
                "amount": 0,
                "asset-id": ${dummyAssetId},
                "close-amount": 0,
                "receiver": "${testAccount2.addr}",
              }
            `)
          }
        )
      })
    })

    describe('and a asset revoke transaction is being sent', () => {
      it('reports validation errors when required fields have not been supplied', () => {
        return executeComponentTest(
          () => {
            return render(<TransactionWizardPage />)
          },
          async (component, user) => {
            await selectOption(component.container, user, transactionTypeLabel, assetRevokeTransaction.label)

            const sendButton = await waitFor(() => {
              const sendButton = component.getByRole('button', { name: sendButtonLabel })
              expect(sendButton).not.toBeDisabled()
              return sendButton!
            })

            await user.click(sendButton)

            await waitFor(() => {
              const requiredValidationMessages = component.getAllByText('Required')
              expect(requiredValidationMessages.length).toBeGreaterThan(0)
            })
          }
        )
      })

      it('succeeds when all fields have been correctly supplied', async () => {
        const { testAccount } = localnet.context
        const dummyAssetId = await generateTestAsset(algod, testAccount, 1)
        const testAccount2 = await localnet.context.generateAccount({ initialFunds: algo(0) })
        await assetOptIn({ account: testAccount, assetId: dummyAssetId }, algod)

        await executeComponentTest(
          () => {
            return render(<TransactionWizardPage />)
          },
          async (component, user) => {
            await selectOption(component.container, user, transactionTypeLabel, assetRevokeTransaction.label)

            const sendButton = await waitFor(() => {
              const sendButton = component.getByRole('button', { name: sendButtonLabel })
              expect(sendButton).not.toBeDisabled()
              return sendButton!
            })

            const assetIdInput = await component.findByLabelText(/Asset ID/)
            fireEvent.input(assetIdInput, {
              target: { value: dummyAssetId },
            })

            const senderInput = await component.findByLabelText(/Sender address/)
            fireEvent.input(senderInput, {
              target: { value: testAccount.addr },
            })

            const receiverInput = await component.findByLabelText(/Receiver address/)
            fireEvent.input(receiverInput, {
              target: { value: testAccount2.addr },
            })
            const assetSenderInput = await component.findByLabelText(/Asset sender/)
            fireEvent.input(assetSenderInput, {
              target: { value: testAccount.addr },
            })

            const amountInput = await component.findByLabelText(/Amount/)
            fireEvent.input(amountInput, {
              target: { value: '0' },
            })

            await user.click(sendButton)

            const transactionId = await waitFor(
              () => {
                expect(component.queryByText('Required')).not.toBeInTheDocument()
                const transactionIdComponent = getByDescriptionTerm(component.container, transactionIdLabel)
                expect(transactionIdComponent).toBeDefined()
                return transactionIdComponent.textContent!
              },
              { timeout: 10_000 }
            )

            const result = await localnet.context.waitForIndexerTransaction(transactionId)
            expect(result.transaction.sender).toBe(testAccount.addr)
            expect(result.transaction['asset-transfer-transaction']!).toMatchInlineSnapshot(`
              {
                "amount": 0,
                "asset-id": ${dummyAssetId},
                "close-amount": 0,
                "receiver": "${testAccount2.addr}",
                "sender": "${testAccount.addr}",
              }
            `)
          }
        )
      })
    })
  })
})
