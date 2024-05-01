import { cn } from '@/features/common/utils'
import { AssetWithMetadata } from '../models'
import { useMemo } from 'react'

type Props = {
  asset: AssetWithMetadata
}

export function AssetMedia({ asset }: Props) {
  const media = useMemo<Media | undefined>(() => {
    if (asset.metadata.length === 0) {
      return undefined
    }

    if (asset.metadata.length === 1 && asset.metadata[0].standard === 'ARC-3') {
      const metadata = asset.metadata[0]
      if (metadata.image) {
        return {
          url: metadata.image,
          type: 'image',
        }
      }
      if (metadata.animationUrl) {
        return {
          url: metadata.animationUrl,
          type: 'video',
        }
      }
    }

    if (asset.metadata.length === 1 && asset.metadata[0].standard === 'ARC-19') {
      const metadata = asset.metadata[0]
      if (metadata.image) {
        return {
          url: metadata.image,
          type: 'image',
        }
      }
      if (metadata.animationUrl) {
        return {
          url: metadata.animationUrl,
          type: 'video',
        }
      }
    }

    if (asset.metadata.length === 1 && asset.metadata[0].standard === 'ARC-69') {
      const metadata = asset.metadata[0]
      if (asset.url) {
        return {
          type: metadata.mimeType?.startsWith('video/') ? 'video' : 'image',
          url: asset.url,
        }
      }
    }
  }, [asset])

  return media ? (
    <div className={cn('w-32 h-32')}>
      {media.type === 'image' && <img src={media.url} alt={asset.name} />}
      {media.type === 'video' && (
        <video title={asset.name} autoPlay playsInline loop controls muted>
          <source src={media.url} type="video/mp4" />
        </video>
      )}
    </div>
  ) : null
}

type Media = {
  url: string
  type: 'image' | 'video'
}
