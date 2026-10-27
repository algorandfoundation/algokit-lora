import { describe, expect, it } from 'vitest'
import { ZERO_ADDRESS } from '@/features/common/constants'
import { getAssetUrlHref } from './get-asset-url-href'
import { ipfsGatewayUrl, replaceIpfsWithGatewayIfNeeded } from './replace-ipfs-with-gateway-if-needed'

const reserve = 'AEAQCAIBAEAQCAIBAEAQCAIBAEAQCAIBAEAQCAIBAEAQCAIBAEA5RCDXMI'
const olderReserve = 'AIBAEAQCAIBAEAQCAIBAEAQCAIBAEAQCAIBAEAQCAIBAEAQCAIBMXPWWNQ'
const template = 'template-ipfs://{ipfscid:0:dag-pb:reserve:sha2-256}'
const cid = 'QmNQa1FSTXNHmrjjfgUW3Px3Vkke4oKiFWdigWkYSux2Pi'

describe('getAssetUrlHref', () => {
  it('resolves CID v0 using the current reserve', () => {
    expect(getAssetUrlHref(template, reserve)).toBe(`${ipfsGatewayUrl}${cid}`)
    expect(getAssetUrlHref(template, olderReserve)).toBe(`${ipfsGatewayUrl}QmNUVJPjvXxb55spvBuoNKEvGWzoGzzmwLC8MAovVWhMiR`)
  })

  it('resolves CID v1 raw and removes the ARC-3 marker', () => {
    expect(
      getAssetUrlHref(
        'template-ipfs://{ipfscid:1:raw:reserve:sha2-256}#arc3',
        'AEAQCAIBAEAQCAIBAEAQCAIBAEAQCAIBAEAQCAIBAEAQCAIBAEA5RCDXMI'
      )
    ).toBe(`${ipfsGatewayUrl}bafkreiabaeaqcaibaeaqcaibaeaqcaibaeaqcaibaeaqcaibaeaqcaibae`)
  })

  it('preserves a metadata path, query and fragment', () => {
    expect(getAssetUrlHref(`${template}/metadata.json?lang=en#section`, reserve)).toBe(
      `${ipfsGatewayUrl}${cid}/metadata.json?lang=en#section`
    )
  })

  it.each([undefined, '', ZERO_ADDRESS, 'invalid-address'])('returns no link for an unusable reserve: %s', (address) => {
    expect(getAssetUrlHref(template, address)).toBeUndefined()
  })

  it.each([
    'template-ipfs://invalid',
    'template-ipfs://{ipfscid:0:dag-pb:manager:sha2-256}',
    'template-ipfs://{ipfscid:0:raw:reserve:sha2-256}',
    'template-ipfs://{ipfscid:1:unknown:reserve:sha2-256}',
    'template-ipfs://{ipfscid:1:raw:reserve:sha2-512}',
  ])('returns no link for an invalid template: %s', (url) => {
    expect(getAssetUrlHref(url, reserve)).toBeUndefined()
  })

  it.each([
    [`ipfs://${cid}#arc3`, `${ipfsGatewayUrl}${cid}#arc3`],
    ['https://example.com/metadata.json', 'https://example.com/metadata.json'],
    ['http://example.com/metadata.json', 'http://example.com/metadata.json'],
    ['example.com/metadata.json', 'https://example.com/metadata.json'],
    ['https://example.com/?uri=ipfs://CID', 'https://example.com/?uri=ipfs://CID'],
  ])('preserves ordinary URL behavior: %s', (url, expected) => {
    expect(getAssetUrlHref(url, undefined)).toBe(expected)
  })
})

describe('replaceIpfsWithGatewayIfNeeded', () => {
  it('only replaces a leading IPFS scheme', () => {
    expect(replaceIpfsWithGatewayIfNeeded(template)).toBe(template)
    expect(replaceIpfsWithGatewayIfNeeded('https://example.com/?uri=ipfs://CID')).toBe('https://example.com/?uri=ipfs://CID')
    expect(replaceIpfsWithGatewayIfNeeded(`ipfs://${cid}/metadata.json`)).toBe(`${ipfsGatewayUrl}${cid}/metadata.json`)
  })
})
