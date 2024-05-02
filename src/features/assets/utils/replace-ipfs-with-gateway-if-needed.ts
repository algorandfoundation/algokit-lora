export const replaceIpfsWithGatewayIfNeeded = (url: string): string => {
  return url.replace('ipfs://', 'https://ipfs.algonode.xyz/ipfs/')
}
