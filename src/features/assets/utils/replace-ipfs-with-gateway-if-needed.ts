export const ipfsGatewayUrl = 'https://ipfs.algonode.xyz/ipfs/'

export const replaceIpfsWithGatewayIfNeeded = (url: string): string => {
  return url.replace('ipfs://', ipfsGatewayUrl)
}
