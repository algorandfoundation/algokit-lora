import { ZERO_ADDRESS } from '@/features/common/constants'
import { getArc19Url, isArc19Url } from './arc19'
import { replaceIpfsWithGatewayIfNeeded } from './replace-ipfs-with-gateway-if-needed'
import { addHttpsSchemeIfNeeded } from './add-https-scheme-if-needed'

export const getAssetUrlHref = (url: string, reserveAddress: string | undefined): string | undefined => {
  if (isArc19Url(url)) {
    if (!reserveAddress || reserveAddress === ZERO_ADDRESS) {
      return undefined
    }
    try {
      const resolvedUrl = getArc19Url(url, reserveAddress)
      return resolvedUrl ? replaceIpfsWithGatewayIfNeeded(resolvedUrl) : undefined
    } catch {
      return undefined
    }
  }
  return addHttpsSchemeIfNeeded(replaceIpfsWithGatewayIfNeeded(url))
}
