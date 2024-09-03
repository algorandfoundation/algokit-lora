import { afterEach, beforeEach, describe, expect, it, vi, vitest } from 'vitest'
import { algorandFixture } from '@algorandfoundation/algokit-utils/testing'
import { useWallet } from '@txnlab/use-wallet'
import { executeComponentTest } from '@/tests/test-component'
import SampleSixAppSpec from '@/tests/test-app-specs/sample-six.arc32.json'
import { fireEvent, render } from '@/tests/testing-library'
import { DeployAppForm } from '@/features/app-interfaces/components/deploy-app-form'
import { getByLabelText, getByRole, getByText, renderHook, waitFor } from '@testing-library/react'
import { Arc32AppSpec } from '../data/types'
import { UserEvent } from '@testing-library/user-event'
import { createAppInterfaceMachineAtom } from '@/features/app-interfaces/data'
import { deployButtonLabel } from '@/features/app-interfaces/components/labels'
import { createStore } from 'jotai'
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
    const appSpec = SampleSixAppSpec as Arc32AppSpec
    const myStore = createStore()

    // beforeEach(() => {
    //   send({ type: 'fileSelected', appSpec: appSpec, file: new File([], 'sample-six.arc32.json') })
    // })

    it('succeeds when all fields have been correctly supplied', () => {
      renderHook(async () => {
        const setSelectedNetwork = useSetSelectedNetwork()
        await setSelectedNetwork(localnetId)
      })

      return executeComponentTest(
        () => {
          return render(<DeployAppForm appSpec={appSpec} />, undefined, myStore)
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

          await selectOption(component.baseElement, component.container, user, /On Update/, 'Fail')
          await selectOption(component.baseElement, component.container, user, /On Schema Break/, 'Fail')

          const someStringTemplateParamDiv = await findParentDiv(component.baseElement, 'SOME_STRING')
          await selectOption(component.baseElement, someStringTemplateParamDiv, user, /Type/, 'String')
          const someStringInput = getByLabelText(someStringTemplateParamDiv, /Value/)
          fireEvent.input(someStringInput, {
            target: { value: 'some-string' },
          })

          const someBytesTemplateParamDiv = await findParentDiv(component.baseElement, 'SOME_BYTES')
          await selectOption(component.baseElement, someBytesTemplateParamDiv, user, /Type/, 'Uint8Array')
          const someBytesInput = getByLabelText(someBytesTemplateParamDiv!, /Value/)
          fireEvent.input(someBytesInput, {
            target: { value: 'AQIDBA==' },
          })

          const someNumberTemplateParamDiv = await findParentDiv(component.baseElement, 'SOME_NUMBER')
          await selectOption(component.baseElement, someNumberTemplateParamDiv, user, /Type/, 'Number')
          const someNumberInput = getByLabelText(someNumberTemplateParamDiv!, /Value/)
          fireEvent.input(someNumberInput, {
            target: { value: '3' },
          })

          await user.click(deployButton)

          await waitFor(() => {
            const requiredValidationMessages = component.queryAllByText('Required')
            expect(requiredValidationMessages.length).toBe(0)
          })

          await waitFor(
            () => {
              const snapshot = myStore.get(createAppInterfaceMachineAtom)
              expect(snapshot.context.applicationId).toBeDefined()
            },
            { timeout: 10_000 }
          )
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

const selectOption = async (baseElement: HTMLElement, component: HTMLElement, user: UserEvent, name: string | RegExp, value: string) => {
  const select = await waitFor(() => {
    const select = getByRole(component, 'combobox', { name: name })
    expect(select).toBeDefined()
    return select!
  })
  await user.click(select)

  const option = await waitFor(() => {
    return getByRole(baseElement, 'option', { name: value })
  })
  await user.click(option)
}
