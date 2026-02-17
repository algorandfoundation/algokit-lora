import { describe, expect, it } from 'vitest'
import { Address } from '@algorandfoundation/algokit-utils'
import {
  AccessReferenceFormRow,
  AccessReferenceFormType,
  toAccessReferences,
  toAccessReferenceRows,
} from './access-reference-form'

describe('access-reference-form mapping', () => {
  const testAddress = 'ORANGESCU7XMR2TFXSFTOHCUHNP6OYEPIKZW3JZANTCDHVQYMGQFYFIDDA'

  it('maps typed rows to unified access references', () => {
    const rows: AccessReferenceFormRow[] = [
      { id: '1', type: AccessReferenceFormType.Account, address: testAddress },
      { id: '2', type: AccessReferenceFormType.App, appId: 10n },
      { id: '3', type: AccessReferenceFormType.Asset, assetId: 20n },
      { id: '4', type: AccessReferenceFormType.Box, boxAppId: 30n, boxName: 'AQI=' },
      { id: '5', type: AccessReferenceFormType.Holding, holdingAddress: testAddress, holdingAssetId: 40n },
      { id: '6', type: AccessReferenceFormType.Locals, localsAddress: testAddress, localsAppId: 50n },
    ]

    const result = toAccessReferences(rows)
    expect(result[0]).toEqual({ address: Address.fromString(testAddress) })
    expect(result[1]).toEqual({ appId: 10n })
    expect(result[2]).toEqual({ assetId: 20n })
    expect(result[3]).toEqual({ box: { appId: 30n, name: Uint8Array.from([1, 2]) } })
    expect(result[4]).toEqual({ holding: { address: Address.fromString(testAddress), assetId: 40n } })
    expect(result[5]).toEqual({ locals: { address: Address.fromString(testAddress), appId: 50n } })
  })

  it('maps access references back to typed rows', () => {
    const refs = [
      { address: Address.fromString(testAddress) },
      { appId: 12n },
      { assetId: 34n },
      { box: { appId: 56n, name: Uint8Array.from([1, 2]) } },
      { holding: { address: Address.fromString(testAddress), assetId: 78n } },
      { locals: { address: Address.fromString(testAddress), appId: 90n } },
    ]

    let nextId = 0
    const rows = toAccessReferenceRows(refs, () => `${++nextId}`)
    expect(rows).toEqual([
      { id: '1', type: AccessReferenceFormType.Account, address: testAddress },
      { id: '2', type: AccessReferenceFormType.App, appId: 12n },
      { id: '3', type: AccessReferenceFormType.Asset, assetId: 34n },
      { id: '4', type: AccessReferenceFormType.Box, boxAppId: 56n, boxName: 'AQI=' },
      { id: '5', type: AccessReferenceFormType.Holding, holdingAddress: testAddress, holdingAssetId: 78n },
      { id: '6', type: AccessReferenceFormType.Locals, localsAddress: testAddress, localsAppId: 90n },
    ])
  })

  it('throws when required row data is missing', () => {
    expect(() => toAccessReferences([{ id: '1', type: AccessReferenceFormType.App }])).toThrow(
      'Access reference 1: Application ID is required'
    )
  })

  it('throws when box name is missing or invalid base64', () => {
    expect(() => toAccessReferences([{ id: '1', type: AccessReferenceFormType.Box, boxAppId: 1n }])).toThrow(
      'Access reference 1: Box Name is required'
    )

    expect(() => toAccessReferences([{ id: '1', type: AccessReferenceFormType.Box, boxAppId: 1n, boxName: '*not-base64*' }])).toThrow(
      'Access reference 1: Box Name must be valid base64'
    )
  })
})
