import { describe, expect, it } from 'vitest'
import algosdk from 'algosdk'
import { onCompleteFieldSchema, onCompleteOptions } from './common'

describe('onCompleteOptions for method-call updateApplication', () => {
  const updateApplicationValue = algosdk.OnApplicationComplete.UpdateApplicationOC.toString()

  it('yields a non-empty onComplete list including UpdateApplicationOC when callConfig allows updateApplication', () => {
    const callConfig = {
      call: [algosdk.OnApplicationComplete.UpdateApplicationOC],
      create: [] as algosdk.OnApplicationComplete[],
    }

    // Mirrors method-call-transaction-builder filtering of onCompleteOptions by callConfig.call
    const filtered = onCompleteOptions.filter((option) => {
      return callConfig.call.includes(Number(option.value) as algosdk.OnApplicationComplete)
    })

    expect(filtered.length).toBeGreaterThan(0)
    expect(filtered.map((option) => option.value)).toContain(updateApplicationValue)
    expect(onCompleteFieldSchema.onComplete.parse(updateApplicationValue)).toBe(updateApplicationValue)
  })
})
