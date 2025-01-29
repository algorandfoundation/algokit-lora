import { Arc56Contract } from '@algorandfoundation/algokit-utils/types/app-arc56'
import { AppSpec } from '@algorandfoundation/algokit-utils/types/app-spec'
import { AppFactoryDeployParams } from '@algorandfoundation/algokit-utils/types/app-factory'
import { TransactionSignerAccount } from '@algorandfoundation/algokit-utils/types/account'
import { AlgorandClient } from '@algorandfoundation/algokit-utils'
import { Account, Address } from 'algosdk'

export const deploySmartContract = async (
  creator: Address & TransactionSignerAccount & Account,
  algorandClient: AlgorandClient,
  appSpec: string | Arc56Contract | AppSpec,
  params?: AppFactoryDeployParams
) => {
  const appFactory = algorandClient.client.getAppFactory({
    appSpec,
    defaultSender: creator.addr,
  })

  const deployResult = await appFactory.deploy(params ?? {})

  return {
    app: deployResult.result,
    client: deployResult.appClient,
  }
}
