export const getHttpUrlFromIpfs = (url: string): string => {
  return url.replace('ipfs://', 'https://ipfs.algonode.xyz/ipfs/')
}
