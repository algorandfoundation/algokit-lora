import { Card, CardContent } from '@/features/common/components/card'
import { cn } from '@/features/common/utils'
import { Asset } from '../models'
import { assetMetadataLabel } from './labels'
import { useMemo } from 'react'
import { DescriptionList } from '@/features/common/components/description-list'

type Props = {
  metadata: Asset['metadata']
}

export function AssetMetadata({ metadata }: Props) {
  const items = useMemo(() => {
    return Object.entries(metadata ?? {}).map(([key, value]) => {
      return {
        dt: humanisePropertyKey(key),
        dd: value,
      }
    })
  }, [metadata])

  if (items.length === 0) {
    return undefined
  }

  return (
    <Card>
      <CardContent className={cn('space-y-1')}>
        <h2>{assetMetadataLabel}</h2>
        <DescriptionList items={items} />
      </CardContent>
    </Card>
  )
}

const humanisePropertyKey = (key: string): string => {
  const upperCaseFirstWord = (str: string): string => {
    return str.charAt(0).toUpperCase() + str.slice(1)
  }

  const chunks = key.split('_')
  return chunks.map(upperCaseFirstWord).join(' ')
}
