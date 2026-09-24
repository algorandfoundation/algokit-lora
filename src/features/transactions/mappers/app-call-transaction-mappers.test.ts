import { describe, expect, it } from 'vitest'
import { atom } from 'jotai'
import { asAppCallTransaction } from './app-call-transaction-mappers'
import { transactionResultBuilder } from '@/tests/builders/transaction-result-builder'
import { AssetSummary } from '@/features/assets/models'
import { GroupResult } from '@/features/groups/data/types'

const assetResolver = () => atom(async () => ({}) as AssetSummary)
const abiMethodResolver = () => atom(async () => undefined)
const groupResolver = () => atom(async () => ({}) as GroupResult)

const appCallResult = (rejectVersion?: number) => {
  const transactionResult = transactionResultBuilder().appCallTransaction().build()
  transactionResult.applicationTransaction!.rejectVersion = rejectVersion
  return transactionResult
}

describe('asAppCallTransaction', () => {
  it('maps the reject version when the transaction has one', () => {
    const transaction = asAppCallTransaction(appCallResult(7), assetResolver, abiMethodResolver, groupResolver)

    expect(transaction.rejectVersion).toBe(7)
  })

  it('leaves the reject version unset when it is 0, which means no version check', () => {
    const transaction = asAppCallTransaction(appCallResult(0), assetResolver, abiMethodResolver, groupResolver)

    expect(transaction.rejectVersion).toBeUndefined()
  })

  it('leaves the reject version unset when the transaction has none', () => {
    const transaction = asAppCallTransaction(appCallResult(), assetResolver, abiMethodResolver, groupResolver)

    expect(transaction.rejectVersion).toBeUndefined()
  })
})
