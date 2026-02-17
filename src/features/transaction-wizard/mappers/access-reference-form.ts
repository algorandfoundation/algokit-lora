import { Address } from '@algorandfoundation/algokit-utils'
import { ResourceReference } from '@algorandfoundation/algokit-utils/transact'
import { Buffer } from 'buffer'

export enum AccessReferenceFormType {
  Account = 'account',
  App = 'app',
  Asset = 'asset',
  Box = 'box',
  Holding = 'holding',
  Locals = 'locals',
}

export type AccessReferenceFormRow = {
  id: string
  type: AccessReferenceFormType
  address?: string
  appId?: bigint
  assetId?: bigint
  boxAppId?: bigint
  boxName?: string
  holdingAddress?: string
  holdingAssetId?: bigint
  localsAddress?: string
  localsAppId?: bigint
}

const toAddress = (value: string | undefined, field: string, index: number) => {
  if (!value) {
    throw new Error(`Access reference ${index + 1}: ${field} is required`)
  }

  try {
    return Address.fromString(value)
  } catch {
    throw new Error(`Access reference ${index + 1}: ${field} must be a valid address`)
  }
}

const requiredBigInt = (value: bigint | undefined, field: string, index: number) => {
  if (value === undefined) {
    throw new Error(`Access reference ${index + 1}: ${field} is required`)
  }
  return value
}

const requiredBase64Bytes = (value: string | undefined, field: string, index: number) => {
  if (!value) {
    throw new Error(`Access reference ${index + 1}: ${field} is required`)
  }

  try {
    const decoded = Buffer.from(value, 'base64')
    const normalized = decoded.toString('base64').replace(/=+$/, '')
    if (normalized !== value.replace(/=+$/, '')) {
      throw new Error('invalid base64')
    }
    return Uint8Array.from(decoded)
  } catch {
    throw new Error(`Access reference ${index + 1}: ${field} must be valid base64`)
  }
}

export const toAccessReferences = (rows: AccessReferenceFormRow[]): ResourceReference[] => {
  return rows.map((row, index) => {
    switch (row.type) {
      case AccessReferenceFormType.Account:
        return {
          address: toAddress(row.address, 'Address', index),
        } satisfies ResourceReference
      case AccessReferenceFormType.App:
        return {
          appId: requiredBigInt(row.appId, 'Application ID', index),
        } satisfies ResourceReference
      case AccessReferenceFormType.Asset:
        return {
          assetId: requiredBigInt(row.assetId, 'Asset ID', index),
        } satisfies ResourceReference
      case AccessReferenceFormType.Box:
        return {
          box: {
            appId: requiredBigInt(row.boxAppId, 'Box Application ID', index),
            name: requiredBase64Bytes(row.boxName, 'Box Name', index),
          },
        } satisfies ResourceReference
      case AccessReferenceFormType.Holding:
        return {
          holding: {
            address: toAddress(row.holdingAddress, 'Holding Address', index),
            assetId: requiredBigInt(row.holdingAssetId, 'Holding Asset ID', index),
          },
        } satisfies ResourceReference
      case AccessReferenceFormType.Locals:
        return {
          locals: {
            address: toAddress(row.localsAddress, 'Locals Address', index),
            appId: requiredBigInt(row.localsAppId, 'Locals Application ID', index),
          },
        } satisfies ResourceReference
    }
  })
}

export const toAccessReferenceRows = (
  references: ResourceReference[] | undefined,
  idFactory: () => string
): AccessReferenceFormRow[] => {
  if (!references || references.length === 0) {
    return []
  }

  return references.map((reference) => {
    if (reference.address) {
      return {
        id: idFactory(),
        type: AccessReferenceFormType.Account,
        address: reference.address.toString(),
      } satisfies AccessReferenceFormRow
    }
    if (reference.appId !== undefined) {
      return {
        id: idFactory(),
        type: AccessReferenceFormType.App,
        appId: reference.appId,
      } satisfies AccessReferenceFormRow
    }
    if (reference.assetId !== undefined) {
      return {
        id: idFactory(),
        type: AccessReferenceFormType.Asset,
        assetId: reference.assetId,
      } satisfies AccessReferenceFormRow
    }
    if (reference.box) {
      return {
        id: idFactory(),
        type: AccessReferenceFormType.Box,
        boxAppId: reference.box.appId,
        boxName: Buffer.from(reference.box.name).toString('base64'),
      } satisfies AccessReferenceFormRow
    }
    if (reference.holding) {
      return {
        id: idFactory(),
        type: AccessReferenceFormType.Holding,
        holdingAddress: reference.holding.address.toString(),
        holdingAssetId: reference.holding.assetId,
      } satisfies AccessReferenceFormRow
    }
    if (reference.locals) {
      return {
        id: idFactory(),
        type: AccessReferenceFormType.Locals,
        localsAddress: reference.locals.address.toString(),
        localsAppId: reference.locals.appId,
      } satisfies AccessReferenceFormRow
    }

    throw new Error('Unknown access reference type')
  })
}
