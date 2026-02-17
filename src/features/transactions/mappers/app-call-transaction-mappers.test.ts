import { describe, it, expect } from 'vitest'
import { mapAccessList } from './app-call-transaction-mappers'
import { AccessListItemType } from '../models'
import { Address } from '@algorandfoundation/algokit-utils'
import { utf8ToUint8Array } from '@/utils/utf8-to-uint8-array'

describe('mapAccessList', () => {
  const testAppId = 12345n
  const testAddress = Address.fromString('ORANGESCU7XMR2TFXSFTOHCUHNP6OYEPIKZW3JZANTCDHVQYMGQFYFIDDA')
  const testAssetId = 67890n

  it('returns empty array when access is undefined', () => {
    const result = mapAccessList(undefined, testAppId)
    expect(result).toEqual([])
  })

  it('returns empty array when access is empty', () => {
    const result = mapAccessList([], testAppId)
    expect(result).toEqual([])
  })

  it('maps account resource ref correctly', () => {
    const result = mapAccessList([{ address: testAddress }], testAppId)
    expect(result).toEqual([
      {
        type: AccessListItemType.Account,
        address: testAddress.toString(),
      },
    ])
  })

  it('maps app resource ref correctly', () => {
    const appId = 99999n
    const result = mapAccessList([{ applicationId: appId }], testAppId)
    expect(result).toEqual([
      {
        type: AccessListItemType.App,
        applicationId: appId,
      },
    ])
  })

  it('maps asset resource ref correctly', () => {
    const result = mapAccessList([{ assetId: testAssetId }], testAppId)
    expect(result).toEqual([
      {
        type: AccessListItemType.Asset,
        assetId: testAssetId,
      },
    ])
  })

  it('maps box resource ref correctly with explicit app', () => {
    const boxAppId = 11111n
    const boxName = utf8ToUint8Array('mybox')
    const result = mapAccessList([{ box: { app: boxAppId, name: boxName } }], testAppId)
    expect(result).toEqual([
      {
        type: AccessListItemType.Box,
        applicationId: boxAppId,
        name: 'bXlib3g=', // base64 of 'mybox'
      },
    ])
  })

  it('maps box resource ref with app=0 to use transaction applicationId', () => {
    const boxName = utf8ToUint8Array('mybox')
    const result = mapAccessList([{ box: { app: 0n, name: boxName } }], testAppId)
    expect(result).toEqual([
      {
        type: AccessListItemType.Box,
        applicationId: testAppId,
        name: 'bXlib3g=', // base64 of 'mybox'
      },
    ])
  })

  it('maps holding resource ref correctly', () => {
    const result = mapAccessList([{ holding: { address: testAddress, asset: testAssetId } }], testAppId)
    expect(result).toEqual([
      {
        type: AccessListItemType.Holding,
        address: testAddress.toString(),
        assetId: testAssetId,
      },
    ])
  })

  it('maps locals resource ref correctly with explicit app', () => {
    const localsAppId = 22222n
    const result = mapAccessList([{ local: { address: testAddress, app: localsAppId } }], testAppId)
    expect(result).toEqual([
      {
        type: AccessListItemType.Locals,
        address: testAddress.toString(),
        applicationId: localsAppId,
      },
    ])
  })

  it('maps locals resource ref with app=0 to use transaction applicationId', () => {
    const result = mapAccessList([{ local: { address: testAddress, app: 0n } }], testAppId)
    expect(result).toEqual([
      {
        type: AccessListItemType.Locals,
        address: testAddress.toString(),
        applicationId: testAppId,
      },
    ])
  })

  it('maps multiple resource refs correctly', () => {
    const result = mapAccessList(
      [{ address: testAddress }, { applicationId: 11111n }, { assetId: testAssetId }],
      testAppId
    )
    expect(result).toHaveLength(3)
    expect(result[0].type).toBe(AccessListItemType.Account)
    expect(result[1].type).toBe(AccessListItemType.App)
    expect(result[2].type).toBe(AccessListItemType.Asset)
  })

  it('maps empty resource ref as quota entry', () => {
    const result = mapAccessList([{}], testAppId)
    expect(result).toEqual([{ type: AccessListItemType.Empty }])
  })
})
