import { describe, expect, it } from 'vitest'
import algosdk from 'algosdk'
import { asAppCallTransactionParams, asApplicationUpdateTransactionParams, asMethodCallParams } from './as-algokit-transactions'
import { asAddressOrNfd } from './as-address-or-nfd'
import {
  BuildableTransactionType,
  BuildAppCallTransactionResult,
  BuildApplicationUpdateTransactionResult,
  BuildMethodCallTransactionResult,
} from '../models'

const sender = asAddressOrNfd('IN6X7QLOJB76VTDHWAW43OTBUGAQ22DVYBPNHLLTJ5RVOTFVTCPK3JY6RA')
const automaticFee = { setAutomatically: true }
const automaticValidRounds = { setAutomatically: true }

const appCall = (rejectVersion?: number): BuildAppCallTransactionResult => ({
  id: 'app-call',
  type: BuildableTransactionType.AppCall,
  applicationId: 123n,
  rejectVersion,
  sender,
  onComplete: algosdk.OnApplicationComplete.NoOpOC,
  args: [],
  fee: automaticFee,
  validRounds: automaticValidRounds,
})

describe('asAppCallTransactionParams', () => {
  it('maps the reject version when provided', () => {
    expect(asAppCallTransactionParams(appCall(7)).rejectVersion).toBe(7)
  })

  it('omits the reject version when it is 0, which means no version check', () => {
    expect(asAppCallTransactionParams(appCall(0)).rejectVersion).toBeUndefined()
  })

  it('omits the reject version when not provided', () => {
    expect(asAppCallTransactionParams(appCall()).rejectVersion).toBeUndefined()
  })
})

describe('asApplicationUpdateTransactionParams', () => {
  it('maps the reject version when provided', () => {
    const transaction: BuildApplicationUpdateTransactionResult = {
      id: 'app-update',
      type: BuildableTransactionType.ApplicationUpdate,
      applicationId: 123n,
      rejectVersion: 7,
      sender,
      approvalProgram: 'CoEB',
      clearStateProgram: 'CoEB',
      args: [],
      fee: automaticFee,
      validRounds: automaticValidRounds,
    }

    expect(asApplicationUpdateTransactionParams(transaction).rejectVersion).toBe(7)
  })
})

describe('asMethodCallParams', () => {
  it('maps the reject version when provided', async () => {
    const transaction: BuildMethodCallTransactionResult = {
      id: 'method-call',
      type: BuildableTransactionType.MethodCall,
      applicationId: 123n,
      rejectVersion: 7,
      sender,
      methodDefinition: {
        abiMethod: new algosdk.ABIMethod({ name: 'ping', args: [], returns: { type: 'void' } }),
      } as BuildMethodCallTransactionResult['methodDefinition'],
      appSpec: {} as BuildMethodCallTransactionResult['appSpec'],
      methodArgs: [],
      onComplete: algosdk.OnApplicationComplete.NoOpOC,
      fee: automaticFee,
      validRounds: automaticValidRounds,
    }

    expect((await asMethodCallParams(transaction)).rejectVersion).toBe(7)
  })
})
