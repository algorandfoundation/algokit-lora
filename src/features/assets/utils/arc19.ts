import { CID, Version } from 'multiformats/cid'
import * as digest from 'multiformats/hashes/digest'
import { sha256 } from 'multiformats/hashes/sha2'
import algosdk from 'algosdk'

// If the URL starts with template-ipfs://, it also follows ARC-19
export const isArc19Url = (assetUrl: string) => assetUrl.startsWith('template-ipfs://')

export function getArc19Url(templateUrl: string, reserveAddress: string | undefined): string | undefined {
  // https://github.com/algorandfoundation/ARCs/blob/main/ARCs/arc-0019.md
  const ipfsTemplateUrlMatch = new RegExp(
    /^template-ipfs:\/\/{ipfscid:(?<version>[01]):(?<codec>[a-z0-9-]+):(?<field>[a-z0-9-]+):(?<hash>[a-z0-9-]+)}/
  )

  const match = ipfsTemplateUrlMatch.exec(templateUrl)
  if (!match) {
    if (templateUrl.startsWith('template-ipfs://')) {
      throw new Error(`Invalid ASA URL; unable to parse as IPFS template URL '${templateUrl}'`)
    }
    return undefined
  }

  const { field, codec, hash, version } = match?.groups ?? {}

  if (field !== 'reserve') {
    throw new Error(`Invalid ASA URL; unsupported field '${field}' (expected 'reserve') in IPFS template URL '${templateUrl}'`)
  }
  if (codec !== 'raw' && codec !== 'dag-pb') {
    throw new Error(`Invalid ASA URL; unsupported codec '${codec}' (expected 'raw' or 'dag-pb') in IPFS template URL '${templateUrl}'`)
  }
  if (hash !== 'sha2-256') {
    throw new Error(`Invalid ASA URL; unsupported hash '${hash}' (expected 'sha2-256') in IPFS template URL '${templateUrl}'`)
  }
  if (version != '0' && version != '1') {
    throw new Error(`Invalid ASA URL; unsupported version '${version}' (expected '0' or '1') in IPFS template URL '${templateUrl}'`)
  }

  const hashAlgorithm = sha256
  const publicKey = algosdk.decodeAddress(reserveAddress!).publicKey
  const multihashDigest = digest.create(hashAlgorithm.code, publicKey)

  // https://github.com/TxnLab/arc3.xyz/blob/66334cb31cf46a3b0a466193f351d766df24a16c/src/lib/nft.ts#L68
  const cid = CID.create(parseInt(version) as Version, match?.groups?.codec === 'dag-pb' ? 0x70 : 0x55, multihashDigest)

  const url = templateUrl.replace(match[0], `ipfs://${cid.toString()}`).replace(/#arc3$/, '')

  return url
}
