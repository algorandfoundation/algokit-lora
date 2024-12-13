import Arc32TestContractAppSpec from '@/tests/test-app-specs/test-contract.arc32.json'
import { describe, beforeEach, it, vitest, afterEach, vi } from 'vitest'
import { algorandFixture } from '@algorandfoundation/algokit-utils/testing'
import { ApplicationId } from '../data/types'
import { deploySmartContract } from '@/tests/utils/deploy-smart-contract'
import { AppSpec } from '@algorandfoundation/algokit-utils/types/app-spec'
import { executeComponentTest } from '@/tests/test-component'
import { ApplicationPage } from './application-page'
import { useParams } from 'react-router-dom'
import { tableAssertion } from '@/tests/assertions/table-assertion'
import { applicationGlobalStateLabel } from '../components/labels'
import { render, waitFor } from '@/tests/testing-library'

describe('application-page on localnet', () => {
  describe('when the application that has a global state that is a big int', () => {
    const localnet = algorandFixture()
    let appId: ApplicationId

    beforeEach(() => {
      vitest.clearAllMocks()
    })

    beforeEach(localnet.beforeEach, 10e6)
    afterEach(() => {
      vitest.clearAllMocks()
    })

    beforeEach(async () => {
      const { app } = await deploySmartContract(localnet, Arc32TestContractAppSpec as AppSpec)
      appId = Number(app.appId)
    })

    it('should be rendered with the correct data', async () => {
      vi.mocked(useParams).mockImplementation(() => ({ applicationId: appId.toString() }))

      return executeComponentTest(
        () => {
          return render(<ApplicationPage />)
        },
        async (component) => {
          await waitFor(async () => {
            const globalStateTab = await component.findByRole('tabpanel', {
              name: applicationGlobalStateLabel,
            })
            await tableAssertion({
              container: globalStateTab,
              rows: [{ cells: ['global_state_big_int', 'Uint', '33399922244455501'] }],
            })
          })
        }
      )
    })
  })
})
