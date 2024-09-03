import { afterEach, beforeEach, describe, expect, it, vi, vitest } from 'vitest'
import { algorandFixture } from '@algorandfoundation/algokit-utils/testing'
import { useWallet } from '@txnlab/use-wallet'
import { executeComponentTest } from '@/tests/test-component'
import SampleSixAppSpec from '@/tests/test-app-specs/sample-six.arc32.json'
import { fireEvent, render } from '@/tests/testing-library'
import { DeployAppForm, deployButtonLabel } from '@/features/app-interfaces/components/deploy-app-form'
import { findByLabelText, getByLabelText, getByRole, queryByLabelText, renderHook, waitFor } from '@testing-library/react'
import { Arc32AppSpec } from '../data/types'
import { algo } from '@algorandfoundation/algokit-utils'
import { getByDescriptionTerm } from '@/tests/custom-queries/get-description'
import { transactionIdLabel } from '@/features/transactions/components/transaction-info'
import { UserEvent } from '@testing-library/user-event'
import { localnetId, useSetSelectedNetwork } from '@/features/network/data'

describe('deploy-app-form', () => {
  const localnet = algorandFixture()
  beforeEach(localnet.beforeEach, 10e6)
  afterEach(() => {
    vitest.clearAllMocks()
  })

  beforeEach(async () => {
    const { testAccount } = localnet.context
    const original = await vi.importActual<{ useWallet: () => ReturnType<typeof useWallet> }>('@txnlab/use-wallet')
    vi.mocked(useWallet).mockImplementation(() => {
      return {
        ...original.useWallet(),
        activeAddress: testAccount.addr,
        signer: testAccount.signer,
        status: 'active',
        isActive: true,
        isReady: true,
      }
    })
  })

  describe('when the app spec requires template parameters', () => {
    const { testAccount } = localnet.context
    const appSpec = SampleSixAppSpec as Arc32AppSpec

    renderHook(async () => {
      const setSelectedNetwork = useSetSelectedNetwork()
      await setSelectedNetwork(localnetId)
    })

    it('succeeds when all fields have been correctly supplied', async () => {
      await executeComponentTest(
        () => {
          return render(<DeployAppForm appSpec={appSpec} />)
        },
        async (component, user) => {
          const deployButton = await waitFor(() => {
            const deployButton = component.getByRole('button', { name: deployButtonLabel })
            expect(deployButton).toBeDefined()
            return deployButton!
          })

          const versionInput = await component.findByLabelText(/Version/)
          fireEvent.input(versionInput, {
            target: { value: '1.0.0' },
          })

          await selectOption(component.container, user, 'On Update', 'Fail')
          await selectOption(component.container, user, 'On Schema Break', 'Fail')

          const someStringTemplateParamDiv = await findParentDiv(component.container, 'SOME_STRING')
          await selectOption(someStringTemplateParamDiv!, user, 'Type', 'String')
          const someStringInput = getByLabelText(someStringTemplateParamDiv!, 'Value')
          fireEvent.input(someStringInput, {
            target: { value: 'some-string' },
          })

          const someBytesTemplateParamDiv = await findParentDiv(component.container, 'SOME_BYTES')
          await selectOption(someBytesTemplateParamDiv!, user, 'Type', 'Uint8Array')
          const someBytesInput = getByLabelText(someBytesTemplateParamDiv!, 'Value')
          fireEvent.input(someBytesInput, {
            target: { value: 'AQIDBA==' },
          })

          const someNumberTemplateParamDiv = await findParentDiv(component.container, 'SOME_NUMBER')
          await selectOption(someNumberTemplateParamDiv!, user, 'Type', 'Number')
          const someNumberInput = getByLabelText(someNumberTemplateParamDiv!, 'Value')
          fireEvent.input(someNumberInput, {
            target: { value: '3' },
          })

          await user.click(deployButton)

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
})

const findParentDiv = async (component: HTMLElement, label: string) => {
  return await waitFor(() => {
    const div = getByLabelText(component, label)
    return div.parentElement
  })
}

const selectOption = async (component: HTMLElement, user: UserEvent, name: string, value: string) => {
  const select = await waitFor(() => {
    const select = getByRole(component, 'combobox', { name })
    expect(select).toBeDefined()
    return select!
  })
  await user.click(select)

  const option = await waitFor(() => {
    return getByRole(component, 'option', { name: value })
  })
  await user.click(option)
}
