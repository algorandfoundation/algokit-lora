import Arc32TestContractAppSpec from '@/tests/test-app-specs/test-contract.arc32.json'
import { describe, beforeEach, it, vitest, afterEach, vi, expect } from 'vitest'
import { algorandFixture } from '@algorandfoundation/algokit-utils/testing'
import { ApplicationId } from '../data/types'
import { deploySmartContract } from '@/tests/utils/deploy-smart-contract'
import { AppSpec } from '@algorandfoundation/algokit-utils/types/app-spec'
import { executeComponentTest } from '@/tests/test-component'
import { ApplicationPage } from './application-page'
import { useParams } from 'react-router-dom'
import { tableAssertion } from '@/tests/assertions/table-assertion'
import { applicationGlobalStateLabel, applicationLocalStateLabel, applicationStateLabel } from '../components/labels'
import { dump, findByRole, getByRole, render } from '@/tests/testing-library'
import { getTestStore } from '@/tests/utils/get-test-store'
import { JotaiStore } from '@/features/common/data/types'
import { AppClient } from '@algorandfoundation/algokit-utils/types/app-client'
import { AlgoAmount } from '@algorandfoundation/algokit-utils/types/amount'
import { OnApplicationComplete } from 'algosdk'

describe('application-page on localnet', () => {
  describe('when the application that has a global state that is a big int', () => {
    const localnet = algorandFixture()
    let myStore: JotaiStore
    let appId: ApplicationId
    let appClient: AppClient

    beforeEach(() => {
      vitest.clearAllMocks()
    })

    beforeEach(localnet.newScope, 10e6)
    afterEach(() => {
      vitest.clearAllMocks()
    })

    beforeEach(async () => {
      myStore = getTestStore()
      const { app, client } = await deploySmartContract(
        localnet.context.testAccount,
        localnet.algorand,
        myStore,
        Arc32TestContractAppSpec as AppSpec
      )
      appId = app.appId
      appClient = client
    })

    it('should be rendered with ABI decoded global state', async () => {
      vi.mocked(useParams).mockImplementation(() => ({ applicationId: appId.toString() }))

      return executeComponentTest(
        () => {
          return render(<ApplicationPage />, undefined, myStore)
        },
        async (component) => {
          const globalStateTab = await component.findByRole('tabpanel', {
            name: applicationGlobalStateLabel,
          })
          await tableAssertion({
            container: globalStateTab,
            rows: [{ cells: ['global_state_big_int', 'TypeKeyValue"global_state_big_int"', '33399922244455501'] }],
          })
        }
      )
    })

    it('should be rendered with ABI decoded local state', async () => {
      vi.mocked(useParams).mockImplementation(() => ({ applicationId: appId.toString() }))
      const myAccount = await localnet.context.generateAccount({ initialFunds: AlgoAmount.Algo(1) })

      await appClient.send.call({
        method: 'set_local',
        sender: myAccount,
        onComplete: OnApplicationComplete.OptInOC,
      })

      return executeComponentTest(
        () => {
          return render(<ApplicationPage />, undefined, myStore)
        },
        async (component, user) => {
          const applicationStateTabList = await component.findByRole('tablist', { name: applicationStateLabel })
          expect(applicationStateTabList).toBeTruthy()

          await user.click(getByRole(applicationStateTabList, 'tab', { name: applicationLocalStateLabel }))
          const localStateTab = await component.findByRole('tabpanel', { name: applicationLocalStateLabel })

          const addressInput = await findByRole(localStateTab, 'textbox', { name: 'local-state-address' })
          await user.type(addressInput, myAccount.addr.toString())

          dump(component)

          await tableAssertion({
            container: localStateTab,
            rows: [{ cells: ['local_state_big_int', 'TypeKeyValue"local_state_big_int"', '33399922244455501'] }],
          })
        }
      )
    })
  })
})
