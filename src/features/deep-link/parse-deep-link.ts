type DeepLinkOptions = {
  networkId: string
  transactionId: string | undefined
}

export const parseDeepLink = (url: string | undefined): DeepLinkOptions | undefined => {
  // we expect the input to be in the form of
  // algokit-explorer://networkId/{networkId}
  // or algokit-explorer://networkId/{networkId}/transaction/{transactionId}
  // or algokit-explorer://networkId/{networkId}/asset/{assetId} (not supported yet)
  // if the url can't be parsed, return undefined
  if (!url) return undefined

  const networkDeepLinkRegex = /(algokit-explorer:\/\/)(network\/)([a-zA-Z0-9]+)/
  const transactionDeepLinkRegex = /(algokit-explorer:\/\/)(network\/)([a-zA-Z0-9]+)(\/transaction\/)([a-zA-Z0-9/-]+)/

  if (transactionDeepLinkRegex.test(url)) {
    const [_, __, ___, networkId, ____, transactionId] = url.match(transactionDeepLinkRegex)!
    return {
      networkId,
      transactionId,
    }
  }
  if (networkDeepLinkRegex.test(url)) {
    const [_, __, ___, networkId] = url.match(networkDeepLinkRegex)!
    return {
      networkId,
      transactionId: undefined,
    }
  }

  return undefined
}
