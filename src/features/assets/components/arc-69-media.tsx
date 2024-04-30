import { cn } from '@/features/common/utils'
import { Arc69Asset } from '../models'

type Props = {
  asset: Arc69Asset
}

export function Arc69Media({ asset }: Props) {
  return (
    <div className={cn('w-32 h-32')}>
      {asset.metadata.mimeType?.startsWith('video/') ? (
        <video title={asset.name} autoPlay playsInline loop controls muted>
          <source src={asset.metadata.mediaUrl ?? asset.url} type="video/mp4" />
        </video>
      ) : (
        <img src={asset.metadata.mediaUrl} alt={asset.name} />
      )}
    </div>
  )
}
