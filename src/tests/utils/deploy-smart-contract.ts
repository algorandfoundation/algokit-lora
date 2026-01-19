import { Arc56Contract } from '@algorandfoundation/algokit-utils/abi'
import { AppSpec } from '@algorandfoundation/algokit-utils/types/app-spec'
import { AppFactoryDeployParams } from '@algorandfoundation/algokit-utils/types/app-factory'
import { Address, AlgorandClient } from '@algorandfoundation/algokit-utils'
import { JotaiStore } from '@/features/common/data/types'
import { AppInterfaceEntity, dbConnectionAtom } from '@/features/common/data/indexed-db'
import { upsertAppInterface } from '@/features/app-interfaces/data'
import { AppSpecStandard, Arc32AppSpec } from '@/features/app-interfaces/data/types'
import { createTimestamp } from '@/features/common/data'
import { AddressWithSigners } from '@algorandfoundation/algokit-utils/transact'

export const deploySmartContract = async (
  creator: Address & AddressWithSigners,
  algorandClient: AlgorandClient,
  store: JotaiStore,
  appSpec: Arc56Contract | AppSpec,
  params?: AppFactoryDeployParams
) => {
  const appFactory = algorandClient.client.getAppFactory({
    appSpec,
    defaultSender: creator.addr.toString(),
  })

  // Deploy the app
  const deployment = await appFactory.deploy(params ?? {})

  // Add the app spec as an app interface
  const dbConnection = await store.get(dbConnectionAtom)
  await upsertAppInterface(dbConnection, {
    applicationId: deployment.result.appId,
    name: 'test',
    appSpecVersions: [
      'contract' in appSpec
        ? {
            standard: AppSpecStandard.ARC32,
            appSpec: appSpec as Arc32AppSpec,
          }
        : {
            standard: AppSpecStandard.ARC56,
            appSpec: appSpec as Arc56Contract,
          },
    ],
    lastModified: createTimestamp(),
  } satisfies AppInterfaceEntity)

  return {
    app: deployment.result,
    client: deployment.appClient,
  }
}
