type Arc62TestCase = {
  name: string
  metadata: any
  expected: boolean
}

const arc62TestCases: Arc62TestCase[] = [
  {
    name: 'Valid ARC-62 with correct application-id key',
    metadata: {
      properties: {
        'arc-62': { 'application-id': 741524546 },
      },
    },
    expected: true,
  },
  {
    name: 'Invalid ARC-62 with typo in key',
    metadata: {
      properties: {
        'arc-62': { 'application-ids': 741524546 },
      },
    },
    expected: false,
  },
  {
    name: 'No arc-62 property in metadata',
    metadata: {
      properties: {},
    },
    expected: false,
  },
  {
    name: 'No properties at all',
    metadata: {},
    expected: false,
  },
  {
    name: 'Null metadata',
    metadata: null,
    expected: false,
  },
]
import * as arc62Utils from '@/features/assets/utils/arc62'
import { describe, test, expect } from 'vitest'
import { assetResultMother } from '../object-mother/asset-result'

describe('arc62Utils.isArc62', () => {
  arc62TestCases.forEach(({ name, metadata, expected }) => {
    test(name, () => {
      const assetResult = assetResultMother['testnet-740315456']().build()
      const extended = { ...assetResult, metadata }
      expect(arc62Utils.isArc62(extended)).toBe(expected)
    })
  })
})
