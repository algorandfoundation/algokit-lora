import { useEffect } from 'react'
import { useParams } from 'react-router-dom'

const setTitle = (title: string) => {
  document.title = title
}

export const useTitle = (customString?: string) => {
  const urlParams = useParams()
  useEffect(() => {
    const currentTitle = document.title
    let pageTitle = `Lora`
    if (customString) {
      pageTitle += ` ${customString}`
    }
    if (urlParams.transactionId) {
      pageTitle += ` - TxnId:${urlParams.transactionId}`
    }
    if (urlParams.transactionId && urlParams['*']) {
      pageTitle += `, Inner:${urlParams['*']}`
    }
    if (urlParams.round) {
      pageTitle += ` - Block:${urlParams.round}`
    }
    if (urlParams?.groupId) {
      pageTitle += ` - Group:${urlParams.groupId}`
    }
    if (urlParams?.address) {
      pageTitle += ` - Addr:${urlParams.address}`
    }
    if (urlParams?.applicationId) {
      pageTitle += ` - AppId:${urlParams.applicationId}`
    }
    if (urlParams?.assetId) {
      pageTitle += ` - AssetId:${urlParams.assetId}`
    }
    if (urlParams?.networkId) {
      pageTitle += ` - ${urlParams.networkId}`
    }

    setTitle(pageTitle)

    return () => {
      setTitle(currentTitle)
    }
  }, [customString, urlParams])
}
