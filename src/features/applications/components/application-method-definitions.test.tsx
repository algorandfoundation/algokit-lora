import { setWalletAddressAndSigner } from '@/tests/utils/set-wallet-address-and-signer'
import { algorandFixture } from '@algorandfoundation/algokit-utils/testing'
import { afterEach, beforeEach, describe, expect, it, vi, vitest } from 'vitest'
import { ApplicationId } from '../data/types'
import Arc32TestContractAppSpec from '@/tests/test-app-specs/test-contract.arc32.json'
import Arc56TestContractAppSpec from '@/tests/test-app-specs/arc56/sample-one.json'
import { deploySmartContract } from '@/tests/utils/deploy-smart-contract'
import { AppSpec } from '@algorandfoundation/algokit-utils/types/app-spec'
import { ApplicationPage } from '../pages/application-page'
import { executeComponentTest } from '@/tests/test-component'
import { useParams } from 'react-router-dom'
import { fireEvent, getByText, render, RenderResult, waitFor, within } from '@/tests/testing-library'
import { UserEvent } from '@testing-library/user-event'
import { addTransactionLabel, sendButtonLabel } from '@/features/transaction-wizard/components/transactions-builder'
import { algo } from '@algorandfoundation/algokit-utils'
import { transactionActionsLabel, transactionGroupTableLabel } from '@/features/transaction-wizard/components/labels'
import { selectOption } from '@/tests/utils/select-option'
import { groupSendResultsLabel } from '@/features/transaction-wizard/components/group-send-results'
import { getTestStore } from '@/tests/utils/get-test-store'
import { Arc56Contract } from '@algorandfoundation/algokit-utils/abi'
import { asMethodCallParams } from '@/features/transaction-wizard/mappers'
import { randomGuid } from '@/utils/random-guid'
import { asAddressOrNfd } from '@/features/transaction-wizard/mappers/as-address-or-nfd'
import { BuildableTransactionType } from '@/features/transaction-wizard/models'
import { asMethodDefinitions } from '@/features/applications/mappers'
import { uint8ArrayToBase64 } from '@/utils/uint8-array-to-base64'
import { act } from 'react'
import { JotaiStore } from '@/features/common/data/types'

describe('application-method-definitions', () => {
  const localnet = algorandFixture()
  let appId: ApplicationId

  beforeEach(localnet.newScope, 10e6)
  afterEach(() => {
    vitest.clearAllMocks()
  })

  describe('test-arc32-app-spec', () => {
    let myStore: JotaiStore

    beforeEach(async () => {
      myStore = getTestStore()
      await setWalletAddressAndSigner(localnet)
      const { app } = await deploySmartContract(
        localnet.context.testAccount,
        localnet.algorand,
        myStore,
        Arc32TestContractAppSpec as AppSpec
      )
      appId = app.appId

      const dispenser = await localnet.context.algorand.account.dispenserFromEnvironment()
      await localnet.context.algorand.send.payment({
        sender: dispenser,
        receiver: app.appAddress,
        amount: algo(10),
        note: 'Fund app account',
      })
    })

    describe('when a wallet is connected', () => {
      beforeEach(async () => {
        await setWalletAddressAndSigner(localnet)
      })

      describe('when calling calculator add method', () => {
        it('reports validation errors when required fields have not been supplied', () => {
          vi.mocked(useParams).mockImplementation(() => ({ applicationId: appId.toString() }))

          return executeComponentTest(
            () => {
              return render(<ApplicationPage />, undefined, myStore)
            },
            async (component, user) => {
              const addMethodPanel = await expandMethodAccordion(component, user, 'add')

              const addTransactionButton = await waitFor(() => {
                const addTransactionButton = within(addMethodPanel).getByRole('button', { name: 'Call' })
                expect(addTransactionButton).not.toBeDisabled()
                return addTransactionButton!
              })
              await user.click(addTransactionButton)

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

        it('succeeds when all fields have been correctly supplied', () => {
          const { testAccount } = localnet.context
          vi.mocked(useParams).mockImplementation(() => ({ applicationId: appId.toString() }))

          return executeComponentTest(
            () => {
              return render(<ApplicationPage />, undefined, myStore)
            },
            async (component, user) => {
              const addMethodPanel = await expandMethodAccordion(component, user, 'add')

              const callButton = await waitFor(() => {
                const callButton = within(addMethodPanel).getByRole('button', { name: 'Call' })
                expect(callButton).not.toBeDisabled()
                return callButton!
              })
              await user.click(callButton)

              const formDialog = component.getByRole('dialog')

              const arg1Input = await getArgInput(formDialog, 'Argument 1')
              fireEvent.input(arg1Input, {
                target: { value: '1' },
              })

              const arg2Input = await getArgInput(formDialog, 'Argument 2')
              fireEvent.input(arg2Input, {
                target: { value: '2' },
              })

              const addButton = await waitFor(() => {
                const addButton = within(formDialog).getByRole('button', { name: 'Add' })
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
              expect(uint8ArrayToBase64(result.transaction.logs![0])).toBe('FR98dQAAAAAAAAAD')
            }
          )
        })

        it('allows the users to switch to echo_bytes method and send the transaction', async () => {
          const { testAccount } = localnet.context
          vi.mocked(useParams).mockImplementation(() => ({ applicationId: appId.toString() }))

          return executeComponentTest(
            () => {
              return render(<ApplicationPage />, undefined, myStore)
            },
            async (component, user) => {
              // Start with add method
              const addMethodPanel = await expandMethodAccordion(component, user, 'add')

              // Call the add method
              const callButton = await waitFor(() => {
                const callButton = within(addMethodPanel).getByRole('button', { name: 'Call' })
                expect(callButton).not.toBeDisabled()
                return callButton!
              })
              await user.click(callButton)
              let formDialog = component.getByRole('dialog')

              // Input values for add method
              fireEvent.input(await getArgInput(formDialog, 'Argument 1'), { target: { value: '1' } })
              fireEvent.input(await getArgInput(formDialog, 'Argument 2'), { target: { value: '2' } })

              // Save the transaction
              const addButton = await waitFor(() => component.getByRole('button', { name: 'Add' }))
              await user.click(addButton)

              await waitFor(() => {
                expect(component.queryByRole('dialog')).not.toBeInTheDocument()
              })

              // Edit the transaction
              const transactionGroupTable = await waitFor(() => within(addMethodPanel).getByLabelText(transactionGroupTableLabel))
              await user.click(await within(transactionGroupTable).findByRole('button', { name: transactionActionsLabel }))
              await user.click(await component.findByRole('menuitem', { name: 'Edit' }))
              formDialog = component.getByRole('dialog')

              // Switch to echo_bytes method and save
              await selectOption(formDialog.parentElement!, user, /Method/, 'echo_bytes')
              const arg1Input = await getArgInput(formDialog, 'Argument 1')
              expect(arg1Input).toHaveValue('')
              fireEvent.input(arg1Input, { target: { value: 'AgI=' } })
              await user.click(within(formDialog).getByRole('button', { name: 'Update' }))

              // Send the transaction
              const sendButton = await waitFor(() => {
                const sendButton = component.getByRole('button', { name: sendButtonLabel })
                expect(sendButton).not.toBeDisabled()
                return sendButton!
              })
              await user.click(sendButton)

              // Verify the result
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
              expect(uint8ArrayToBase64(result.transaction.logs![0])).toBe('FR98dQACAgI=')
            }
          )
        })

        it('fee can be set to zero and the transaction should fail', async () => {
          vi.mocked(useParams).mockImplementation(() => ({ applicationId: appId.toString() }))

          return executeComponentTest(
            () => {
              return render(<ApplicationPage />, undefined, myStore)
            },
            async (component, user) => {
              const addMethodPanel = await expandMethodAccordion(component, user, 'add')

              // Open the build transaction dialog
              const callButton = await waitFor(() => {
                const addTransactionButton = within(addMethodPanel).getByRole('button', { name: 'Call' })
                expect(addTransactionButton).not.toBeDisabled()
                return addTransactionButton!
              })
              await user.click(callButton)

              // Fill the form
              const formDialog = component.getByRole('dialog')

              const arg1Input = await getArgInput(formDialog, 'Argument 1')
              fireEvent.input(arg1Input, {
                target: { value: '1' },
              })

              const arg2Input = await getArgInput(formDialog, 'Argument 2')
              fireEvent.input(arg2Input, {
                target: { value: '2' },
              })

              await setCheckbox(formDialog, user, 'Set fee automatically', false)
              const feeInput = await within(formDialog).findByLabelText(/Fee/)
              fireEvent.input(feeInput, {
                target: { value: '0' },
              })

              await user.click(await component.findByRole('button', { name: 'Add' }))

              await waitFor(() => {
                const requiredValidationMessages = within(formDialog).queryAllByText('Required')
                expect(requiredValidationMessages.length).toBe(0)
              })

              // Send the transaction
              await user.click(await component.findByRole('button', { name: sendButtonLabel }))

              const errorMessage = await component.findByText(
                'Request to /v2/transactions/simulate failed with status 400: txgroup had 0 in fees, which is less than the minimum 1 * 1000'
              )
              expect(errorMessage).toBeInTheDocument()
            }
          )
        })

        it('fee can be be shared between transactions', async () => {
          vi.mocked(useParams).mockImplementation(() => ({ applicationId: appId.toString() }))

          return executeComponentTest(
            () => {
              return render(<ApplicationPage />, undefined, myStore)
            },
            async (component, user) => {
              const addMethodPanel = await expandMethodAccordion(component, user, 'add')

              // Open the build transaction dialog
              const callButton = await waitFor(() => {
                const addTransactionButton = within(addMethodPanel).getByRole('button', { name: 'Call' })
                expect(addTransactionButton).not.toBeDisabled()
                return addTransactionButton!
              })
              await user.click(callButton)

              // Fill the form
              const addTxnFormDialog = component.getByRole('dialog')

              const arg1Input = await getArgInput(addTxnFormDialog, 'Argument 1')
              fireEvent.input(arg1Input, {
                target: { value: '1' },
              })

              const arg2Input = await getArgInput(addTxnFormDialog, 'Argument 2')
              fireEvent.input(arg2Input, {
                target: { value: '2' },
              })

              await setCheckbox(addTxnFormDialog, user, 'Set fee automatically', false)
              const feeInput = await within(addTxnFormDialog).findByLabelText(/Fee/)
              fireEvent.input(feeInput, {
                target: { value: '0' },
              })

              await user.click(await component.findByRole('button', { name: 'Add' }))

              await waitFor(() => {
                const requiredValidationMessages = within(addTxnFormDialog).queryAllByText('Required')
                expect(requiredValidationMessages.length).toBe(0)
              })

              // Add a payment transaction with 0.002 fee to cover the previous transaction
              await user.click(await component.findByRole('button', { name: addTransactionLabel }))

              const paymentTxnFormDialog = component.getByRole('dialog')

              fireEvent.input(within(paymentTxnFormDialog).getByLabelText(/Receiver/), {
                target: { value: localnet.context.testAccount.addr },
              })

              fireEvent.input(within(paymentTxnFormDialog).getByLabelText(/Amount to pay/), { target: { value: '1' } })

              await setCheckbox(paymentTxnFormDialog, user, 'Set fee automatically', false)
              fireEvent.input(await within(paymentTxnFormDialog).findByLabelText(/Fee/), {
                target: { value: '0.002' },
              })

              await user.click(await component.findByRole('button', { name: 'Add' }))

              // Send the transaction
              await user.click(await component.findByRole('button', { name: sendButtonLabel }))

              // Check the result
              const resultsDiv = await waitFor(
                () => {
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
              expect(result.transaction.sender).toBe(localnet.context.testAccount.addr.toString())
              expect(result.transaction.fee).toBe(0n)
              expect(uint8ArrayToBase64(result.transaction.logs![0])).toBe('FR98dQAAAAAAAAAD')
            }
          )
        })
      })

      describe('when calling get_pay_txn_amount method', () => {
        it('succeeds when all fields have been correctly supplied', async () => {
          const { testAccount } = localnet.context
          const testAccount2 = await localnet.context.generateAccount({ initialFunds: algo(0) })
          vi.mocked(useParams).mockImplementation(() => ({ applicationId: appId.toString() }))

          return executeComponentTest(
            () => {
              return render(<ApplicationPage />, undefined, myStore)
            },
            async (component, user) => {
              const addMethodPanel = await expandMethodAccordion(component, user, 'get_pay_txn_amount')

              // Call the method
              const callButton = await waitFor(() => {
                const callButton = within(addMethodPanel).getByRole('button', { name: 'Call' })
                expect(callButton).not.toBeDisabled()
                return callButton!
              })
              await user.click(callButton)
              let formDialog = component.getByRole('dialog')
              // Wait for the dialog to be rendered
              await waitFor(() => within(formDialog).getByText('Argument 1'))
              // Save the app call transaction
              await user.click(within(formDialog).getByRole('button', { name: 'Add' }))

              // Click placeholder row in the table to launch the dialog for the payment transaction
              const transactionGroupTable = await waitFor(() => within(addMethodPanel).getByLabelText(transactionGroupTableLabel))
              const firstBodyRow = within(transactionGroupTable).getAllByRole('row')[1]
              await user.click(firstBodyRow)
              formDialog = component.getByRole('dialog')

              // Fill in the payment transaction
              const receiverInput = await within(formDialog).findByLabelText(/Receiver/)
              fireEvent.input(receiverInput, {
                target: { value: testAccount2.addr },
              })

              const amountInput = await within(formDialog).findByLabelText(/Amount/)
              fireEvent.input(amountInput, {
                target: { value: '0.5' },
              })

              // Save the payment transaction
              await user.click(within(formDialog).getByRole('button', { name: 'Add' }))

              // Send the transactions
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

              // Check the payment transaction
              const paymentTransactionId = await waitFor(
                () => {
                  const transactionLink = within(resultsDiv)
                    .getAllByRole('link')
                    .find((a) => a.getAttribute('href')?.startsWith('/localnet/transaction'))!
                  return transactionLink.getAttribute('href')!.split('/').pop()!
                },
                { timeout: 10_000 }
              )
              const paymentTransaction = await localnet.context.waitForIndexerTransaction(paymentTransactionId)
              expect(paymentTransaction.transaction.sender).toBe(testAccount.addr.toString())
              expect(paymentTransaction.transaction.paymentTransaction!).toMatchInlineSnapshot(`
                {
                  "amount": 500000n,
                  "closeAmount": 0n,
                  "receiver": "${testAccount2.addr.toString()}",
                }
              `)

              // Check the app call transaction
              const appCallTransactionId = await waitFor(
                () => {
                  const transactionLink = within(resultsDiv)
                    .getAllByRole('link')
                    .filter((a) => a.getAttribute('href')?.startsWith('/localnet/transaction'))![1]
                  return transactionLink.getAttribute('href')!.split('/').pop()!
                },
                { timeout: 10_000 }
              )

              // This is a bit hacky, we traverse the DOM to find the inner app call method name
              // This is to verify that the abiMethod is resolved correctly for the app call
              const innerAppCallTxnLink = within(resultsDiv)
                .getAllByRole('link')
                .find((a) => a.getAttribute('href')?.startsWith(`/localnet/transaction/${appCallTransactionId}`))
              expect(innerAppCallTxnLink?.parentElement?.parentElement?.parentElement?.parentElement?.nextSibling?.textContent).toBe(
                '1App Callget_pay_txn_amount'
              )

              const appCallTransaction = await localnet.context.waitForIndexerTransaction(appCallTransactionId)
              expect(appCallTransaction.transaction.sender).toBe(testAccount.addr.toString())
              expect(uint8ArrayToBase64(appCallTransaction.transaction.logs![0])).toBe('FR98dQAAAAAAB6Eg')
            }
          )
        })

        it('allows the user to edit the payment amount', async () => {
          const { testAccount } = localnet.context
          const testAccount2 = await localnet.context.generateAccount({ initialFunds: algo(0) })
          vi.mocked(useParams).mockImplementation(() => ({ applicationId: appId.toString() }))

          return executeComponentTest(
            () => {
              return render(<ApplicationPage />, undefined, myStore)
            },
            async (component, user) => {
              const addMethodPanel = await expandMethodAccordion(component, user, 'get_pay_txn_amount')

              // Call the method
              const callButton = await waitFor(() => {
                const callButton = within(addMethodPanel).getByRole('button', { name: 'Call' })
                expect(callButton).not.toBeDisabled()
                return callButton!
              })
              await user.click(callButton)
              let formDialog = component.getByRole('dialog')
              // Wait for the dialog to be rendered
              await waitFor(() => within(formDialog).getByText('Argument 1'))
              // Click add to add the payment transaction as param
              await user.click(within(formDialog).getByRole('button', { name: 'Add' }))

              // Click placeholder row in the table to launch the dialog for the payment transaction
              let transactionGroupTable = await waitFor(() => within(addMethodPanel).getByLabelText(transactionGroupTableLabel))
              let firstBodyRow = within(transactionGroupTable).getAllByRole('row')[1]
              await user.click(firstBodyRow)
              formDialog = component.getByRole('dialog')

              // Fill in the payment transaction
              const receiverInput = await within(formDialog).findByLabelText(/Receiver/)
              fireEvent.input(receiverInput, {
                target: { value: testAccount2.addr },
              })

              let amountInput = await within(formDialog).findByLabelText(/Amount/)
              fireEvent.input(amountInput, {
                target: { value: '0.5' },
              })

              // Save the payment transaction
              await user.click(within(formDialog).getByRole('button', { name: 'Add' }))
              await waitFor(() => {
                expect(component.queryByRole('dialog')).not.toBeInTheDocument()
              })

              // Edit the payment transaction
              transactionGroupTable = await waitFor(() => within(addMethodPanel).getByLabelText(transactionGroupTableLabel))
              firstBodyRow = within(transactionGroupTable).getAllByRole('row')[1]
              await user.click(await within(firstBodyRow).findByRole('button', { name: transactionActionsLabel }))
              await user.click(await component.findByRole('menuitem', { name: 'Edit' }))

              formDialog = component.getByRole('dialog')
              amountInput = await within(formDialog).findByLabelText(/Amount/)
              fireEvent.input(amountInput, {
                target: { value: '0.6' },
              })

              // Save the payment transaction
              await user.click(within(formDialog).getByRole('button', { name: 'Update' }))

              // Send the transactions
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

              // Check the payment transaction
              const paymentTransactionId = await waitFor(
                () => {
                  const transactionLink = within(resultsDiv)
                    .getAllByRole('link')
                    .find((a) => a.getAttribute('href')?.startsWith('/localnet/transaction'))!
                  return transactionLink.getAttribute('href')!.split('/').pop()!
                },
                { timeout: 10_000 }
              )
              const paymentTransaction = await localnet.context.waitForIndexerTransaction(paymentTransactionId)
              expect(paymentTransaction.transaction.sender).toBe(testAccount.addr.toString())
              expect(paymentTransaction.transaction.paymentTransaction!).toMatchInlineSnapshot(`
                {
                  "amount": 600000n,
                  "closeAmount": 0n,
                  "receiver": "MQMCTZV5BHA5Z3QU7GOIUDZCTCJZDQACPLWZURGLJGX3YBY5PE6RMC24RE",
                }
              `)

              // Check the app call transaction
              const appCallTransactionId = await waitFor(
                () => {
                  const transactionLink = within(resultsDiv)
                    .getAllByRole('link')
                    .filter((a) => a.getAttribute('href')?.startsWith('/localnet/transaction'))![1]
                  return transactionLink.getAttribute('href')!.split('/').pop()!
                },
                { timeout: 10_000 }
              )

              const appCallTransaction = await localnet.context.waitForIndexerTransaction(appCallTransactionId)
              expect(appCallTransaction.transaction.sender).toBe(testAccount.addr.toString())
              expect(uint8ArrayToBase64(appCallTransaction.transaction.logs![0])).toBe('FR98dQAAAAAACSfA')
            }
          )
        })

        it('allows the user to edit note for get_pay_txn_amount method call', async () => {
          const { testAccount } = localnet.context
          const testAccount2 = await localnet.context.generateAccount({ initialFunds: algo(0) })
          vi.mocked(useParams).mockImplementation(() => ({ applicationId: appId.toString() }))

          return executeComponentTest(
            () => {
              return render(<ApplicationPage />, undefined, myStore)
            },
            async (component, user) => {
              const addMethodPanel = await expandMethodAccordion(component, user, 'get_pay_txn_amount')

              // Call the method
              const callButton = await waitFor(() => {
                const callButton = within(addMethodPanel).getByRole('button', { name: 'Call' })
                expect(callButton).not.toBeDisabled()
                return callButton!
              })
              await user.click(callButton)
              let formDialog = component.getByRole('dialog')
              // Wait for the dialog to be rendered
              await waitFor(() => within(formDialog).getByText('Argument 1'))
              // Click add to add the payment transaction as param
              await user.click(within(formDialog).getByRole('button', { name: 'Add' }))

              // Click placeholder row in the table to launch the dialog for the payment transaction
              let transactionGroupTable = await waitFor(() => within(addMethodPanel).getByLabelText(transactionGroupTableLabel))
              let firstBodyRow = within(transactionGroupTable).getAllByRole('row')[1]
              await user.click(firstBodyRow)
              formDialog = component.getByRole('dialog')

              // Fill in the payment transaction
              const receiverInput = await within(formDialog).findByLabelText(/Receiver/)
              fireEvent.input(receiverInput, {
                target: { value: testAccount2.addr },
              })

              const amountInput = await within(formDialog).findByLabelText(/Amount/)
              fireEvent.input(amountInput, {
                target: { value: '0.5' },
              })

              // Save the payment transaction
              await user.click(within(formDialog).getByRole('button', { name: 'Add' }))
              await waitFor(() => {
                expect(component.queryByRole('dialog')).not.toBeInTheDocument()
              })

              // Edit the app call transaction
              transactionGroupTable = await waitFor(() => within(addMethodPanel).getByLabelText(transactionGroupTableLabel))
              firstBodyRow = within(transactionGroupTable).getAllByRole('row')[2]
              await user.click(await within(firstBodyRow).findByRole('button', { name: transactionActionsLabel }))
              await user.click(await component.findByRole('menuitem', { name: 'Edit' }))

              formDialog = component.getByRole('dialog')
              const noteInput = await within(formDialog).findByLabelText(/Note/)
              fireEvent.input(noteInput, {
                target: { value: 'hello world!' },
              })

              // Save the app call transaction
              await user.click(within(formDialog).getByRole('button', { name: 'Update' }))

              // Confirm that the table still contains 2 transactions
              transactionGroupTable = await waitFor(() => within(addMethodPanel).getByLabelText(transactionGroupTableLabel))
              expect(within(transactionGroupTable).getAllByRole('row').length).toBe(3)

              // Send the transactions
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

              // Check the payment transaction
              const paymentTransactionId = await waitFor(
                () => {
                  const transactionLink = within(resultsDiv)
                    .getAllByRole('link')
                    .find((a) => a.getAttribute('href')?.startsWith('/localnet/transaction'))!
                  return transactionLink.getAttribute('href')!.split('/').pop()!
                },
                { timeout: 10_000 }
              )
              const paymentTransaction = await localnet.context.waitForIndexerTransaction(paymentTransactionId)
              expect(paymentTransaction.transaction.sender).toBe(testAccount.addr.toString())
              expect(paymentTransaction.transaction.paymentTransaction!).toMatchInlineSnapshot(`
                {
                  "amount": 500000n,
                  "closeAmount": 0n,
                  "receiver": "KZF3PX4NYJLJH3UO3565UNP7DK2WTZHOSV2AGKDGSL3LMHTUTLTYPZOMLM",
                }
              `)

              // Check the app call transaction
              const appCallTransactionId = await waitFor(
                () => {
                  const transactionLink = within(resultsDiv)
                    .getAllByRole('link')
                    .filter((a) => a.getAttribute('href')?.startsWith('/localnet/transaction'))![1]
                  return transactionLink.getAttribute('href')!.split('/').pop()!
                },
                { timeout: 10_000 }
              )

              const appCallTransaction = await localnet.context.waitForIndexerTransaction(appCallTransactionId)
              expect(appCallTransaction.transaction.sender).toBe(testAccount.addr.toString())
              expect(uint8ArrayToBase64(appCallTransaction.transaction.note!)).toBe('aGVsbG8gd29ybGQh')
            }
          )
        })

        it('clear the payment transaction if the user switch to call add method', async () => {
          const testAccount2 = await localnet.context.generateAccount({ initialFunds: algo(0) })
          vi.mocked(useParams).mockImplementation(() => ({ applicationId: appId.toString() }))

          return executeComponentTest(
            () => {
              return render(<ApplicationPage />, undefined, myStore)
            },
            async (component, user) => {
              const addMethodPanel = await expandMethodAccordion(component, user, 'get_pay_txn_amount')

              // Call the method
              const callButton = await waitFor(() => {
                const callButton = within(addMethodPanel).getByRole('button', { name: 'Call' })
                expect(callButton).not.toBeDisabled()
                return callButton!
              })
              await user.click(callButton)
              let formDialog = component.getByRole('dialog')
              // Wait for the dialog to be rendered
              await waitFor(() => within(formDialog).getByText('Argument 1'))
              // Click add to add the payment transaction as param
              await user.click(within(formDialog).getByRole('button', { name: 'Add' }))

              // Click placeholder row in the table to launch the dialog for the payment transaction
              let transactionGroupTable = await waitFor(() => within(addMethodPanel).getByLabelText(transactionGroupTableLabel))
              let firstBodyRow = within(transactionGroupTable).getAllByRole('row')[1]
              await user.click(firstBodyRow)
              formDialog = component.getByRole('dialog')

              // Fill in the payment transaction
              const receiverInput = await within(formDialog).findByLabelText(/Receiver/)
              fireEvent.input(receiverInput, {
                target: { value: testAccount2.addr },
              })

              const amountInput = await within(formDialog).findByLabelText(/Amount/)
              fireEvent.input(amountInput, {
                target: { value: '0.5' },
              })

              // Save the payment transaction
              await user.click(within(formDialog).getByRole('button', { name: 'Add' }))
              await waitFor(() => {
                expect(component.queryByRole('dialog')).not.toBeInTheDocument()
              })

              // Edit the app call transaction
              transactionGroupTable = await waitFor(() => within(addMethodPanel).getByLabelText(transactionGroupTableLabel))
              firstBodyRow = within(transactionGroupTable).getAllByRole('row')[2]
              await user.click(await within(firstBodyRow).findByRole('button', { name: transactionActionsLabel }))
              await user.click(await component.findByRole('menuitem', { name: 'Edit' }))

              formDialog = component.getByRole('dialog')
              await selectOption(formDialog.parentElement!, user, /Method/, 'add')

              const arg1Input = await getArgInput(formDialog, 'Argument 1')
              fireEvent.input(arg1Input, {
                target: { value: '1' },
              })
              const arg2Input = await getArgInput(formDialog, 'Argument 2')
              fireEvent.input(arg2Input, {
                target: { value: '2' },
              })

              // Save the app call transaction
              await user.click(within(formDialog).getByRole('button', { name: 'Update' }))

              // Confirm that the table still contains 2 transactions
              transactionGroupTable = await waitFor(() => within(addMethodPanel).getByLabelText(transactionGroupTableLabel))
              expect(within(transactionGroupTable).getAllByRole('row').length).toBe(2)
            }
          )
        })
      })

      describe('when calling echo_bytes method', () => {
        it('succeeds when a byte array is supplied', async () => {
          const { testAccount } = localnet.context
          vi.mocked(useParams).mockImplementation(() => ({ applicationId: appId.toString() }))

          return executeComponentTest(
            () => {
              return render(<ApplicationPage />, undefined, myStore)
            },
            async (component, user) => {
              const echoBytesPanel = await expandMethodAccordion(component, user, 'echo_bytes')

              // Call the method
              const callButton = await waitFor(() => {
                const callButton = within(echoBytesPanel).getByRole('button', { name: 'Call' })
                expect(callButton).not.toBeDisabled()
                return callButton!
              })
              await user.click(callButton)
              const formDialog = component.getByRole('dialog')

              // Input the byte array in base64
              const argInput = await getArgInput(formDialog, 'Argument 1')
              fireEvent.input(argInput, {
                target: { value: 'AQ==' },
              })

              // Save the transaction
              const addButton = await waitFor(() => {
                const addButton = within(formDialog).getByRole('button', { name: 'Add' })
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
              expect(uint8ArrayToBase64(result.transaction.logs![0])).toBe('FR98dQABAQ==')
            }
          )
        })

        it('allows the user to edit the input, save and send again', async () => {
          const { testAccount } = localnet.context
          vi.mocked(useParams).mockImplementation(() => ({ applicationId: appId.toString() }))

          return executeComponentTest(
            () => {
              return render(<ApplicationPage />, undefined, myStore)
            },
            async (component, user) => {
              const echoBytesPanel = await expandMethodAccordion(component, user, 'echo_bytes')

              // Call the method
              const callButton = await waitFor(() => {
                const callButton = within(echoBytesPanel).getByRole('button', { name: 'Call' })
                expect(callButton).not.toBeDisabled()
                return callButton!
              })
              await user.click(callButton)
              let formDialog = component.getByRole('dialog')

              // Input the initial byte array in base64
              const argInput = await getArgInput(formDialog, 'Argument 1')
              fireEvent.input(argInput, {
                target: { value: 'AQ==' },
              })

              // Save the transaction, make sure that there is no validation error
              await user.click(within(formDialog).getByRole('button', { name: 'Add' }))
              await waitFor(() => {
                const requiredValidationMessages = component.queryAllByText('Required')
                expect(requiredValidationMessages.length).toBe(0)
              })
              await waitFor(() => {
                expect(component.queryByRole('dialog')).not.toBeInTheDocument()
              })

              // Edit the transaction
              const transactionGroupTable = await waitFor(() => within(echoBytesPanel).getByLabelText(transactionGroupTableLabel))
              await user.click(await within(transactionGroupTable).findByRole('button', { name: transactionActionsLabel }))
              await user.click(await component.findByRole('menuitem', { name: 'Edit' }))
              formDialog = component.getByRole('dialog')

              // Input the new byte array in base64
              const editedArgInput = await getArgInput(formDialog, 'Argument 1')
              expect(editedArgInput).toHaveValue('AQ==')
              fireEvent.input(editedArgInput, {
                target: { value: 'AgI=' },
              })

              // Save the edited transaction
              await user.click(within(formDialog).getByRole('button', { name: 'Update' }))

              // Send the transaction
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
              expect(uint8ArrayToBase64(result.transaction.logs![0])).toBe('FR98dQACAgI=')
            }
          )
        })

        it('fails when no byte array is supplied', async () => {
          vi.mocked(useParams).mockImplementation(() => ({ applicationId: appId.toString() }))

          return executeComponentTest(
            () => {
              return render(<ApplicationPage />, undefined, myStore)
            },
            async (component, user) => {
              const echoBytePanel = await expandMethodAccordion(component, user, 'echo_bytes')

              // Call the method
              const callButton = await waitFor(() => {
                const callButton = within(echoBytePanel).getByRole('button', { name: 'Call' })
                expect(callButton).not.toBeDisabled()
                return callButton!
              })
              await user.click(callButton)
              const formDialog = component.getByRole('dialog')

              // Try to add without input
              const addButton = await waitFor(() => within(formDialog).getByRole('button', { name: 'Add' }))
              await user.click(addButton)

              await waitFor(() => {
                const requiredValidationMessages = component.getAllByText('Required')
                expect(requiredValidationMessages.length).toBeGreaterThan(0)
              })
            }
          )
        })
      })

      describe('when calling echo_static_array method', () => {
        it('succeeds when an array is supplied', async () => {
          const { testAccount } = localnet.context
          vi.mocked(useParams).mockImplementation(() => ({ applicationId: appId.toString() }))

          return executeComponentTest(
            () => {
              return render(<ApplicationPage />, undefined, myStore)
            },
            async (component, user) => {
              const echoArrayPanel = await expandMethodAccordion(component, user, 'echo_static_array')

              // Call the method
              const callButton = await waitFor(() => {
                const callButton = within(echoArrayPanel).getByRole('button', { name: 'Call' })
                expect(callButton).not.toBeDisabled()
                return callButton!
              })
              await user.click(callButton)
              const formDialog = component.getByRole('dialog')

              // Input the array
              fireEvent.input(await getStaticArrayArgInput(formDialog, 'Argument 1', 0), {
                target: { value: '1' },
              })
              fireEvent.input(await getStaticArrayArgInput(formDialog, 'Argument 1', 1), {
                target: { value: '2' },
              })
              fireEvent.input(await getStaticArrayArgInput(formDialog, 'Argument 1', 2), {
                target: { value: '3' },
              })
              fireEvent.input(await getStaticArrayArgInput(formDialog, 'Argument 1', 3), {
                target: { value: '4' },
              })

              // Save the transaction
              const addButton = await waitFor(() => {
                const addButton = within(formDialog).getByRole('button', { name: 'Add' })
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
              expect(uint8ArrayToBase64(result.transaction.logs![0])).toBe('FR98dQAAAAAAAAABAAAAAAAAAAIAAAAAAAAAAwAAAAAAAAAE')
            }
          )
        })

        it('allows edit', async () => {
          const { testAccount } = localnet.context
          vi.mocked(useParams).mockImplementation(() => ({ applicationId: appId.toString() }))

          return executeComponentTest(
            () => {
              return render(<ApplicationPage />, undefined, myStore)
            },
            async (component, user) => {
              const echoArrayPanel = await expandMethodAccordion(component, user, 'echo_static_array')

              // Call the method
              const callButton = await waitFor(() => {
                const callButton = within(echoArrayPanel).getByRole('button', { name: 'Call' })
                expect(callButton).not.toBeDisabled()
                return callButton!
              })
              await user.click(callButton)
              let formDialog = component.getByRole('dialog')

              // Input the array
              fireEvent.input(await getStaticArrayArgInput(formDialog, 'Argument 1', 0), {
                target: { value: '1' },
              })
              fireEvent.input(await getStaticArrayArgInput(formDialog, 'Argument 1', 1), {
                target: { value: '2' },
              })
              fireEvent.input(await getStaticArrayArgInput(formDialog, 'Argument 1', 2), {
                target: { value: '3' },
              })
              fireEvent.input(await getStaticArrayArgInput(formDialog, 'Argument 1', 3), {
                target: { value: '4' },
              })

              // Save the transaction
              const addButton = await waitFor(() => {
                const addButton = within(formDialog).getByRole('button', { name: 'Add' })
                expect(addButton).not.toBeDisabled()
                return addButton!
              })
              await user.click(addButton)
              await waitFor(() => {
                expect(component.queryByRole('dialog')).not.toBeInTheDocument()
              })

              // Edit the transaction
              const transactionGroupTable = await waitFor(() => within(echoArrayPanel).getByLabelText(transactionGroupTableLabel))
              await user.click(await within(transactionGroupTable).findByRole('button', { name: transactionActionsLabel }))
              await user.click(await component.findByRole('menuitem', { name: 'Edit' }))
              formDialog = component.getByRole('dialog')

              // Check the existing values
              expect(await getStaticArrayArgInput(formDialog, 'Argument 1', 0)).toHaveValue('1')
              expect(await getStaticArrayArgInput(formDialog, 'Argument 1', 1)).toHaveValue('2')
              expect(await getStaticArrayArgInput(formDialog, 'Argument 1', 2)).toHaveValue('3')
              expect(await getStaticArrayArgInput(formDialog, 'Argument 1', 3)).toHaveValue('4')

              // Update the last value
              fireEvent.input(await getStaticArrayArgInput(formDialog, 'Argument 1', 3), {
                target: { value: '44' },
              })

              // Save the transaction
              const updateButton = await waitFor(() => {
                const updateButton = within(formDialog).getByRole('button', { name: 'Update' })
                expect(updateButton).not.toBeDisabled()
                return updateButton!
              })
              await user.click(updateButton)

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
              expect(uint8ArrayToBase64(result.transaction.logs![0])).toBe('FR98dQAAAAAAAAABAAAAAAAAAAIAAAAAAAAAAwAAAAAAAAAs')
            }
          )
        })
      })

      describe('when calling echo_dynamic_array method', () => {
        it('succeeds when an array is supplied', async () => {
          const { testAccount } = localnet.context
          vi.mocked(useParams).mockImplementation(() => ({ applicationId: appId.toString() }))

          return executeComponentTest(
            () => {
              return render(<ApplicationPage />, undefined, myStore)
            },
            async (component, user) => {
              const echoDynamicArrayPanel = await expandMethodAccordion(component, user, 'echo_dynamic_array')

              // Call the method
              const callButton = await waitFor(() => {
                const callButton = within(echoDynamicArrayPanel).getByRole('button', { name: 'Call' })
                expect(callButton).not.toBeDisabled()
                return callButton!
              })
              await user.click(callButton)
              const formDialog = component.getByRole('dialog')

              // Input the array
              await addItemIntoDynamicArray(formDialog, user, 'Argument 1')
              await addItemIntoDynamicArray(formDialog, user, 'Argument 1')
              await addItemIntoDynamicArray(formDialog, user, 'Argument 1')
              fireEvent.input(await getDynamicArrayArgInput(formDialog, 'Argument 1', 'Item 1'), {
                target: { value: '1' },
              })
              fireEvent.input(await getDynamicArrayArgInput(formDialog, 'Argument 1', 'Item 2'), {
                target: { value: '2' },
              })
              fireEvent.input(await getDynamicArrayArgInput(formDialog, 'Argument 1', 'Item 3'), {
                target: { value: '3' },
              })

              // Save the transaction
              const addButton = await waitFor(() => {
                const addButton = within(formDialog).getByRole('button', { name: 'Add' })
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
              expect(uint8ArrayToBase64(result.transaction.logs![0])).toBe('FR98dQADAAAAAAAAAAEAAAAAAAAAAgAAAAAAAAAD')
            }
          )
        })

        it('allows edit', async () => {
          const { testAccount } = localnet.context
          vi.mocked(useParams).mockImplementation(() => ({ applicationId: appId.toString() }))

          return executeComponentTest(
            () => {
              return render(<ApplicationPage />, undefined, myStore)
            },
            async (component, user) => {
              const echoDynamicArrayPanel = await expandMethodAccordion(component, user, 'echo_dynamic_array')

              // Call the method
              const callButton = await waitFor(() => {
                const callButton = within(echoDynamicArrayPanel).getByRole('button', { name: 'Call' })
                expect(callButton).not.toBeDisabled()
                return callButton!
              })
              await user.click(callButton)
              let formDialog = component.getByRole('dialog')

              // Input the array
              await addItemIntoDynamicArray(formDialog, user, 'Argument 1')
              await addItemIntoDynamicArray(formDialog, user, 'Argument 1')
              await addItemIntoDynamicArray(formDialog, user, 'Argument 1')
              fireEvent.input(await getDynamicArrayArgInput(formDialog, 'Argument 1', 'Item 1'), {
                target: { value: '1' },
              })
              fireEvent.input(await getDynamicArrayArgInput(formDialog, 'Argument 1', 'Item 2'), {
                target: { value: '2' },
              })
              fireEvent.input(await getDynamicArrayArgInput(formDialog, 'Argument 1', 'Item 3'), {
                target: { value: '3' },
              })

              // Save the transaction
              const addButton = await waitFor(() => {
                const addButton = within(formDialog).getByRole('button', { name: 'Add' })
                expect(addButton).not.toBeDisabled()
                return addButton!
              })
              await user.click(addButton)
              await waitFor(() => {
                expect(component.queryByRole('dialog')).not.toBeInTheDocument()
              })

              // Edit the transaction
              const transactionGroupTable = await waitFor(() => within(echoDynamicArrayPanel).getByLabelText(transactionGroupTableLabel))
              await user.click(await within(transactionGroupTable).findByRole('button', { name: transactionActionsLabel }))
              await user.click(await component.findByRole('menuitem', { name: 'Edit' }))
              formDialog = component.getByRole('dialog')

              // Check the existing values
              expect(await getDynamicArrayArgInput(formDialog, 'Argument 1', 'Item 1')).toHaveValue('1')
              expect(await getDynamicArrayArgInput(formDialog, 'Argument 1', 'Item 2')).toHaveValue('2')
              expect(await getDynamicArrayArgInput(formDialog, 'Argument 1', 'Item 3')).toHaveValue('3')

              // Add another item
              await addItemIntoDynamicArray(formDialog, user, 'Argument 1')
              fireEvent.input(await getDynamicArrayArgInput(formDialog, 'Argument 1', 'Item 4'), {
                target: { value: '4' },
              })

              // Save the transaction
              const updateButton = await waitFor(() => {
                const updateButton = within(formDialog).getByRole('button', { name: 'Update' })
                expect(updateButton).not.toBeDisabled()
                return updateButton!
              })
              await user.click(updateButton)

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
              expect(uint8ArrayToBase64(result.transaction.logs![0])).toBe('FR98dQAEAAAAAAAAAAEAAAAAAAAAAgAAAAAAAAADAAAAAAAAAAQ=')
            }
          )
        })
      })

      describe('when calling nest_array_and_tuple method', () => {
        it('succeeds when the input is supplied', async () => {
          const { testAccount } = localnet.context
          vi.mocked(useParams).mockImplementation(() => ({ applicationId: appId.toString() }))

          return executeComponentTest(
            () => {
              return render(<ApplicationPage />, undefined, myStore)
            },
            async (component, user) => {
              const methodPanel = await expandMethodAccordion(component, user, 'nest_array_and_tuple')

              // Call the method
              const callButton = await waitFor(() => {
                const callButton = within(methodPanel).getByRole('button', { name: 'Call' })
                expect(callButton).not.toBeDisabled()
                return callButton!
              })
              await user.click(callButton)
              const formDialog = component.getByRole('dialog')

              // Input
              await addItemIntoDynamicArray(formDialog, user, 'Argument 1')
              await addItemIntoDynamicArray(formDialog, user, 'Argument 1')
              await addItemIntoDynamicArray(formDialog, user, 'Argument 1', 'Item 1')
              await addItemIntoDynamicArray(formDialog, user, 'Argument 1', 'Item 1')
              await addItemIntoDynamicArray(formDialog, user, 'Argument 1', 'Item 2')
              await addItemIntoDynamicArray(formDialog, user, 'Argument 1', 'Item 2')
              fireEvent.input(await getDynamicArrayArgInput(formDialog, 'Argument 1', 'Item 1 - 1'), {
                target: { value: '1' },
              })
              fireEvent.input(await getDynamicArrayArgInput(formDialog, 'Argument 1', 'Item 1 - 2'), {
                target: { value: '2' },
              })
              fireEvent.input(await getDynamicArrayArgInput(formDialog, 'Argument 1', 'Item 2 - 1'), {
                target: { value: '3' },
              })
              fireEvent.input(await getDynamicArrayArgInput(formDialog, 'Argument 1', 'Item 2 - 2'), {
                target: { value: '4' },
              })
              await addItemIntoDynamicArray(formDialog, user, 'Argument 2', 'Item 1')
              await addItemIntoDynamicArray(formDialog, user, 'Argument 2', 'Item 1')
              fireEvent.input(await getDynamicArrayArgInput(formDialog, 'Argument 2', 'Item 1 - 1'), {
                target: { value: '5' },
              })
              fireEvent.input(await getDynamicArrayArgInput(formDialog, 'Argument 2', 'Item 1 - 2'), {
                target: { value: '6' },
              })
              fireEvent.input(await getTupleArgInput(formDialog, 'Argument 2', 'Item 2'), {
                target: { value: 'Hello' },
              })

              // Save the transaction
              const addButton = await waitFor(() => {
                const addButton = within(formDialog).getByRole('button', { name: 'Add' })
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
              expect(uint8ArrayToBase64(result.transaction.logs![0])).toBe(
                'FR98dQAEAC4AAgAEABYAAgAAAAAAAAABAAAAAAAAAAIAAgAAAAAAAAADAAAAAAAAAAQABAAWAAIAAAAAAAAABQAAAAAAAAAGAAVIZWxsbw=='
              )
            }
          )
        })

        it('allows edit', async () => {
          const { testAccount } = localnet.context
          vi.mocked(useParams).mockImplementation(() => ({ applicationId: appId.toString() }))

          return executeComponentTest(
            () => {
              return render(<ApplicationPage />, undefined, myStore)
            },
            async (component, user) => {
              const methodPanel = await expandMethodAccordion(component, user, 'nest_array_and_tuple')

              // Call the method
              const callButton = await waitFor(() => {
                const callButton = within(methodPanel).getByRole('button', { name: 'Call' })
                expect(callButton).not.toBeDisabled()
                return callButton!
              })
              await user.click(callButton)
              let formDialog = component.getByRole('dialog')

              // Input
              await addItemIntoDynamicArray(formDialog, user, 'Argument 1')
              await addItemIntoDynamicArray(formDialog, user, 'Argument 1')
              await addItemIntoDynamicArray(formDialog, user, 'Argument 1', 'Item 1')
              await addItemIntoDynamicArray(formDialog, user, 'Argument 1', 'Item 1')
              await addItemIntoDynamicArray(formDialog, user, 'Argument 1', 'Item 2')
              await addItemIntoDynamicArray(formDialog, user, 'Argument 1', 'Item 2')
              fireEvent.input(await getDynamicArrayArgInput(formDialog, 'Argument 1', 'Item 1 - 1'), {
                target: { value: '1' },
              })
              fireEvent.input(await getDynamicArrayArgInput(formDialog, 'Argument 1', 'Item 1 - 2'), {
                target: { value: '2' },
              })
              fireEvent.input(await getDynamicArrayArgInput(formDialog, 'Argument 1', 'Item 2 - 1'), {
                target: { value: '3' },
              })
              fireEvent.input(await getDynamicArrayArgInput(formDialog, 'Argument 1', 'Item 2 - 2'), {
                target: { value: '4' },
              })
              await addItemIntoDynamicArray(formDialog, user, 'Argument 2', 'Item 1')
              await addItemIntoDynamicArray(formDialog, user, 'Argument 2', 'Item 1')
              fireEvent.input(await getDynamicArrayArgInput(formDialog, 'Argument 2', 'Item 1 - 1'), {
                target: { value: '5' },
              })
              fireEvent.input(await getDynamicArrayArgInput(formDialog, 'Argument 2', 'Item 1 - 2'), {
                target: { value: '6' },
              })
              fireEvent.input(await getTupleArgInput(formDialog, 'Argument 2', 'Item 2'), {
                target: { value: 'Hello' },
              })

              // Save the transaction
              const addButton = await waitFor(() => {
                const addButton = within(formDialog).getByRole('button', { name: 'Add' })
                expect(addButton).not.toBeDisabled()
                return addButton!
              })
              await user.click(addButton)
              await waitFor(() => {
                expect(component.queryByRole('dialog')).not.toBeInTheDocument()
              })

              // Edit the transaction
              const transactionGroupTable = await within(methodPanel).findByLabelText(transactionGroupTableLabel)
              await user.click(await within(transactionGroupTable).findByRole('button', { name: transactionActionsLabel }))
              await user.click(await component.findByRole('menuitem', { name: 'Edit' }))
              formDialog = component.getByRole('dialog')

              // Verify the existing values
              expect(await getDynamicArrayArgInput(formDialog, 'Argument 1', 'Item 1 - 1')).toHaveValue('1')
              expect(await getDynamicArrayArgInput(formDialog, 'Argument 1', 'Item 1 - 2')).toHaveValue('2')
              expect(await getDynamicArrayArgInput(formDialog, 'Argument 1', 'Item 2 - 1')).toHaveValue('3')
              expect(await getDynamicArrayArgInput(formDialog, 'Argument 1', 'Item 2 - 2')).toHaveValue('4')
              expect(await getDynamicArrayArgInput(formDialog, 'Argument 2', 'Item 1 - 1')).toHaveValue('5')
              expect(await getDynamicArrayArgInput(formDialog, 'Argument 2', 'Item 1 - 2')).toHaveValue('6')
              expect(await getTupleArgInput(formDialog, 'Argument 2', 'Item 2')).toHaveValue('Hello')

              // Update the values
              await addItemIntoDynamicArray(formDialog, user, 'Argument 1', 'Item 1')
              await addItemIntoDynamicArray(formDialog, user, 'Argument 1', 'Item 2')
              await addItemIntoDynamicArray(formDialog, user, 'Argument 2', 'Item 1')
              fireEvent.input(await getDynamicArrayArgInput(formDialog, 'Argument 1', 'Item 1 - 3'), {
                target: { value: '11' },
              })
              fireEvent.input(await getDynamicArrayArgInput(formDialog, 'Argument 1', 'Item 2 - 3'), {
                target: { value: '22' },
              })
              fireEvent.input(await getDynamicArrayArgInput(formDialog, 'Argument 2', 'Item 1 - 3'), {
                target: { value: '33' },
              })

              // Save the transaction
              const updateButton = await waitFor(() => {
                const updateButton = within(formDialog).getByRole('button', { name: 'Update' })
                expect(updateButton).not.toBeDisabled()
                return updateButton!
              })
              await user.click(updateButton)

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
              expect(uint8ArrayToBase64(result.transaction.logs![0])).toBe(
                'FR98dQAEAD4AAgAEAB4AAwAAAAAAAAABAAAAAAAAAAIAAAAAAAAACwADAAAAAAAAAAMAAAAAAAAABAAAAAAAAAAWAAQAHgADAAAAAAAAAAUAAAAAAAAABgAAAAAAAAAhAAVIZWxsbw=='
              )
            }
          )
        })
      })

      describe('when calling echo_boolean method', () => {
        it('succeeds when the input is supplied', async () => {
          const { testAccount } = localnet.context
          vi.mocked(useParams).mockImplementation(() => ({ applicationId: appId.toString() }))

          return executeComponentTest(
            () => {
              return render(<ApplicationPage />, undefined, myStore)
            },
            async (component, user) => {
              const methodPanel = await expandMethodAccordion(component, user, 'echo_boolean')

              // Call the method
              const callButton = await waitFor(() => {
                const callButton = within(methodPanel).getByRole('button', { name: 'Call' })
                expect(callButton).not.toBeDisabled()
                return callButton!
              })
              await user.click(callButton)
              const formDialog = component.getByRole('dialog')

              // Input
              await setArgSelect(formDialog, user, 'Argument 1', 'True')

              // Save the transaction
              const addButton = await waitFor(() => {
                const addButton = within(formDialog).getByRole('button', { name: 'Add' })
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
              expect(uint8ArrayToBase64(result.transaction.logs![0])).toBe('FR98dYA=')
            }
          )
        })

        it('allows edit', async () => {
          const { testAccount } = localnet.context
          vi.mocked(useParams).mockImplementation(() => ({ applicationId: appId.toString() }))

          return executeComponentTest(
            () => {
              return render(<ApplicationPage />, undefined, myStore)
            },
            async (component, user) => {
              const methodPanel = await expandMethodAccordion(component, user, 'echo_boolean')

              // Call the method
              const callButton = await waitFor(() => {
                const callButton = within(methodPanel).getByRole('button', { name: 'Call' })
                expect(callButton).not.toBeDisabled()
                return callButton!
              })
              await user.click(callButton)
              let formDialog = component.getByRole('dialog')

              // Input
              await setArgSelect(formDialog, user, 'Argument 1', 'True')

              // Save the transaction
              const addButton = await waitFor(() => {
                const addButton = within(formDialog).getByRole('button', { name: 'Add' })
                expect(addButton).not.toBeDisabled()
                return addButton!
              })
              await user.click(addButton)
              await waitFor(() => {
                expect(component.queryByRole('dialog')).not.toBeInTheDocument()
              })

              // Edit the transaction
              const transactionGroupTable = await within(methodPanel).findByLabelText(transactionGroupTableLabel)
              await user.click(await within(transactionGroupTable).findByRole('button', { name: transactionActionsLabel }))
              await user.click(await component.findByRole('menuitem', { name: 'Edit' }))
              formDialog = component.getByRole('dialog')

              // Verify the existing values
              const wrapperDiv = await waitFor(() => getByText(formDialog, 'Argument 1').parentElement!)
              expect(await within(wrapperDiv).findByRole('combobox')).toHaveTextContent('True')

              // Update the values
              await setArgSelect(formDialog, user, 'Argument 1', 'False')

              // Save the transaction
              const updateButton = await waitFor(() => {
                const updateButton = within(formDialog).getByRole('button', { name: 'Update' })
                expect(updateButton).not.toBeDisabled()
                return updateButton!
              })
              await user.click(updateButton)

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
              expect(uint8ArrayToBase64(result.transaction.logs![0])).toBe('FR98dQA=')
            }
          )
        })
      })

      describe('when calling inner_pay_appl method', () => {
        let innerAppId: ApplicationId

        beforeEach(async () => {
          const testAccount2 = await localnet.context.generateAccount({ initialFunds: algo(10) })

          const { app: innerApp } = await deploySmartContract(
            testAccount2,
            localnet.algorand,
            myStore,
            Arc32TestContractAppSpec as AppSpec,
            {
              onUpdate: 'append',
            }
          )
          innerAppId = innerApp.appId
        })

        it('succeeds when all fields have been correctly supplied', async () => {
          const { testAccount } = localnet.context
          vi.mocked(useParams).mockImplementation(() => ({ applicationId: appId.toString() }))

          return executeComponentTest(
            () => {
              return render(<ApplicationPage />, undefined, myStore)
            },
            async (component, user) => {
              const methodPanel = await expandMethodAccordion(component, user, 'inner_pay_appl')

              // Call the method
              const callButton = await waitFor(() => {
                const callButton = within(methodPanel).getByRole('button', { name: 'Call' })
                expect(callButton).not.toBeDisabled()
                return callButton!
              })
              await user.click(callButton)
              const formDialog = component.getByRole('dialog')

              // Enter the inner app id
              const arg1Input = await getArgInput(formDialog, 'Argument 1')
              fireEvent.input(arg1Input, {
                target: { value: innerAppId.toString() },
              })

              await setCheckbox(formDialog, user, 'Set fee automatically', false)
              const feeInput = await within(formDialog).findByLabelText(/Fee/)
              fireEvent.input(feeInput, {
                target: { value: '0.003' },
              })

              // Save the transaction
              await user.click(within(formDialog).getByRole('button', { name: 'Add' }))

              // Populate resources
              const populateResourcesButton = await waitFor(() => {
                const populateResourcesButton = component.getByRole('button', { name: 'Populate Resources' })
                expect(populateResourcesButton).not.toBeDisabled()
                return populateResourcesButton!
              })
              await user.click(populateResourcesButton)

              // Send the transactions
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

              // Check the app call transaction
              const appCallTransactionId = await waitFor(
                () => {
                  const transactionLink = within(resultsDiv)
                    .getAllByRole('link')
                    .find((a) => a.getAttribute('href')?.startsWith('/localnet/transaction'))!
                  return transactionLink.getAttribute('href')!.split('/').pop()!
                },
                { timeout: 10_000 }
              )

              const appCallTransaction = await act(() => localnet.context.waitForIndexerTransaction(appCallTransactionId))
              expect(appCallTransaction.transaction.sender).toBe(testAccount.addr.toString())
              expect(uint8ArrayToBase64(appCallTransaction.transaction.logs![0])).toBe('FR98dQAAAAAAAYag')

              // This is a bit hacky, we traverse the DOM to find the inner app call method name
              // This is to verify that the abiMethod is resolved correctly for the inner app call
              const innerAppCallTxnLink = within(resultsDiv)
                .getAllByRole('link')
                .find((a) => a.getAttribute('href')?.startsWith(`/localnet/transaction/${appCallTransactionId}/inner/2`))
              expect(innerAppCallTxnLink?.parentElement?.parentElement?.parentElement?.nextSibling?.nextSibling?.textContent).toBe(
                '2App Callget_pay_txn_amount'
              )
            }
          )
        })
      })
    })
  })

  describe('test-arc56-app-spec', () => {
    let myStore: JotaiStore

    beforeEach(async () => {
      myStore = getTestStore()
      await setWalletAddressAndSigner(localnet)

      const { appId: _, ...params } = await asMethodCallParams({
        id: randomGuid(),
        applicationId: 1988n,
        type: BuildableTransactionType.MethodCall,
        appSpec: Arc56TestContractAppSpec as Arc56Contract,
        methodDefinition: asMethodDefinitions(Arc56TestContractAppSpec).find((m) => m.name === 'createApplication')!,
        onComplete: 0,
        methodArgs: [],
        sender: asAddressOrNfd(localnet.context.testAccount.addr.toString()),
        fee: {
          setAutomatically: true,
        },
        validRounds: {
          setAutomatically: true,
        },
      })

      const { app } = await deploySmartContract(
        localnet.context.testAccount,
        localnet.algorand,
        myStore,
        Arc56TestContractAppSpec as Arc56Contract,
        {
          createParams: {
            ...params,
            method: params.method.name,
            onComplete: params.onComplete,
            schema: {
              localInts: Arc56TestContractAppSpec.state.schema.local.ints ?? 0,
              localByteSlices: Arc56TestContractAppSpec.state.schema.local.bytes ?? 0,
              globalInts: Arc56TestContractAppSpec.state.schema.global.ints ?? 0,
              globalByteSlices: Arc56TestContractAppSpec.state.schema.global.bytes ?? 0,
            },
          },
          onUpdate: 'append',
          onSchemaBreak: 'append',
          deployTimeParams: {
            someNumber: 1000,
          },
          populateAppCallResources: true,
        }
      )
      appId = app.appId
    })

    describe('when a wallet is connected', () => {
      beforeEach(async () => {
        await setWalletAddressAndSigner(localnet)
      })

      describe('when calling foo method', () => {
        it('succeeds when the input is supplied', async () => {
          const { testAccount } = localnet.context
          vi.mocked(useParams).mockImplementation(() => ({ applicationId: appId.toString() }))

          return executeComponentTest(
            () => {
              return render(<ApplicationPage />, undefined, myStore)
            },
            async (component, user) => {
              const methodPanel = await expandMethodAccordion(component, user, 'foo')

              // Call the method
              const callButton = await waitFor(() => {
                const callButton = within(methodPanel).getByRole('button', { name: 'Call' })
                expect(callButton).not.toBeDisabled()
                return callButton!
              })
              await user.click(callButton)
              const formDialog = component.getByRole('dialog')

              // Input
              fireEvent.input(await getStructArgInput(formDialog, 'Argument 1', ['add', 'a']), {
                target: { value: '1' },
              })
              fireEvent.input(await getStructArgInput(formDialog, 'Argument 1', ['add', 'b']), {
                target: { value: '2' },
              })
              fireEvent.input(await getStructArgInput(formDialog, 'Argument 1', ['subtract', 'a']), {
                target: { value: '5' },
              })
              fireEvent.input(await getStructArgInput(formDialog, 'Argument 1', ['subtract', 'b']), {
                target: { value: '3' },
              })

              // Save the transaction
              const addButton = await waitFor(() => {
                const addButton = within(formDialog).getByRole('button', { name: 'Add' })
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
              expect(uint8ArrayToBase64(result.transaction.logs![0])).toBe('FR98dQAAAAAAAAADAAAAAAAAAAI=')
            }
          )
        })

        it('allows edit', async () => {
          const { testAccount } = localnet.context
          vi.mocked(useParams).mockImplementation(() => ({ applicationId: appId.toString() }))

          return executeComponentTest(
            () => {
              return render(<ApplicationPage />, undefined, myStore)
            },
            async (component, user) => {
              const methodPanel = await expandMethodAccordion(component, user, 'foo')

              // Call the method
              const callButton = await waitFor(() => {
                const callButton = within(methodPanel).getByRole('button', { name: 'Call' })
                expect(callButton).not.toBeDisabled()
                return callButton!
              })
              await user.click(callButton)
              let formDialog = component.getByRole('dialog')

              // Input
              fireEvent.input(await getStructArgInput(formDialog, 'Argument 1', ['add', 'a']), {
                target: { value: '1' },
              })
              fireEvent.input(await getStructArgInput(formDialog, 'Argument 1', ['add', 'b']), {
                target: { value: '2' },
              })
              fireEvent.input(await getStructArgInput(formDialog, 'Argument 1', ['subtract', 'a']), {
                target: { value: '5' },
              })
              fireEvent.input(await getStructArgInput(formDialog, 'Argument 1', ['subtract', 'b']), {
                target: { value: '3' },
              })

              // Save the transaction
              const addButton = await waitFor(() => {
                const addButton = within(formDialog).getByRole('button', { name: 'Add' })
                expect(addButton).not.toBeDisabled()
                return addButton!
              })
              await user.click(addButton)
              await waitFor(() => {
                expect(component.queryByRole('dialog')).not.toBeInTheDocument()
              })

              // Edit the transaction
              const transactionGroupTable = await within(methodPanel).findByLabelText(transactionGroupTableLabel)
              await user.click(await within(transactionGroupTable).findByRole('button', { name: transactionActionsLabel }))
              await user.click(await component.findByRole('menuitem', { name: 'Edit' }))
              formDialog = component.getByRole('dialog')

              // Verify the existing values
              expect(await getStructArgInput(formDialog, 'Argument 1', ['add', 'a'])).toHaveValue('1')
              expect(await getStructArgInput(formDialog, 'Argument 1', ['add', 'b'])).toHaveValue('2')
              expect(await getStructArgInput(formDialog, 'Argument 1', ['subtract', 'a'])).toHaveValue('5')
              expect(await getStructArgInput(formDialog, 'Argument 1', ['subtract', 'b'])).toHaveValue('3')

              // Update the values
              fireEvent.input(await getStructArgInput(formDialog, 'Argument 1', ['add', 'a']), {
                target: { value: '2' },
              })
              fireEvent.input(await getStructArgInput(formDialog, 'Argument 1', ['add', 'b']), {
                target: { value: '4' },
              })
              fireEvent.input(await getStructArgInput(formDialog, 'Argument 1', ['subtract', 'a']), {
                target: { value: '10' },
              })
              fireEvent.input(await getStructArgInput(formDialog, 'Argument 1', ['subtract', 'b']), {
                target: { value: '8' },
              })

              // Save the transaction
              const updateButton = await waitFor(() => {
                const updateButton = within(formDialog).getByRole('button', { name: 'Update' })
                expect(updateButton).not.toBeDisabled()
                return updateButton!
              })
              await user.click(updateButton)

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
              expect(uint8ArrayToBase64(result.transaction.logs![0])).toBe('FR98dQAAAAAAAAAGAAAAAAAAAAI=')
            }
          )
        })
      })
    })
  })
})

const setArgSelect = async (parentComponent: HTMLElement, user: UserEvent, argName: string, value: string) => {
  const wrapperDiv = await waitFor(() => getByText(parentComponent, argName).parentElement!)
  await selectOption(wrapperDiv, user, /Value/, value)
}

const getArgInput = async (parentComponent: HTMLElement, argName: string) => {
  const wrapperDiv = await waitFor(() => getByText(parentComponent, argName).parentElement!)
  return within(wrapperDiv).getByLabelText(/Value/)
}

const getStaticArrayArgInput = async (parentComponent: HTMLElement, argName: string, index: number) => {
  const argDiv = await waitFor(() => getByText(parentComponent, argName).parentElement!)
  const itemDiv = within(argDiv).getByText(`Item ${index + 1}`).parentElement!
  return within(itemDiv).getByLabelText(/Value/)
}

const getDynamicArrayArgInput = async (parentComponent: HTMLElement, argName: string, itemName: string) => {
  const argDiv = await waitFor(() => getByText(parentComponent, argName).parentElement!)
  const itemDiv = within(argDiv).getByText(itemName).parentElement!.parentElement!
  return within(itemDiv).getByLabelText(/Value/)
}

const getTupleArgInput = async (parentComponent: HTMLElement, argName: string, itemName: string) => {
  const argDiv = await waitFor(() => getByText(parentComponent, argName).parentElement!)
  const itemDiv = within(argDiv).getByText(itemName).parentElement!
  return within(itemDiv).getByLabelText(/Value/)
}

const addItemIntoDynamicArray = async (parentComponent: HTMLElement, user: UserEvent, argName: string, itemName?: string) => {
  const wrapperDiv = await waitFor(() => getByText(parentComponent, argName).parentElement!)
  if (!itemName) {
    const addButtons = within(wrapperDiv).queryAllByRole('button', { name: 'Add item' })
    // Nested array can have multiple add buttons, so we need to click the last one
    await user.click(addButtons[addButtons.length - 1])
  } else {
    const itemDiv = within(wrapperDiv).getByText(itemName).parentElement!.parentElement!
    const addButton = within(itemDiv).getByRole('button', { name: 'Add item' })
    await user.click(addButton)
  }
}

const expandMethodAccordion = async (component: RenderResult, user: UserEvent, methodName: string) => {
  const accordionTrigger = await component.findByRole('button', { name: methodName })
  await user.click(accordionTrigger)
  return component.getByRole('region', { name: methodName })
}

const getStructArgInput = async (parentComponent: HTMLElement, argName: string, path: string[]) => {
  const argDiv = await waitFor(() => getByText(parentComponent, argName).parentElement!)

  let fieldDiv = argDiv
  path.forEach((field) => {
    fieldDiv = getByText(fieldDiv, field).parentElement!
  })

  return within(fieldDiv).getByLabelText(/Value/)
}

const setCheckbox = async (parentComponent: HTMLElement, user: UserEvent, label: string, checked: boolean) => {
  const wrapperDiv = within(parentComponent).getByLabelText(label).parentElement!
  const btn = within(wrapperDiv).getByRole('checkbox')
  const isChecked = btn.getAttribute('aria-checked') === 'true'
  if (isChecked !== checked) {
    await user.click(btn)
  }
}
