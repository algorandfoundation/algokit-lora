import { testnetId, useSetSelectedNetwork } from '@/features/network/data'
import { executeFundedDiscoveryApplicationCall } from '@/utils/funded-discovery'
import algosdk from 'algosdk'
import { describe, test, expect } from 'vitest'

type onchainQueryTestCase = {
  name: string
  metadata: any
  expected: boolean
}

const onchainQueryTestCases: onchainQueryTestCase[] = [
  {
    name: 'Query an ARC62 onchain data using arc62 abi method and faucet address',
    metadata: {
      properties: {
        'application-id': 741524546,
        'abi-method': algosdk.ABIMethod.fromSignature('arc62_get_circulating_supply(uint64)uint64'),
        'asset-id': 741524548, // Example asset ID to query
      },
    },
    expected: true,
  },
]

describe('arc62Utils.isArc62', () => {
  onchainQueryTestCases.forEach(({ name, metadata, expected }) => {
    test(name, async () => {
      const result = await executeFundedDiscoveryApplicationCall(metadata.properties['abi-method'], metadata.properties['application-id'], [
        metadata.properties['asset-id'],
      ])

      console.log('result', result)
      // Test if the asset, based on the metadata, is recognized as ARC-62 due to its application-id property checked by isArc62()
      expect(result).toBe(expected)
    })
  })
})
