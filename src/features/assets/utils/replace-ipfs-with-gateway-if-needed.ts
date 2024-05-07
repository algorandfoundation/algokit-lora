export const replaceIpfsWithGatewayIfNeeded = (url: string): string => {
  return url.replace('ipfs://', 'https://cloudflare-ipfs.com/ipfs/')
}
