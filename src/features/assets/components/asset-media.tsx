import { cn } from '@/features/common/utils'
import { Asset, AssetMediaType } from '../models'

type Props = {
  asset: Asset
}

export function AssetMedia({ asset }: Props) {
  return asset.media ? (
    <div className={cn('w-32 h-32')}>
      {asset.media.type === AssetMediaType.Image && <img src={asset.media.url} alt={asset.name} />}
      {asset.media.type === AssetMediaType.Video && (
        <video title={asset.name} autoPlay playsInline loop controls muted>
          <source src={asset.media.url} type="video/mp4" />
        </video>
      )}
    </div>
  ) : null
}
