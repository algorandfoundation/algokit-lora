import { Asset, AssetMediaType } from '../models'
import { Card, CardContent } from '@/features/common/components/card'
import { assetMediaLabel } from '@/features/assets/components/labels'

type Props = {
  asset: Asset
}

export function AssetMedia({ asset }: Props) {
  return asset.media ? (
    <Card aria-label={assetMediaLabel}>
      <CardContent className={'flex w-full justify-center md:aspect-square md:w-44'}>
        {asset.media.type === AssetMediaType.Image && <img className="size-full object-cover" src={asset.media.url} alt={asset.name} />}
        {asset.media.type === AssetMediaType.Video && (
          <video className="size-full object-cover" title={asset.name} autoPlay playsInline loop controls muted>
            <source src={asset.media.url} type="video/mp4" />
          </video>
        )}
      </CardContent>
    </Card>
  ) : undefined
}
