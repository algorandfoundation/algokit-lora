import { setWalletAddressAndSigner } from '@/tests/utils/set-wallet-address-and-signer'
import { algorandFixture } from '@algorandfoundation/algokit-utils/testing'
import { afterEach, beforeEach, describe, expect, it, vi, vitest } from 'vitest'
import { ApplicationId } from '../data/types'
import TestContractAppSpec from '@/tests/test-app-specs/test-contract.arc32.json'
import { deploySmartContract } from '@/tests/utils/deploy-smart-contract'
import { AppSpec } from '@algorandfoundation/algokit-utils/types/app-spec'
import { AppInterfaceEntity, dbConnectionAtom } from '@/features/common/data/indexed-db'
import { writeAppInterface } from '@/features/app-interfaces/data'
import { AppSpecStandard, Arc32AppSpec } from '@/features/app-interfaces/data/types'
import { createTimestamp } from '@/features/common/data'
import { ApplicationPage } from '../pages/application-page'
import { executeComponentTest } from '@/tests/test-component'
import { useParams } from 'react-router-dom'
import { fireEvent, getByText, render, RenderResult, waitFor, within } from '@/tests/testing-library'
import { UserEvent } from '@testing-library/user-event'
import { sendButtonLabel } from '@/features/transaction-wizard/components/transactions-builder'
import { algo } from '@algorandfoundation/algokit-utils'
import { transactionActionsLabel, transactionGroupTableLabel } from '@/features/transaction-wizard/components/labels'
import { selectOption } from '@/tests/utils/select-option'
import { groupSendResultsLabel } from '@/features/transaction-wizard/components/group-send-results'

const myStore = await vi.hoisted(async () => {
  const { getDefaultStore } = await import('jotai/index')
  return getDefaultStore()
})

describe('application-method-definitions', () => {
  const localnet = algorandFixture()
  let appId: ApplicationId

  beforeEach(localnet.beforeEach, 10e6)
  afterEach(() => {
    vitest.clearAllMocks()
  })

  beforeEach(async () => {
    await setWalletAddressAndSigner(localnet)
    const { app } = await deploySmartContract(localnet, TestContractAppSpec as AppSpec)
    appId = Number(app.appId)

    const dbConnection = await myStore.get(dbConnectionAtom)
    await writeAppInterface(dbConnection, {
      applicationId: appId,
      name: 'test',
      appSpecVersions: [
        {
          standard: AppSpecStandard.ARC32,
          appSpec: TestContractAppSpec as unknown as Arc32AppSpec,
        },
      ],
      lastModified: createTimestamp(),
    } satisfies AppInterfaceEntity)
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
            return render(<ApplicationPage />)
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
            expect(result.transaction.sender).toBe(testAccount.addr)
            expect(result.transaction['logs']!).toMatchInlineSnapshot(`
              [
                "FR98dQAAAAAAAAAD",
              ]
            `)
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

            // Edit the transaction
            const transactionGroupTable = await waitFor(() => within(addMethodPanel).getByLabelText(transactionGroupTableLabel))
            await user.click(await waitFor(() => within(transactionGroupTable).getByRole('button', { name: transactionActionsLabel })))
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
            expect(result.transaction.sender).toBe(testAccount.addr)
            expect(result.transaction['logs']!).toMatchInlineSnapshot(`
              [
                "FR98dQACAgI=",
              ]
            `)
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
            expect(paymentTransaction.transaction.sender).toBe(testAccount.addr)
            expect(paymentTransaction.transaction['payment-transaction']!).toMatchInlineSnapshot(`
                {
                  "amount": 500000,
                  "close-amount": 0,
                  "receiver": "${testAccount2.addr}",
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
            expect(appCallTransaction.transaction.sender).toBe(testAccount.addr)
            expect(appCallTransaction.transaction['logs']!).toMatchInlineSnapshot(`
                [
                  "FR98dQAAAAAAB6Eg",
                ]
              `)
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

            // Edit the payment transaction
            transactionGroupTable = await waitFor(() => within(addMethodPanel).getByLabelText(transactionGroupTableLabel))
            firstBodyRow = within(transactionGroupTable).getAllByRole('row')[1]
            await user.click(await waitFor(() => within(firstBodyRow).getByRole('button', { name: transactionActionsLabel })))
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
            expect(paymentTransaction.transaction.sender).toBe(testAccount.addr)
            expect(paymentTransaction.transaction['payment-transaction']!).toMatchInlineSnapshot(`
                {
                  "amount": 600000,
                  "close-amount": 0,
                  "receiver": "${testAccount2.addr}",
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
            expect(appCallTransaction.transaction.sender).toBe(testAccount.addr)
            expect(appCallTransaction.transaction['logs']!).toMatchInlineSnapshot(`
                [
                  "FR98dQAAAAAACSfA",
                ]
              `)
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

            // Edit the app call transaction
            transactionGroupTable = await waitFor(() => within(addMethodPanel).getByLabelText(transactionGroupTableLabel))
            firstBodyRow = within(transactionGroupTable).getAllByRole('row')[2]
            await user.click(await waitFor(() => within(firstBodyRow).getByRole('button', { name: transactionActionsLabel })))
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
            expect(paymentTransaction.transaction.sender).toBe(testAccount.addr)
            expect(paymentTransaction.transaction['payment-transaction']!).toMatchInlineSnapshot(`
                {
                  "amount": 500000,
                  "close-amount": 0,
                  "receiver": "${testAccount2.addr}",
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
            expect(appCallTransaction.transaction.sender).toBe(testAccount.addr)
            expect(appCallTransaction.transaction.note).toBe('aGVsbG8gd29ybGQh')
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

            // Edit the app call transaction
            transactionGroupTable = await waitFor(() => within(addMethodPanel).getByLabelText(transactionGroupTableLabel))
            firstBodyRow = within(transactionGroupTable).getAllByRole('row')[2]
            await user.click(await waitFor(() => within(firstBodyRow).getByRole('button', { name: transactionActionsLabel })))
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
            expect(result.transaction.sender).toBe(testAccount.addr)
            expect(result.transaction['logs']!).toMatchInlineSnapshot(`
              [
                "FR98dQABAQ==",
              ]
            `)
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

            // Edit the transaction
            const transactionGroupTable = await waitFor(() => within(echoBytesPanel).getByLabelText(transactionGroupTableLabel))
            await user.click(await waitFor(() => within(transactionGroupTable).getByRole('button', { name: transactionActionsLabel })))
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
            expect(result.transaction.sender).toBe(testAccount.addr)
            expect(result.transaction['logs']!).toMatchInlineSnapshot(`
              [
                "FR98dQACAgI=",
              ]
            `)
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
            expect(result.transaction.sender).toBe(testAccount.addr)
            expect(result.transaction['logs']!).toMatchInlineSnapshot(`
              [
                "FR98dQAAAAAAAAABAAAAAAAAAAIAAAAAAAAAAwAAAAAAAAAE",
              ]
            `)
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

            // Edit the transaction
            const transactionGroupTable = await waitFor(() => within(echoArrayPanel).getByLabelText(transactionGroupTableLabel))
            await user.click(await waitFor(() => within(transactionGroupTable).getByRole('button', { name: transactionActionsLabel })))
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
            expect(result.transaction.sender).toBe(testAccount.addr)
            expect(result.transaction['logs']!).toMatchInlineSnapshot(`
              [
                "FR98dQAAAAAAAAABAAAAAAAAAAIAAAAAAAAAAwAAAAAAAAAs",
              ]
            `)
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
            expect(result.transaction.sender).toBe(testAccount.addr)
            expect(result.transaction['logs']!).toMatchInlineSnapshot(`
              [
                "FR98dQADAAAAAAAAAAEAAAAAAAAAAgAAAAAAAAAD",
              ]
            `)
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

            // Edit the transaction
            const transactionGroupTable = await waitFor(() => within(echoDynamicArrayPanel).getByLabelText(transactionGroupTableLabel))
            await user.click(await waitFor(() => within(transactionGroupTable).getByRole('button', { name: transactionActionsLabel })))
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
            expect(result.transaction.sender).toBe(testAccount.addr)
            expect(result.transaction['logs']!).toMatchInlineSnapshot(`
              [
                "FR98dQAEAAAAAAAAAAEAAAAAAAAAAgAAAAAAAAADAAAAAAAAAAQ=",
              ]
            `)
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
            expect(result.transaction.sender).toBe(testAccount.addr)
            expect(result.transaction['logs']!).toMatchInlineSnapshot(`
              [
                "FR98dQAEAC4AAgAEABYAAgAAAAAAAAABAAAAAAAAAAIAAgAAAAAAAAADAAAAAAAAAAQABAAWAAIAAAAAAAAABQAAAAAAAAAGAAVIZWxsbw==",
              ]
            `)
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

            // Edit the transaction
            const transactionGroupTable = await within(methodPanel).findByLabelText(transactionGroupTableLabel)
            await user.click(await waitFor(() => within(transactionGroupTable).getByRole('button', { name: transactionActionsLabel })))
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
            expect(result.transaction.sender).toBe(testAccount.addr)
            expect(result.transaction['logs']!).toMatchInlineSnapshot(`
              [
                "FR98dQAEAD4AAgAEAB4AAwAAAAAAAAABAAAAAAAAAAIAAAAAAAAACwADAAAAAAAAAAMAAAAAAAAABAAAAAAAAAAWAAQAHgADAAAAAAAAAAUAAAAAAAAABgAAAAAAAAAhAAVIZWxsbw==",
              ]
            `)
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
            expect(result.transaction.sender).toBe(testAccount.addr)
            expect(result.transaction['logs']!).toMatchInlineSnapshot(`
              [
                "FR98dYA=",
              ]
            `)
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

            // Edit the transaction
            const transactionGroupTable = await within(methodPanel).findByLabelText(transactionGroupTableLabel)
            await user.click(await waitFor(() => within(transactionGroupTable).getByRole('button', { name: transactionActionsLabel })))
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
            expect(result.transaction.sender).toBe(testAccount.addr)
            expect(result.transaction['logs']!).toMatchInlineSnapshot(`
              [
                "FR98dQA=",
              ]
            `)
          }
        )
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
  return waitFor(async () => {
    const accordionTrigger = component.getByRole('button', { name: methodName })
    await user.click(accordionTrigger)

    return component.getByRole('region', { name: methodName })
  })
}
