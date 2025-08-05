type Arc62TestCase = {
  name: string
  metadata: Arc3MetadataResult
  expected: boolean
}

const arc62TestCases: Arc62TestCase[] = [
  {
    name: 'Valid ARC-62 with correct application-id key',
    metadata: {
      metadata: { properties: { 'arc-62': { 'application-id': 741524546 } } },
    },
    expected: true,
  },
  {
    name: 'Invalid ARC-62 with typo in key',

    metadata: {
      metadata: { properties: { 'arc-62': { 'applications-id': 741524546 } } },
    },
    expected: false,
  },
  {
    name: 'No arc-62 property in metadata',
    metadata: {
      metadata: { properties: { 'arc-63': { 'application-id': 741524546 } } },
    },
    expected: false,
  },
  {
    name: 'No properties at all',
    metadata: {
      metadata: { properties: {} },
    },
    expected: false,
  },
  {
    name: 'Null metadata',
    metadata: { metadata: {} },
    expected: false,
  },
]
import * as arc62Utils from '@/features/assets/utils/arc62'
import { describe, test, expect } from 'vitest'
import { assetResultMother } from '../object-mother/asset-result'
import { Arc3MetadataResult } from '@/features/assets/data/types'

describe('arc62Utils.isArc62', () => {
  arc62TestCases.forEach(({ name, metadata, expected }) => {
    test(name, () => {
      const assetResult = assetResultMother['testnet-740315456']().build()

      // Extend the assetResult from "asset builder" with the metadata
      const extended = { ...assetResult, metadata: metadata.metadata }

      // Test if the asset, based on the metadata, is recognized as ARC-62 due to its application-id property checked by isArc62()
      expect(arc62Utils.isArc62(extended)).toBe(expected)
    })
  })
})
