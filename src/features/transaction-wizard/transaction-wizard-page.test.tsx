import { afterEach, beforeEach, describe, expect, vitest, it, vi } from 'vitest'
import { algorandFixture } from '@algorandfoundation/algokit-utils/testing'
import { executeComponentTest } from '@/tests/test-component'
import { fireEvent, render, waitFor, within } from '@/tests/testing-library'
import { useWallet } from '@txnlab/use-wallet-react'
import { algo } from '@algorandfoundation/algokit-utils'
import { sendButtonLabel, simulateButtonLabel, transactionTypeLabel, TransactionWizardPage } from './transaction-wizard-page'
import { selectOption } from '@/tests/utils/select-option'
import { setWalletAddressAndSigner } from '@/tests/utils/set-wallet-address-and-signer'
import { addTransactionLabel } from './components/transactions-builder'
import { groupSendResultsLabel, groupSimulateResultsLabel } from './components/group-send-results'
import { base64ToBytes } from '@/utils/base64-to-bytes'

describe('transaction-wizard-page', () => {
  const localnet = algorandFixture()
  beforeEach(localnet.newScope, 10e6)
  afterEach(() => {
    vitest.clearAllMocks()
  })

  describe('when a wallet is not connected', () => {
    beforeEach(async () => {
      const original = await vi.importActual<{ useWallet: () => ReturnType<typeof useWallet> }>('@txnlab/use-wallet-react')
      vi.mocked(useWallet).mockImplementation(() => {
        return {
          ...original.useWallet(),
          activeAddress: null,
          isReady: true,
        } satisfies ReturnType<typeof useWallet>
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

    it('Can add a payment transaction without defining a sender and simulate transaction', async () => {
      const dispenserAccount = await localnet.algorand.account.localNetDispenser()
      const kmdAccount2 = await localnet.algorand.account.kmd.getOrCreateWalletAccount('test-wallet-2')

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

          const receiverInput = await component.findByLabelText(/Receiver/)
          fireEvent.input(receiverInput, {
            target: { value: kmdAccount2.addr },
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

          const senderNode = await waitFor(() => component.getByText(dispenserAccount.addr.toString()))
          expect(senderNode).toBeInTheDocument()

          const simulateButton = await waitFor(() => {
            const simulateButton = component.getByRole('button', { name: simulateButtonLabel })
            // expect(simulateButton).not.toBeDisabled()
            return simulateButton!
          })
          await user.click(simulateButton)

          // 2. We have a simulation result section
          const resultsDiv = await waitFor(
            () => {
              expect(component.queryByText('Required')).not.toBeInTheDocument()
              return component.getByText(groupSimulateResultsLabel).parentElement!
            },
            { timeout: 10_000 }
          )

          // Basic assertion that something was rendered as a result
          expect(resultsDiv).toBeInTheDocument()
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
            expect(result.transaction.sender).toBe(testAccount.addr.toString())
            expect(result.transaction.paymentTransaction!).toMatchInlineSnapshot(`
              TransactionPayment {
                "amount": 500000n,
                "closeAmount": 0n,
                "closeRemainderTo": undefined,
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
            expect(result.transaction.sender).toBe(testAccount.addr.toString())
            expect(result.transaction.paymentTransaction!).toMatchInlineSnapshot(`
              TransactionPayment {
                "amount": 0n,
                "closeAmount": 9999000n,
                "closeRemainderTo": "${testAccount2.addr}",
                "receiver": "${testAccount.addr}",
              }
            `)
          }
        )
      })
    })

    describe('and an application create transaction is being sent', () => {
      it('succeeds when all fields have been correctly supplied', async () => {
        const { testAccount } = localnet.context

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

            await selectOption(component.baseElement, user, transactionTypeLabel, 'Application Create (appl)')

            const senderInput = await component.findByLabelText(/Sender/)
            fireEvent.input(senderInput, {
              target: { value: testAccount.addr },
            })

            const approvalProgram =
              'CiACAQgmAQQVH3x1MRtBAJKCBQT+a99pBHPAS00E4ARHRQR4zc4FBIMeel82GgCOBQBSADcAKAASAAOBAEMxGRREMRhEKDYaAVCwIkMxGRREMRhENhoBNhoCiABdKExQsCJDMRkURDEYRCg2GgFQsCJDMRkURDEYRDYaAVcCAEkVFlcGAkxQKExQsCJDMRkURDEYRDYaATYaAogAEShMULAiQzEZQP+TMRgURCJDigIBi/4Xi/8XCBaJigIBi/8XIwuL/kwjWIk='
            const approvalProgramInput = await component.findByLabelText(/Approval program/)
            fireEvent.input(approvalProgramInput, {
              target: {
                value: approvalProgram,
              },
            })

            const clearStateProgram = 'CoEBQw=='
            const clearStateProgramInput = await component.findByLabelText(/Clear state program/)
            fireEvent.input(clearStateProgramInput, {
              target: { value: clearStateProgram },
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
            expect(result.transaction.sender).toBe(testAccount.addr.toString())
            expect(result.transaction.applicationTransaction!.approvalProgram).toEqual(base64ToBytes(approvalProgram))
            expect(result.transaction.applicationTransaction!.clearStateProgram).toEqual(base64ToBytes(clearStateProgram))
          }
        )
      })

      it('succeeds when sending an op-up transaction', async () => {
        const { testAccount } = localnet.context

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

            await selectOption(component.baseElement, user, transactionTypeLabel, 'Application Create (appl)')

            const senderInput = await component.findByLabelText(/Sender/)
            fireEvent.input(senderInput, {
              target: { value: testAccount.addr },
            })

            const approvalProgramInput = await component.findByLabelText(/Approval program/)
            fireEvent.input(approvalProgramInput, {
              target: { value: 'CoEBQw==' },
            })

            const clearStateProgramInput = await component.findByLabelText(/Clear state program/)
            fireEvent.input(clearStateProgramInput, {
              target: { value: 'CoEBQw==' },
            })

            await selectOption(component.baseElement, user, /On complete/, 'Delete')

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
            expect(result.transaction.sender).toBe(testAccount.addr.toString())
          }
        )
      })
    })

    describe('and an application update transaction is being sent', () => {
      it('succeeds when updating an updatable application', async () => {
        const { testAccount } = localnet.context

        // First create an updatable application
        const appCreateResult = await localnet.context.algorand.send.appCreate({
          sender: testAccount.addr,
          approvalProgram: '#pragma version 10\nint 1\nreturn',
          clearStateProgram: '#pragma version 10\nint 1\nreturn',
        })
        const appId = Number(appCreateResult.confirmation.applicationIndex!)

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

            await selectOption(component.baseElement, user, transactionTypeLabel, 'Application Update (appl)')

            const senderInput = await component.findByLabelText(/Sender/)
            fireEvent.input(senderInput, {
              target: { value: testAccount.addr },
            })

            const applicationIdInput = await component.findByLabelText(/Application ID/)
            fireEvent.input(applicationIdInput, {
              target: { value: appId },
            })

            const program = 'CoEBQw=='
            const approvalProgramInput = await component.findByLabelText(/Approval program/)
            fireEvent.input(approvalProgramInput, {
              target: { value: program },
            })

            const clearStateProgramInput = await component.findByLabelText(/Clear state program/)
            fireEvent.input(clearStateProgramInput, {
              target: { value: program },
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
            expect(result.transaction.sender).toBe(testAccount.addr.toString())
            expect(result.transaction.applicationTransaction?.onCompletion).toBe('update')
            expect(result.transaction.applicationTransaction!.approvalProgram).toEqual(base64ToBytes(program))
            expect(result.transaction.applicationTransaction!.clearStateProgram).toEqual(base64ToBytes(program))
          }
        )
      })
    })
  })
})
