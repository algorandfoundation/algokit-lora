import { indexer } from '@/features/common/data'
import { AssetResult, TransactionSearchResults } from '@algorandfoundation/algokit-utils/types/indexer'
import { executePaginatedRequest } from '@algorandfoundation/algokit-utils'
import { atom, useAtomValue, useStore } from 'jotai'
import { JotaiStore } from '@/features/common/data/types'
import { atomEffect } from 'jotai-effect'
import { assetWithMetadataAtom } from './core'
import { Arc19Metadata, Arc3Metadata, Arc3MetadataResult, Arc69MetadataResult, AssetWithMetadata } from '../models'
import axios from 'axios'
import { CID, Version } from 'multiformats/cid'
import * as digest from 'multiformats/hashes/digest'
import { sha256 } from 'multiformats/hashes/sha2'
import algosdk from 'algosdk'
import { useMemo } from 'react'
import { AssetIndex } from './types'
import { loadable } from 'jotai/utils'
import { fetchAssetResultAtomBuilder } from './asset'
import { asArc3Metadata, asArc69Metadata, asAsset } from '../mappers'
import { resolveArc3Url } from '../utils/resolve-arc-3-url'
import { base64ToUtf8 } from '@/utils/base64-to-utf8'

const fetchAssetConfigTransactionResults = (assetIndex: AssetIndex) =>
  executePaginatedRequest(
    (response: TransactionSearchResults) => response.transactions,
    (nextToken) => {
      let s = indexer.searchForTransactions().txType('acfg').assetID(assetIndex)
      if (nextToken) {
        s = s.nextToken(nextToken)
      }
      return s
    }
  )

const getAssetMetadata = async (assetResult: AssetResult) => {
  // TODO: handle ARC-16
  if (assetResult.params.url?.includes('#arc3') || assetResult.params.url?.includes('@arc3')) {
    // When the URL contains #arc3 or @arc3, it's an ARC-3/ARC-19
    const metadataUrl = assetResult.params.url.startsWith('template-ipfs://')
      ? getIPFSFromUrlAndReserve(assetResult.params.url, assetResult.params.reserve)?.url
      : resolveArc3Url(assetResult.index, assetResult.params.url)
    if (!metadataUrl) {
      return undefined
    }
    const metadata = (await axios.get<Arc3MetadataResult>(metadataUrl)).data

    const metadataStandard = assetResult.params.url.startsWith('template-ipfs://') ? 'ARC-19' : 'ARC-3'

    // TODO: for ARC3, handle Asset Metadata Hash
    return {
      ...asArc3Metadata(assetResult.index, assetResult.params.url, metadata),
      standard: metadataStandard,
    } as Arc3Metadata | Arc19Metadata
  }

  // Check for ARC-69
  const assetConfigTransactionResults = await fetchAssetConfigTransactionResults(assetResult.index)
  const latestConfigTxn = assetConfigTransactionResults[assetConfigTransactionResults.length - 1]
  if (latestConfigTxn.note) {
    const arc69Metadata = noteToArc69Metadata(latestConfigTxn.note)
    if (arc69Metadata) return arc69Metadata
  }

  return undefined
}

const getAssetWithMetadataAtomBuilder = (store: JotaiStore, assetIndex: AssetIndex) => {
  const syncEffect = atomEffect((get, set) => {
    ;(async () => {
      try {
        const assetMetadata = await get(assetMetadataAtom)
        set(assetWithMetadataAtom, (prev) => {
          return prev.set(assetIndex, assetMetadata)
        })
      } catch (e) {
        // Ignore any errors as there is nothing to sync
      }
    })()
  })

  const assetMetadataAtom = atom(async (get) => {
    const assetMetadataMap = store.get(assetWithMetadataAtom)

    const assetMetadata = assetMetadataMap.get(assetIndex)
    if (assetMetadata) {
      return assetMetadata
    }

    get(syncEffect)

    const fetchAssetResultAtom = fetchAssetResultAtomBuilder(assetIndex)
    const assetResult = await get(fetchAssetResultAtom)

    const asset = asAsset(assetResult)
    const metadata = await getAssetMetadata(assetResult)

    return {
      ...asset,
      metadata,
    } satisfies AssetWithMetadata
  })

  return assetMetadataAtom
}

export const useAssetWithMetadataAtom = (assetIndex: AssetIndex) => {
  const store = useStore()

  return useMemo(() => {
    return getAssetWithMetadataAtomBuilder(store, assetIndex)
  }, [store, assetIndex])
}

export const useLoadableAssetWithMetadataAtom = (assetIndex: AssetIndex) => {
  return useAtomValue(loadable(useAssetWithMetadataAtom(assetIndex)))
}

function getIPFSFromUrlAndReserve(
  templateUrl: string | undefined,
  reserveAddress: string | undefined
): { cid: string; url: string } | undefined {
  // https://github.com/algorandfoundation/ARCs/blob/main/ARCs/arc-0019.md
  const ipfsTemplateUrlMatch = new RegExp(
    /^template-ipfs:\/\/{ipfscid:(?<version>[01]):(?<codec>[a-z0-9-]+):(?<field>[a-z0-9-]+):(?<hash>[a-z0-9-]+)}/
  )

  const match = ipfsTemplateUrlMatch.exec(templateUrl ?? '')
  if (!match) {
    if (templateUrl?.startsWith('template-ipfs://')) {
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

  return {
    cid: cid.toString(),
    url: templateUrl!.replace(match[0], `ipfs://${cid.toString()}`).replace(/#arc3$/, ''),
  }
}

const noteToArc69Metadata = (note: string | undefined) => {
  if (!note) {
    return undefined
  }

  const json = base64ToUtf8(note)
  if (json.match(/^{/) && json.includes('arc69')) {
    const metadataResult = JSON.parse(json) as Arc69MetadataResult
    return asArc69Metadata(metadataResult)
  }
  return undefined
}
