import { Card, CardContent } from '@/features/common/components/card'
import { cn } from '@/features/common/utils'
import { AssetWithMetadata } from '../models'
import { assetTraitsLabel } from './labels'
import { useMemo } from 'react'
import { DescriptionList } from '@/features/common/components/description-list'

type Props = {
  asset: AssetWithMetadata
}

export function AssetTraits({ asset }: Props) {
  const traits = useMemo<Record<string, string>>(() => {
    return asset.metadata.reduce((acc, metadata) => {
      return {
        ...acc,
        ...metadata.properties,
      }
    }, {})
  }, [asset.metadata])
  const items = useMemo(() => {
    return Object.entries(traits).map(([key, value]) => {
      return {
        dt: key,
        dd: value,
      }
    })
  }, [traits])

  if (items.length === 0) {
    return null
  }

  return (
    <Card className={cn('p-4')}>
      <CardContent className={cn('text-sm space-y-2')}>
        <h1 className={cn('text-2xl text-primary font-bold')}>{assetTraitsLabel}</h1>
        <DescriptionList items={items} />
      </CardContent>
    </Card>
  )
}
