import { Arc3MetadataResult } from '@/features/assets/data/types'

import algosdk from 'algosdk'
import { describe, test } from 'vitest'

type onchainQueryTestCase = {
  name: string
  metadata: Arc3MetadataResult
  expected: boolean
}

const onchainQueryTestCases: onchainQueryTestCase[] = [
  {
    name: 'Query an ARC62 onchain data using arc62 abi method and faucet address',
    metadata: {
      metadata: {
        'arc-62': {
          'application-id': 741524546,
          'asset-id': 741524548,
          'abi-method': algosdk.ABIMethod.fromSignature('arc62_get_circulating_supply(uint64)uint64'),
        },
      },
    },
    expected: true,
  },
]

// describe('onChainQuery', () => {
//   onchainQueryTestCases.forEach(({ name, metadata, expected }) => {
//     test(name, async () => {
//       // const result = await executeFundedDiscoveryApplicationCall(metadata.metadata['arc-62']['abi-method'])
//       // Test if the asset, based on the metadata, is recognized as ARC-62 due to its application-id property checked by isArc62()
//       // expect(result).toBe(expected)
//     })
//   })
// })
