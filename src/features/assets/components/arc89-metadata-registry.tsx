import { Card, CardContent } from '@/features/common/components/card'
import { cn } from '@/features/common/utils'
import { DescriptionList } from '@/features/common/components/description-list'
import { Badge } from '@/features/common/components/badge'
import { CopyButton } from '@/features/common/components/copy-button'
import { OpenJsonViewDialogButton } from '@/features/common/components/json-view-dialog-button'
import { ApplicationLink } from '@/features/applications/components/application-link'
import type { AssetMetadataRecord } from '@algorandfoundation/asa-metadata-registry-sdk'
import { useMemo } from 'react'
import {
  arc89MetadataRegistryLabel,
  arc89IrreversibleFlagsLabel,
  arc89ReversibleFlagsLabel,
  arc89MetadataHashLabel,
  arc89LastModifiedRoundLabel,
  arc89DeprecatedByLabel,
  arc89IsShortLabel,
  arc89MetadataBodyLabel,
} from './labels'

type Props = {
  arc89Metadata: AssetMetadataRecord
}

const uint8ArrayToHex = (bytes: Uint8Array): string => {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export function Arc89MetadataRegistry({ arc89Metadata }: Props) {
  const metadataHashHex = useMemo(() => uint8ArrayToHex(arc89Metadata.header.metadataHash), [arc89Metadata.header.metadataHash])

  const items = useMemo(() => {
    const result = [
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
            <span className="truncate font-mono text-sm">{metadataHashHex}</span>
            <CopyButton value={metadataHashHex} />
          </div>
        ),
      },
      {
        dt: arc89LastModifiedRoundLabel,
        dd: arc89Metadata.header.lastModifiedRound.toString(),
      },
    ]

    if (arc89Metadata.header.deprecatedBy !== 0n) {
      result.push({
        dt: arc89DeprecatedByLabel,
        dd: <ApplicationLink applicationId={arc89Metadata.header.deprecatedBy} />,
      })
    }

    result.push({
      dt: arc89MetadataBodyLabel,
      dd: <OpenJsonViewDialogButton json={JSON.stringify(arc89Metadata.json)} />,
    })

    return result
  }, [arc89Metadata, metadataHashHex])

  return (
    <Card>
      <CardContent className={cn('space-y-1')}>
        <h2>{arc89MetadataRegistryLabel}</h2>
        <DescriptionList items={items} />
      </CardContent>
    </Card>
  )
}
