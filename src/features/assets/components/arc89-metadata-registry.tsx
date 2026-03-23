import { Card, CardContent } from '@/features/common/components/card'
import { cn } from '@/features/common/utils'
import { DescriptionList } from '@/features/common/components/description-list'
import { Badge } from '@/features/common/components/badge'
import { CopyButton } from '@/features/common/components/copy-button'
import { OpenJsonViewDialogLink } from '@/features/common/components/json-view-dialog-button'
import { BlockLink } from '@/features/blocks/components/block-link'
import { ApplicationLink } from '@/features/applications/components/application-link'
import { RenderInlineAsyncAtom } from '@/features/common/components/render-inline-async-atom'
import type { AssetMetadataRecord } from '@algorandfoundation/asa-metadata-registry-sdk'
import { uint8ArrayToBase64 } from '@/utils/uint8-array-to-base64'
import { useMemo } from 'react'
import { createAssetCirculatingSupplyAtom } from '../data/circulating-supply'
import {
  arc89MetadataRegistryLabel,
  arc89IrreversibleFlagsLabel,
  arc89ReversibleFlagsLabel,
  arc89MetadataHashLabel,
  arc89LastModifiedRoundLabel,
  arc89IsShortLabel,
  arc89MetadataBodyLabel,
  arc89ControllerAppIdLabel,
  arc89CirculatingSupplyLabel,
} from './labels'

const getArc3PropertyAppId = (metadataJson: Record<string, unknown>, key: string): bigint | undefined => {
  const properties = metadataJson['properties']
  if (!properties || typeof properties !== 'object' || Array.isArray(properties)) return undefined

  const entry = (properties as Record<string, unknown>)[key]
  if (!entry || typeof entry !== 'object' || Array.isArray(entry)) return undefined

  const appId = (entry as Record<string, unknown>)['application-id']
  if (typeof appId === 'number' && Number.isInteger(appId) && appId > 0) {
    return BigInt(appId)
  }
  if (typeof appId === 'string' && /^\d+$/.test(appId)) {
    return BigInt(appId)
  }

  return undefined
}

const getArc20AppId = (metadataJson: Record<string, unknown>): bigint | undefined => {
  return getArc3PropertyAppId(metadataJson, 'arc-20')
}

const getArc62AppIdFromJson = (metadataJson: Record<string, unknown>): bigint | undefined => {
  return getArc3PropertyAppId(metadataJson, 'arc-62')
}

type Props = {
  arc89Metadata: AssetMetadataRecord
}

export function Arc89MetadataRegistry({ arc89Metadata }: Props) {
  const metadataHashBase64 = useMemo(() => uint8ArrayToBase64(arc89Metadata.header.metadataHash), [arc89Metadata.header.metadataHash])
  const metadataJson = useMemo(() => arc89Metadata.json, [arc89Metadata])

  const arc20AppId = useMemo(
    () => (arc89Metadata.header.flags.reversible.arc20 ? getArc20AppId(metadataJson) : undefined),
    [arc89Metadata, metadataJson]
  )

  const arc62AppId = useMemo(
    () => (arc89Metadata.header.flags.reversible.arc62 ? getArc62AppIdFromJson(metadataJson) : undefined),
    [arc89Metadata, metadataJson]
  )

  const circulatingSupplyAtom = useMemo(
    () => (arc62AppId ? createAssetCirculatingSupplyAtom(arc62AppId, arc89Metadata.assetId) : undefined),
    [arc62AppId, arc89Metadata.assetId]
  )

  const items = useMemo(
    () => [
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
        dt: arc89IsShortLabel,
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
      ...(arc89Metadata.header.deprecatedBy !== 0n
        ? [
            {
              dt: 'Deprecated By',
              dd: <ApplicationLink applicationId={arc89Metadata.header.deprecatedBy} />,
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
    ],
    [arc89Metadata, metadataHashBase64, metadataJson, arc20AppId, circulatingSupplyAtom]
  )

  return (
    <Card>
      <CardContent className={cn('space-y-1')}>
        <h2>{arc89MetadataRegistryLabel}</h2>
        <DescriptionList items={items} />
      </CardContent>
    </Card>
  )
}
