import { cn } from '@/features/common/utils'
import { Arc19Asset, Arc3Asset } from '../models'

type Props = {
  asset: Arc3Asset | Arc19Asset
}

export function Arc3Media({ asset }: Props) {
  return (
    <div>
      {asset.metadata.image && <img src={asset.metadata.image} alt={asset.name} className={cn('w-32 h-32')} />}
      {asset.metadata.animationUrl && (
        <video title={asset.name} autoPlay playsInline loop controls muted>
          <source src={asset.metadata.animationUrl} type="video/mp4" />
        </video>
      )}
    </div>
  )
}
