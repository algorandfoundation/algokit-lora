import { Arc56Contract } from '@algorandfoundation/algokit-utils/types/app-arc56'
import { AppSpec } from '@algorandfoundation/algokit-utils/types/app-spec'
import { AlgorandFixture } from '@algorandfoundation/algokit-utils/types/testing'

export const deploySmartContract = async (localnet: AlgorandFixture, appSpec: string | Arc56Contract | AppSpec) => {
  const { testAccount } = localnet.context

  const appFactory = localnet.algorand.client.getAppFactory({
    appSpec: appSpec,
    defaultSender: testAccount.addr,
  })

  const deployResult = await appFactory.deploy({})

  return {
    app: deployResult.result,
    client: deployResult.appClient,
  }
}
