import { executeComponentTest } from '@/tests/test-component'
import { fireEvent, getByLabelText, getByText, render, RenderResult, waitFor } from '@/tests/testing-library'
import { setWalletAddressAndSigner } from '@/tests/utils/set-wallet-address-and-signer'
import { algorandFixture } from '@algorandfoundation/algokit-utils/testing'
import { afterEach, beforeEach, describe, expect, it, vi, vitest } from 'vitest'
import { CreateAppInterface } from './create-app-interface'
import { deployAppLabel } from '../components/labels'
import { useWallet } from '@txnlab/use-wallet'
import SampleSixAppSpec from '@/tests/test-app-specs/sample-six.arc32.json'
import { Arc32AppSpec } from '../data/types'
import { selectOption } from '@/tests/utils/select-option'

describe('create-app-interface', () => {
  const localnet = algorandFixture()
  beforeEach(localnet.beforeEach, 10e6)
  afterEach(() => {
    vitest.clearAllMocks()
  })

  describe('when a wallet is connected', () => {
    beforeEach(async () => {
      await setWalletAddressAndSigner(localnet)
    })

    it('the button to deploy the app is enabled', () => {
      return executeComponentTest(
        () => {
          return render(<CreateAppInterface />)
        },
        async (component) => {
          await waitFor(() => {
            const deployAppButton = component.getByRole('button', { name: deployAppLabel })
            expect(deployAppButton).toBeEnabled()
          })
        }
      )
    })

    it('can deploy an app with template parameters', () => {
      const appSpec = SampleSixAppSpec as Arc32AppSpec
      return executeComponentTest(
        () => {
          return render(<CreateAppInterface />)
        },
        async (component, user) => {
          const deployAppButton = await getButton(component, deployAppLabel)
          await user.click(deployAppButton)

          const appSpecFileInput = await component.findByLabelText(/JSON app spec file/)
          await user.upload(appSpecFileInput, new File([JSON.stringify(appSpec)], 'app.json', { type: 'application/json' }))

          const uploadAppSpecButton = await getButton(component, 'Next')
          await user.click(uploadAppSpecButton)

          const versionInput = await waitFor(() => {
            const input = component.getByLabelText(/Version/)
            expect(input).toBeDefined()
            return input!
          })
          fireEvent.input(versionInput, {
            target: { value: '1.2.0' },
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

          const completeAppDetailsButton = await getButton(component, 'Next')
          await user.click(completeAppDetailsButton)

          const bareCall = await getButton(component, 'Call')
          await user.click(bareCall)

          const addTransactionButton = await getButton(component, 'Add')
          await user.click(addTransactionButton)

          const deployButton = await getButton(component, 'Deploy')
          await user.click(deployButton)

          await waitFor(() => {
            const errorMessage = component.queryByRole('alert', { name: 'error-message' })
            expect(errorMessage).toBeNull()
          })
        }
      )
    })
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

    it('the button to deploy the app is disabled', () => {
      return executeComponentTest(
        () => {
          return render(<CreateAppInterface />)
        },
        async (component) => {
          await waitFor(() => {
            const deployAppButton = component.getByRole('button', { name: deployAppLabel })
            expect(deployAppButton).toBeDisabled()
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

const getButton = async (component: RenderResult, label: string) => {
  return await waitFor(() => {
    const button = component.getByRole('button', { name: label })
    expect(button).toBeDefined()
    return button
  })
}
