import { cn } from '@/features/common/utils'
import { Arc3Metadata, Arc69Metadata, Asset, AssetStandard } from '../models'
import { useMemo } from 'react'
import { getArc19Url } from '../utils/get-arc-19-url'
import { replaceIpfsWithGatewayIfNeeded } from '../utils/replace-ipfs-with-gateway-if-needed'

type Props = {
  asset: Asset
}

export function AssetMedia({ asset }: Props) {
  const media = useMemo<Media | undefined>(() => {
    if (asset.metadata.length === 0) {
      return undefined
    }

    const metadataStandards = asset.metadata.map((m) => m.standard)

    if (
      (metadataStandards.includes(AssetStandard.ARC3) || metadataStandards.includes(AssetStandard.ARC19)) &&
      !metadataStandards.includes(AssetStandard.ARC69)
    ) {
      // If the asset follows ARC-3 or ARC-19, but not ARC-69
      // we display the media from the metadata
      const metadata = asset.metadata.find((m) => m.standard === AssetStandard.ARC3 || m.standard === AssetStandard.ARC19) as Arc3Metadata
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

    if (metadataStandards.includes(AssetStandard.ARC69)) {
      // If the asset follows ARC-69, we display the media from the asset URL
      // In this scenario, we also support ARC-19 format URLs
      if (!asset.url) {
        return undefined
      }

      const metadata = asset.metadata.find((m) => m.standard === AssetStandard.ARC69) as Arc69Metadata
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
