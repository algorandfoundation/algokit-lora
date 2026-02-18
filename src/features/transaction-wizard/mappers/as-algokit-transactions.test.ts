import { describe, expect, it } from 'vitest'
import { asAppCallTransactionParams, asMethodCallParams } from './as-algokit-transactions'
import { BuildAppCallTransactionResult, BuildMethodCallTransactionResult, BuildableTransactionType } from '../models'
import { asAddressOrNfd } from './as-address-or-nfd'
import { Address } from '@algorandfoundation/algokit-utils'
import { OnApplicationComplete } from '@algorandfoundation/algokit-utils/transact'
import { ABIMethod } from '@algorandfoundation/algokit-utils/abi'

const sender = asAddressOrNfd('IN6X7QLOJB76VTDHWAW43OTBUGAQ22DVYBPNHLLTJ5RVOTFVTCPK3JY6RA')

const baseTransaction = (): BuildAppCallTransactionResult => ({
  id: 'test-id',
  type: BuildableTransactionType.AppCall,
  applicationId: 123n,
  sender,
  onComplete: OnApplicationComplete.NoOp,
  args: ['AQID'],
  fee: {
    setAutomatically: true,
  },
  validRounds: {
    setAutomatically: true,
  },
})

describe('asAppCallTransactionParams', () => {
  it('maps legacy reference fields when unified access references are not provided', () => {
    const transaction: BuildAppCallTransactionResult = {
      ...baseTransaction(),
      accounts: ['ORANGESCU7XMR2TFXSFTOHCUHNP6OYEPIKZW3JZANTCDHVQYMGQFYFIDDA'],
      foreignApps: [456n],
      foreignAssets: [789n],
      boxes: [[123n, 'AQI=']],
    }

    const params = asAppCallTransactionParams(transaction)

    expect(params.accessReferences).toBeUndefined()
    expect(params.accountReferences).toEqual(transaction.accounts)
    expect(params.appReferences).toEqual([456n])
    expect(params.assetReferences).toEqual([789n])
    expect(params.boxReferences).toEqual([{ appId: 123n, name: Uint8Array.from([1, 2]) }])
  })

  it('prefers unified access references and clears legacy fields when both are provided', () => {
    const accessReferences = [
      { address: Address.fromString('ORANGESCU7XMR2TFXSFTOHCUHNP6OYEPIKZW3JZANTCDHVQYMGQFYFIDDA') },
      { appId: 456n },
      { box: { appId: 123n, name: Uint8Array.from([1, 2]) } },
    ]

    const transaction: BuildAppCallTransactionResult = {
      ...baseTransaction(),
      accessReferences,
      accounts: ['ORANGESCU7XMR2TFXSFTOHCUHNP6OYEPIKZW3JZANTCDHVQYMGQFYFIDDA'],
      foreignApps: [456n],
      foreignAssets: [789n],
      boxes: [[123n, 'AQI=']],
    }

    const params = asAppCallTransactionParams(transaction)

    expect(params.accessReferences).toEqual(accessReferences)
    expect(params.accountReferences).toEqual([])
    expect(params.appReferences).toEqual([])
    expect(params.assetReferences).toEqual([])
    expect(params.boxReferences).toEqual([])
  })

  it('maps rejectVersion when provided', () => {
    const transaction: BuildAppCallTransactionResult = {
      ...baseTransaction(),
      rejectVersion: 7,
    }

    const params = asAppCallTransactionParams(transaction)

    expect(params.rejectVersion).toBe(7)
  })

  it('treats an empty unified access list as legacy mode', () => {
    const transaction: BuildAppCallTransactionResult = {
      ...baseTransaction(),
      accessReferences: [],
      accounts: ['ORANGESCU7XMR2TFXSFTOHCUHNP6OYEPIKZW3JZANTCDHVQYMGQFYFIDDA'],
      foreignApps: [456n],
      foreignAssets: [789n],
      boxes: [[123n, 'AQI=']],
    }

    const params = asAppCallTransactionParams(transaction)

    expect(params.accessReferences).toEqual([])
    expect(params.accountReferences).toEqual(transaction.accounts)
    expect(params.appReferences).toEqual([456n])
    expect(params.assetReferences).toEqual([789n])
    expect(params.boxReferences).toEqual([{ appId: 123n, name: Uint8Array.from([1, 2]) }])
  })
})

describe('asMethodCallParams', () => {
  it('maps rejectVersion when provided', async () => {
    const transaction: BuildMethodCallTransactionResult = {
      id: 'method-id',
      type: BuildableTransactionType.MethodCall,
      applicationId: 123n,
      rejectVersion: 7,
      sender,
      methodDefinition: {
        abiMethod: ABIMethod.fromSignature('ping()void'),
      } as BuildMethodCallTransactionResult['methodDefinition'],
      appSpec: {} as BuildMethodCallTransactionResult['appSpec'],
      methodArgs: [],
      onComplete: OnApplicationComplete.NoOp,
      fee: {
        setAutomatically: true,
      },
      validRounds: {
        setAutomatically: true,
      },
    }

    const params = await asMethodCallParams(transaction)

    expect(params.rejectVersion).toBe(7)
  })
})
