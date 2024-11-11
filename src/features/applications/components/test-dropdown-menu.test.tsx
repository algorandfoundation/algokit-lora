import { beforeEach, describe, expect, it } from 'vitest'
import { TestDropDownMenu } from './test-dropdown-menu'
import { executeComponentTest } from '@/tests/test-component'
import { render, waitFor, within } from '@/tests/testing-library'
import { transactionActionsLabel, transactionGroupTableLabel } from '@/features/transaction-wizard/components/labels'
import { setWalletAddressAndSigner } from '@/tests/utils/set-wallet-address-and-signer'
import { algorandFixture } from '@algorandfoundation/algokit-utils/testing'
import { getTestStore } from '@/tests/utils/get-test-store'
import { AppInterfaceEntity, dbConnectionAtom } from '@/features/common/data/indexed-db'
import { upsertAppInterface } from '@/features/app-interfaces/data'
import { AppSpecStandard, Arc32AppSpec } from '@/features/app-interfaces/data/types'
import Arc32TestContractAppSpec from '@/tests/test-app-specs/test-contract.arc32.json'
import { createTimestamp } from '@/features/common/data'

describe('dropdown menu', () => {
  const localnet = algorandFixture()

  beforeEach(localnet.beforeEach, 10e6)

  beforeEach(async () => {
    await setWalletAddressAndSigner(localnet)
  })

  beforeEach(async () => {
    const myStore = getTestStore()
    // await setWalletAddressAndSigner(localnet)
    // const { app } = await deploySmartContract(localnet, Arc32TestContractAppSpec as AppSpec)
    // appId = Number(app.appId)

    const dbConnection = await myStore.get(dbConnectionAtom)
    await upsertAppInterface(dbConnection, {
      applicationId: 3383,
      name: 'test',
      appSpecVersions: [
        {
          standard: AppSpecStandard.ARC32,
          appSpec: Arc32TestContractAppSpec as unknown as Arc32AppSpec,
        },
      ],
      lastModified: createTimestamp(),
    } satisfies AppInterfaceEntity)
  })

  it('renders %i', async () => {
    return executeComponentTest(
      () => {
        return render(<TestDropDownMenu />)
      },
      async (component, user) => {
        await user.click(await component.findByRole('button', { name: 'Open' }))

        await user.click(await component.findByRole('button', { name: 'Close' }))

        const transactionGroupTable = await waitFor(() => component.getByLabelText(transactionGroupTableLabel))
        const foo = await waitFor(() => within(transactionGroupTable).getByRole('button', { name: transactionActionsLabel }))
        await user.click(foo)
        console.log('HERE')
        const menu = await component.findByRole('menu')
        await user.click(await within(menu).findByRole('menuitem', { name: 'Item 1' }))

        expect(1).toBe(1)
      }
    )
  })
})
