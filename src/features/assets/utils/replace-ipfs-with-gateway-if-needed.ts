export const replaceIpfsWithGatewayIfNeeded = (url: string): string => {
  // TODO: NC - change this back to the previous gateway
  return url.replace('ipfs://', 'https://cloudflare-ipfs.com/ipfs/')
}
