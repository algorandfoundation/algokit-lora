export enum DeepLinkType {
  Network = 'Network',
  Transaction = 'Transaction',
  AppLab = 'AppLab',
}

type DeepLinkOptions =
  | {
      networkId: string
      transactionId: string
      type: DeepLinkType.Transaction
    }
  | {
      networkId: string
      applicationId: string
      type: DeepLinkType.AppLab
    }
  | {
      type: DeepLinkType.Network
      networkId: string
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
  const appLabDeepLinkRegex = /(algokit-lora:\/\/)([a-zA-Z0-9]+)(\/app-lab\/)(\/application\/)([0-9]+)/

  if (transactionDeepLinkRegex.test(url)) {
    const [_, __, networkId, ___, transactionId] = url.match(transactionDeepLinkRegex)!
    return {
      type: DeepLinkType.Transaction,
      networkId,
      transactionId,
    }
  }
  if (appLabDeepLinkRegex.test(url)) {
    const [_, __, networkId, ___, ____, applicationId] = url.match(appLabDeepLinkRegex)!
    return {
      type: DeepLinkType.AppLab,
      networkId,
      applicationId,
    }
  }
  if (networkDeepLinkRegex.test(url)) {
    const [_, __, networkId] = url.match(networkDeepLinkRegex)!
    return {
      type: DeepLinkType.Network,
      networkId,
    }
  }

  return undefined
}
