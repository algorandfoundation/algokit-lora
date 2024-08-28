import { ApplicationId } from '@/features/applications/data/types'
import { Atom, atom } from 'jotai'
import { getAppInterfaceAtom } from '@/features/app-interfaces/data'
import algosdk from 'algosdk'

export const createApplicationAbiMethodsAtom = (applicationId: ApplicationId): Atom<Promise<algosdk.ABIMethod[]>> => {
  return atom(async (get) => {
    const appInterface = await get(getAppInterfaceAtom(applicationId))
    if (!appInterface || appInterface.appSpecVersions.length === 0) return []

    const latestAppSpec =
      appInterface.appSpecVersions.find((appSpec) => appSpec.roundLastValid === undefined) ??
      appInterface.appSpecVersions.sort((a, b) => b.roundLastValid! - a.roundLastValid!)[0]

    return latestAppSpec.appSpec.contract.methods.map((method) => new algosdk.ABIMethod(method))
  })
}
