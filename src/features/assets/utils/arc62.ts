import algosdk from 'algosdk'
import { Arc3MetadataResult, Arc62MetadataResult } from '../data/types'
import { executeFundedDiscoveryApplicationCall } from '@/utils/funded-discovery'
import { Getter, Setter } from 'jotai'
import { getApplicationResultAtom } from '@/features/applications/data'
import { readOnlyAtomCache } from '@/features/common/data'

// Checks if the asset metadata has the ARC-62 property in the correct place
// Returns the ARC-62 application ID if present, otherwise undefined
export const getArc62AppId = (asset: Arc3MetadataResult): bigint | undefined => {
  const arc62 = asset?.metadata?.properties?.['arc-62']
  if (!arc62 || typeof arc62 !== 'object' || Array.isArray(arc62)) return undefined

  const appId = (arc62 as Record<string, unknown>)['application-id']
  if (typeof appId === 'number' && Number.isInteger(appId) && appId >= 0) {
    return BigInt(appId)
  }
  if (typeof appId === 'string' && /^\d+$/.test(appId)) {
    return BigInt(appId)
  }

  return undefined
}

type CirculatingSupplyKey = { applicationId: bigint; assetId: bigint }

const fetchArc62CirculatingSupplyAtom = async (
  get: Getter,
  _set: Setter,
  { applicationId, assetId }: CirculatingSupplyKey
): Promise<bigint | undefined> => {
  const app = await get(getApplicationResultAtom(applicationId))
  if (!app) throw new Error(`Application with ID ${applicationId} not found.`)

  const method = algosdk.ABIMethod.fromSignature('arc62_get_circulating_supply(uint64)uint64')
  const res = await executeFundedDiscoveryApplicationCall(method, applicationId, [assetId])

  const returnValue = res?.returns?.[0]?.returnValue
  if (returnValue == null) return undefined
  if (typeof returnValue === 'bigint') return returnValue
  if (typeof returnValue === 'string' || typeof returnValue === 'number') return BigInt(returnValue)
  return undefined
}

const keySelector = ({ applicationId, assetId }: CirculatingSupplyKey) => `${applicationId}:${assetId}`

export const [arc62CirculatingSupplyAtoms, getArc62CirculatingSupplyAtom] = readOnlyAtomCache<
  Parameters<typeof keySelector>,
  ReturnType<typeof keySelector>,
  Promise<bigint | undefined> | bigint | undefined
>(fetchArc62CirculatingSupplyAtom, keySelector)

export const parseArc62Metadata = (metadata: string | number | undefined): Arc62MetadataResult['metadata'] | null => {
  if (!metadata) return null

  if (typeof metadata === 'string') {
    try {
      return JSON.parse(metadata)
    } catch {
      return null
    }
  }

  return null
}
