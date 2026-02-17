import { describe, expect, it } from 'vitest'
import { mapCommonTransactionProperties } from './transaction-common-properties-mappers'
import { transactionResultBuilder } from '@/tests/builders/transaction-result-builder'

describe('mapCommonTransactionProperties', () => {
  it('includes reject-version in raw JSON when provided on app call', () => {
    const transaction = transactionResultBuilder().appCallTransaction().withRejectVersion(7).build()

    const result = mapCommonTransactionProperties(transaction)
    const parsed = JSON.parse(result.json) as Record<string, unknown>
    const appTxn = parsed['application-transaction'] as Record<string, unknown>

    expect(appTxn).toBeTruthy()
    expect(appTxn['reject-version'] ?? appTxn.rejectVersion).toBe(7)
  })
})
