import { afterEach, beforeEach, describe, expect, it, vitest } from 'vitest'
import { executeComponentTest } from '@/tests/test-component'
import SampleSixAppSpec from '@/tests/test-app-specs/sample-six.arc32.json'
import { fireEvent, getByLabelText, getByText, render, waitFor } from '@/tests/testing-library'
import { Arc32AppSpec } from '../data/types'
import { deployAppLabel, deployButtonLabel } from '@/features/app-interfaces/components/labels'
import { algorandFixture } from '@algorandfoundation/algokit-utils/testing'
import { CreateAppInterfaceDialogBody } from '@/features/app-interfaces/components/create-app-interface-dialog-body'
import { selectOption } from '@/tests/utils/select-option'
import { setWalletAddressAndSigner } from '@/tests/utils/set-wallet-address-and-signer'

describe('create-app-interface-dialog-body', () => {
  const localnet = algorandFixture()
  beforeEach(localnet.beforeEach, 10e6)
  afterEach(() => {
    vitest.clearAllMocks()
  })

  describe('when deploying an app spec that requires template parameters', () => {
    const appSpec = SampleSixAppSpec as Arc32AppSpec

    beforeEach(async () => {
      await setWalletAddressAndSigner(localnet)
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
            const errorMessage = component.queryByRole('alert', { name: 'error-message' })
            expect(errorMessage).toBeNull()
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

const findParentDiv = async (component: HTMLElement, label: string) => {
  return await waitFor(() => {
    const div = getByText(component, label)
    return div.parentElement!
  })
}
