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

const myStore = await vi.hoisted(async () => {
  const { getDefaultStore } = await import('jotai/index')
  const myStore = getDefaultStore()
  return myStore
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

    describe('when calling an ABI method', () => {
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

              const addTransactionButton = await waitFor(() => {
                const addTransactionButton = within(addMethodPanel).getByRole('button', { name: 'Call' })
                expect(addTransactionButton).not.toBeDisabled()
                return addTransactionButton!
              })
              await user.click(addTransactionButton)

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
                  return component.getByText('Result').parentElement!
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
      })
    })
  })
})

const getArgInput = async (parentComponent: HTMLElement, argName: string) => {
  const wrapperDiv = await waitFor(() => getByText(parentComponent, argName).parentElement!)
  return within(wrapperDiv).getByLabelText(/Value/)
}

const expandMethodAccordion = async (component: RenderResult, user: UserEvent, methodName: string) => {
  return waitFor(async () => {
    const accordionTrigger = component.getByRole('button', { name: methodName })
    await user.click(accordionTrigger)

    const accordionPanel = component.getByRole('region', { name: methodName })
    return accordionPanel
  })
}
