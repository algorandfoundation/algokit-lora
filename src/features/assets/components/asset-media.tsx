import { cn } from '@/features/common/utils'
import { Asset } from '../models'
import { useMemo } from 'react'
import { getArc19Url } from '../utils/get-arc-19-url'
import { replaceIpfsWithGatewayIfNeeded } from '../utils/replace-ipfs-with-gateway-if-needed'
import { invariant } from '@/utils/invariant'

type Props = {
  asset: Asset
}

export function AssetMedia({ asset }: Props) {
  const media = useMemo<Media | undefined>(() => {
    const isArc3 = asset.metadata.arc3 ? true : false
    const isArc19 = asset.metadata.arc19 ? true : false
    const isArc69 = asset.metadata.arc69 ? true : false

    if (!isArc3 && !isArc19 && !isArc69) {
      return undefined
    }

    if ((isArc3 || isArc19) && !isArc69) {
      // If the asset follows ARC-3 or ARC-19, but not ARC-69
      // we display the media from the metadata
      const metadata = asset.metadata.arc3 ? asset.metadata.arc3 : asset.metadata.arc19 ? asset.metadata.arc19 : undefined
      invariant(metadata, 'ARC-3 or ARC-19 metadata must be present')
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

    if (isArc69) {
      // If the asset follows ARC-69, we display the media from the asset URL
      // In this scenario, we also support ARC-19 format URLs
      if (!asset.url) {
        return undefined
      }

      const metadata = asset.metadata.arc69
      invariant(metadata, 'ARC-69 metadata must be present')
      const url = asset.url.startsWith('template-ipfs://')
        ? getArc19Url(asset.url, asset.reserve)!
        : replaceIpfsWithGatewayIfNeeded(asset.url)

      return {
        type: metadata.mimeType?.startsWith('video/') ? 'video' : 'image',
        url: url,
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
