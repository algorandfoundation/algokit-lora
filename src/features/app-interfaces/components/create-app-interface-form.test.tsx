import { afterEach, beforeEach, describe, expect, it, vi, vitest } from 'vitest'
import { algorandFixture } from '@algorandfoundation/algokit-utils/testing'
import SampleSixAppSpec from '@/tests/test-app-specs/sample-six.arc32.json'
import { Arc32AppSpec } from '@/features/app-interfaces/data/types'
import { executeComponentTest } from '@/tests/test-component'
import { render, waitFor } from '@/tests/testing-library'
import { CreateAppInterfaceForm } from '@/features/app-interfaces/components/create-app-interface-form'
import { deployAppLabel } from '@/features/app-interfaces/components/labels'
import { setWalletAddressAndSigner } from '@/tests/utils/set-wallet-address-and-signer'
import { useWallet } from '@txnlab/use-wallet'

describe('create-app-interface-form', () => {
  const appSpec = SampleSixAppSpec as Arc32AppSpec

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
          return render(<CreateAppInterfaceForm appSpec={appSpec} appSpecFile={new File([], 'app.json')} onSuccess={() => {}} />)
        },
        async (component) => {
          await waitFor(() => {
            const deployAppButton = component.getByRole('button', { name: deployAppLabel })
            expect(deployAppButton).toBeEnabled()
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
          return render(<CreateAppInterfaceForm appSpec={appSpec} appSpecFile={new File([], 'app.json')} onSuccess={() => {}} />)
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
