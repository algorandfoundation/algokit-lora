import { afterEach, beforeEach, describe, expect, it, vi, vitest } from 'vitest'

import { useWallet } from '@txnlab/use-wallet'
import { executeComponentTest } from '@/tests/test-component'
import SampleSixAppSpec from '@/tests/test-app-specs/sample-six.arc32.json'
import { fireEvent, getByLabelText, getByText, render, waitFor, screen, getByRole } from '@/tests/testing-library'
import { Arc32AppSpec } from '../data/types'
import { UserEvent } from '@testing-library/user-event'
import { deployAppLabel, deployButtonLabel } from '@/features/app-interfaces/components/labels'
import { algorandFixture } from '@algorandfoundation/algokit-utils/testing'
import { CreateAppInterfaceDialogBody } from '@/features/app-interfaces/components/create-app-interface-dialog-body'
import { AlgorandFixture } from '@algorandfoundation/algokit-utils/types/testing'

describe('create-app-interface-dialog-body', () => {
  const localnet = algorandFixture()
  beforeEach(localnet.beforeEach, 10e6)
  afterEach(() => {
    vitest.clearAllMocks()
  })

  describe('when deploying an app spec that requires template parameters', () => {
    const appSpec = SampleSixAppSpec as Arc32AppSpec

    beforeEach(async () => {
      await setWalletAddress(localnet)
    })

    it('succeeds when all fields have been correctly supplied', () => {
      return executeComponentTest(
        () => {
          return render(<CreateAppInterfaceDialogBody onSuccess={() => {}} />)
        },
        async (component, user) => {
          const appSpecFileInput = await component.findByLabelText(/JSON app spec file/)
          await user.upload(appSpecFileInput, new File([JSON.stringify(appSpec)], 'app.json', { type: 'application/json' }))

          const deployAppButton = await waitFor(() => {
            const button = component.getByRole('button', { name: deployAppLabel })
            expect(button).toBeDefined()
            expect(button).not.toBeDisabled()
            return button!
          })
          await user.click(deployAppButton)

          const versionInput = await waitFor(() => {
            const input = component.getByLabelText(/Version/)
            expect(input).toBeDefined()
            return input!
          })
          fireEvent.input(versionInput, {
            target: { value: '1.0.0' },
          })

          await selectOption(component.container, user, /On Update/, 'Fail')
          await selectOption(component.container, user, /On Schema Break/, 'Fail')

          const someStringTemplateParamDiv = await findParentDiv(component.container, 'SOME_STRING')
          await selectOption(someStringTemplateParamDiv, user, /Type/, 'String')
          const someStringInput = getByLabelText(someStringTemplateParamDiv, /Value/)
          fireEvent.input(someStringInput, {
            target: { value: 'some-string' },
          })

          const someBytesTemplateParamDiv = await findParentDiv(component.container, 'SOME_BYTES')
          await selectOption(someBytesTemplateParamDiv, user, /Type/, 'Uint8Array')
          const someBytesInput = getByLabelText(someBytesTemplateParamDiv!, /Value/)
          fireEvent.input(someBytesInput, {
            target: { value: 'AQIDBA==' },
          })

          const someNumberTemplateParamDiv = await findParentDiv(component.container, 'SOME_NUMBER')
          await selectOption(someNumberTemplateParamDiv, user, /Type/, 'Number')
          const someNumberInput = getByLabelText(someNumberTemplateParamDiv!, /Value/)
          fireEvent.input(someNumberInput, {
            target: { value: '3' },
          })

          const deployButton = await waitFor(() => {
            const button = component.queryByRole('button', { name: deployButtonLabel })
            expect(button).toBeDefined()
            return button!
          })
          await user.click(deployButton)

          await waitFor(() => {
            const requiredValidationMessages = component.queryAllByText('Required')
            expect(requiredValidationMessages.length).toBe(0)
          })

          await waitFor(() => {
            const input = component.getByLabelText(/Application ID/)
            expect(input).toBeDefined()
            expect(input).toHaveValue()
            return input!
          })
        }
      )
    })
  })
})

const setWalletAddress = async (localnet: AlgorandFixture) => {
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
}

// TODO: refactor this out
const findParentDiv = async (component: HTMLElement, label: string) => {
  return await waitFor(() => {
    const div = getByText(component, label)
    return div.parentElement!
  })
}

const selectOption = async (parentComponent: HTMLElement, user: UserEvent, name: string | RegExp, value: string) => {
  const select = await waitFor(() => {
    const select = getByRole(parentComponent, 'combobox', { name: name })
    expect(select).toBeDefined()
    return select!
  })
  await user.click(select)

  const option = await waitFor(() => {
    return screen.getByRole('option', { name: value })
  })
  await user.click(option)
}
