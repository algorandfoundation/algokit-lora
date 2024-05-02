import { Card, CardContent } from '@/features/common/components/card'
import { cn } from '@/features/common/utils'
import { Asset } from '../models'
import { assetMetadataLabel } from './labels'
import { useMemo } from 'react'
import { isDefined } from '@/utils/is-defined'
import { DescriptionList } from '@/features/common/components/description-list'

type Props = {
  asset: Asset
}

export function AssetMetadata({ asset }: Props) {
  const items = useMemo(() => {
    const metadataStandards = asset.metadata.map((m) => m.standard)

    if ((metadataStandards.includes('ARC-3') || metadataStandards.includes('ARC-19')) && !metadataStandards.includes('ARC-69')) {
      // If the asset follows ARC-3 or ARC-19, but not ARC-69
      // we display ARC-3 metadata
      const metadata = asset.metadata.find((m) => m.standard === 'ARC-3' || m.standard === 'ARC-19')!
      const supportedKeys = [
        'name',
        'decimals',
        'description',
        'image',
        'image_integrity',
        'image_mimetype',
        'background_color',
        'external_url',
        'external_url_integrity',
        'external_url_mimetype',
        'animation_url',
        'animation_url_integrity',
        'animation_url_mimetype',
        'extra_metadata',
      ]

      return getDescriptionListItems(metadata, supportedKeys)
    }

    if (metadataStandards.includes('ARC-69')) {
      const metadata = asset.metadata.find((m) => m.standard === 'ARC-69')!

      const supportedKeys = ['description', 'external_url', 'media_url', 'mime_type']
      return getDescriptionListItems(metadata, supportedKeys)
    }

    return []
  }, [asset])

  return (
    <Card className={cn('p-4')}>
      <CardContent className={cn('text-sm space-y-2')}>
        <h1 className={cn('text-2xl text-primary font-bold')}>{assetMetadataLabel}</h1>
        <DescriptionList items={items} />
      </CardContent>
    </Card>
  )
}

const getDescriptionListItems = (metadata: Record<string, unknown>, supportedKeys: string[]): { dt: string; dd: string | number }[] => {
  return supportedKeys
    .map((key) => {
      if (metadata[key] === undefined) {
        return undefined
      }

      return {
        dt: humanisePropertyKey(key),
        dd: metadata[key] as string | number, // Force type assertion because we only support string/number keys
      }
    })
    .filter(isDefined)
}

const humanisePropertyKey = (key: string): string => {
  const upperCaseFirstWord = (str: string): string => {
    return str.charAt(0).toUpperCase() + str.slice(1)
  }

  const chunks = key.split('_')
  return chunks.map(upperCaseFirstWord).join(' ')
}
