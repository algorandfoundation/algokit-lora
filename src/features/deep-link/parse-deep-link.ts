type DeepLinkOptions = {
  networkId: string
  transactionId: string | undefined
}

export const parseDeepLink = (url: string | undefined): DeepLinkOptions | undefined => {
  // we expect the input to be in the form of
  // algokit-lora://{networkId}
  // or algokit-lora://{networkId}/transaction/{transactionId}
  // or algokit-lora://{networkId}/asset/{assetId} (not supported yet)
  // if the url can't be parsed, return undefined
  if (!url) return undefined

  const networkDeepLinkRegex = /(algokit-lora:\/\/)([a-zA-Z0-9]+)/
  const transactionDeepLinkRegex = /(algokit-lora:\/\/)([a-zA-Z0-9]+)(\/transaction\/)([a-zA-Z0-9/-]+)/

  if (transactionDeepLinkRegex.test(url)) {
    const [_, __, networkId, ___, transactionId] = url.match(transactionDeepLinkRegex)!
    return {
      networkId,
      transactionId,
    }
  }
  if (networkDeepLinkRegex.test(url)) {
    const [_, __, networkId] = url.match(networkDeepLinkRegex)!
    return {
      networkId,
      transactionId: undefined,
    }
  }

  return undefined
}
