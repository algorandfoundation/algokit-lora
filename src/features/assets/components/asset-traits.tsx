import { Card, CardContent } from '@/features/common/components/card'
import { cn } from '@/features/common/utils'
import { Asset } from '../models'
import { assetTraitsLabel } from './labels'
import { useMemo } from 'react'
import { DescriptionList } from '@/features/common/components/description-list'

type Props = {
  traits: Asset['traits']
}

export function AssetTraits({ traits }: Props) {
  const items = useMemo(() => {
    return Object.entries(traits ?? {}).map(([key, value]) => {
      return {
        dt: key,
        dd: value,
      }
    })
  }, [traits])

  if (items.length === 0) {
    return undefined
  }

  return (
    <Card>
      <CardContent className={cn('space-y-1')}>
        <h2>{assetTraitsLabel}</h2>
        <DescriptionList items={items} />
      </CardContent>
    </Card>
  )
}
