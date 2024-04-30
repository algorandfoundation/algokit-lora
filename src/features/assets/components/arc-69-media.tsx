import { Arc69Asset } from '../models'

type Props = {
  asset: Arc69Asset
}

export function Arc69Media({ asset }: Props) {
  return (
    <div>
      {asset.metadata.mimeType?.startsWith('video/') ? (
        <video title={asset.name} autoPlay playsInline loop controls muted>
          <source src={asset.metadata.mediaUrl} type="video/mp4" />
        </video>
      ) : (
        <img src={asset.metadata.mediaUrl} alt={asset.name} />
      )}
    </div>
  )
}
