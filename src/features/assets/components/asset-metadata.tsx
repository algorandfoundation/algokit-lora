import { Card, CardContent } from '@/features/common/components/card'
import { cn } from '@/features/common/utils'
import { Asset } from '../models'
import {
  assetMetadataLabel,
  arc89IrreversibleFlagsLabel,
  arc89ReversibleFlagsLabel,
  arc89MetadataHashLabel,
  arc89LastModifiedRoundLabel,
  arc89IsShortLabel,
  arc89MetadataBodyLabel,
  arc89ControllerAppIdLabel,
  arc89CirculatingSupplyLabel,
  arc89BurnedSupplyLabel,
} from './labels'
import { useMemo } from 'react'
import { DescriptionList } from '@/features/common/components/description-list'
import { Badge } from '@/features/common/components/badge'
import { CopyButton } from '@/features/common/components/copy-button'
import { OpenJsonViewDialogLink } from '@/features/common/components/json-view-dialog-button'
import { BlockLink } from '@/features/blocks/components/block-link'
import { ApplicationLink } from '@/features/applications/components/application-link'
import { RenderInlineAsyncAtom } from '@/features/common/components/render-inline-async-atom'
import type { AssetMetadataRecord } from '@algorandfoundation/asa-metadata-registry-sdk'
import { uint8ArrayToBase64 } from '@/utils/uint8-array-to-base64'
import { createAssetCirculatingSupplyAtom } from '../data/circulating-supply'
import { createAssetBurnedSupplyAtom } from '../data/burned-supply'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/features/common/components/tooltip'
import { Info } from 'lucide-react'

type Props = {
  metadata: Asset['metadata']
  arc89Metadata?: AssetMetadataRecord
}

export function AssetMetadata({ metadata, arc89Metadata }: Props) {
  const metadataItems = useMemo(() => {
    return Object.entries(metadata ?? {}).map(([key, value]) => {
      return {
        dt: humanisePropertyKey(key),
        dd: value,
      }
    })
  }, [metadata])

  const arc89Items = useArc89Items(arc89Metadata)

  const allItems = useMemo(() => [...metadataItems, ...arc89Items], [metadataItems, arc89Items])

  if (allItems.length === 0) {
    return undefined
  }

  return (
    <Card>
      <CardContent className={cn('space-y-1')}>
        <h2>{assetMetadataLabel}</h2>
        <DescriptionList items={allItems} />
      </CardContent>
    </Card>
  )
}

function useArc89Items(arc89Metadata?: AssetMetadataRecord) {
  const metadataHashBase64 = useMemo(() => (arc89Metadata ? uint8ArrayToBase64(arc89Metadata.header.metadataHash) : ''), [arc89Metadata])
  const metadataJson = useMemo(() => arc89Metadata?.json ?? {}, [arc89Metadata])

  const arc20AppId = useMemo(() => (arc89Metadata?.header.flags.reversible.arc20 ? arc89Metadata.arc20AppId : undefined), [arc89Metadata])

  const arc62AppId = useMemo(() => (arc89Metadata?.header.flags.reversible.arc62 ? arc89Metadata.arc62AppId : undefined), [arc89Metadata])

  const circulatingSupplyAtom = useMemo(
    () => (arc62AppId && arc89Metadata ? createAssetCirculatingSupplyAtom(arc62AppId, arc89Metadata.assetId) : undefined),
    [arc62AppId, arc89Metadata]
  )

  const burnedSupplyAtom = useMemo(
    () => (arc89Metadata?.header.flags.irreversible.burnable ? createAssetBurnedSupplyAtom(arc89Metadata.assetId) : undefined),
    [arc89Metadata]
  )

  return useMemo(() => {
    if (!arc89Metadata) return []

    return [
      {
        dt: arc89IrreversibleFlagsLabel,
        dd: (
          <div className="flex flex-wrap gap-1">
            {arc89Metadata.header.flags.irreversible.arc3 && <Badge variant="outline">ARC-3 Compliant</Badge>}
            {arc89Metadata.header.flags.irreversible.arc89Native && <Badge variant="outline">ARC-89 Native</Badge>}
            {arc89Metadata.header.flags.irreversible.burnable && <Badge variant="outline">Burnable (ARC-54)</Badge>}
            {arc89Metadata.header.flags.irreversible.immutable && <Badge variant="outline">Immutable</Badge>}
            {!arc89Metadata.header.flags.irreversible.arc3 &&
              !arc89Metadata.header.flags.irreversible.arc89Native &&
              !arc89Metadata.header.flags.irreversible.burnable &&
              !arc89Metadata.header.flags.irreversible.immutable && <span className="text-muted-foreground">None</span>}
          </div>
        ),
      },
      {
        dt: arc89ReversibleFlagsLabel,
        dd: (
          <div className="flex flex-wrap gap-1">
            {arc89Metadata.header.flags.reversible.arc20 && <Badge variant="outline">Smart ASA (ARC-20)</Badge>}
            {arc89Metadata.header.flags.reversible.arc62 && <Badge variant="outline">ARC-62 Circulating Supply</Badge>}
            {arc89Metadata.header.flags.reversible.ntt && <Badge variant="outline">Cross-Chain (NTT)</Badge>}
            {!arc89Metadata.header.flags.reversible.arc20 &&
              !arc89Metadata.header.flags.reversible.arc62 &&
              !arc89Metadata.header.flags.reversible.ntt && <span className="text-muted-foreground">None</span>}
          </div>
        ),
      },
      {
        dt: (
          <span className="flex items-center gap-1">
            {arc89IsShortLabel}
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="text-muted-foreground size-4" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">
                  Metadata is short ({'<='} 4096 bytes) and can be read and processed directly by AVM opcodes on-chain (e.g. JSON decoding,
                  hashing, byte manipulation).
                </p>
              </TooltipContent>
            </Tooltip>
          </span>
        ),
        dd: arc89Metadata.header.isShort ? 'Yes' : 'No',
      },
      {
        dt: arc89MetadataHashLabel,
        dd: (
          <div className="flex items-center overflow-hidden">
            <span className="truncate font-mono text-sm">{metadataHashBase64}</span>
            <CopyButton value={metadataHashBase64} />
          </div>
        ),
      },
      {
        dt: arc89LastModifiedRoundLabel,
        dd: <BlockLink round={arc89Metadata.header.lastModifiedRound} />,
      },
      ...(arc20AppId !== undefined
        ? [
            {
              dt: arc89ControllerAppIdLabel,
              dd: <ApplicationLink applicationId={arc20AppId} />,
            },
          ]
        : []),
      ...(circulatingSupplyAtom
        ? [
            {
              dt: arc89CirculatingSupplyLabel,
              dd: (
                <RenderInlineAsyncAtom atom={circulatingSupplyAtom}>
                  {(supply) => <span>{supply !== undefined ? supply.toString() : 'N/A'}</span>}
                </RenderInlineAsyncAtom>
              ),
            },
          ]
        : []),
      ...(burnedSupplyAtom
        ? [
            {
              dt: arc89BurnedSupplyLabel,
              dd: (
                <RenderInlineAsyncAtom atom={burnedSupplyAtom}>
                  {(burned) => <span>{burned !== undefined ? burned.toString() : 'N/A'}</span>}
                </RenderInlineAsyncAtom>
              ),
            },
          ]
        : []),
      ...(Object.keys(metadataJson).length > 0
        ? [
            {
              dt: arc89MetadataBodyLabel,
              dd: <OpenJsonViewDialogLink json={JSON.stringify(metadataJson)} />,
            },
          ]
        : []),
    ]
  }, [arc89Metadata, metadataHashBase64, metadataJson, arc20AppId, circulatingSupplyAtom, burnedSupplyAtom])
}

const humanisePropertyKey = (key: string): string => {
  const upperCaseFirstWord = (str: string): string => {
    return str.charAt(0).toUpperCase() + str.slice(1)
  }

  const chunks = key.split('_')
  return chunks.map(upperCaseFirstWord).join(' ')
}
