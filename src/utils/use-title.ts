import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { ellipseAddress } from './ellipse-address'
import { ellipseId } from './ellipse-id'

export const setTitle = (title: string) => {
  document.title = title
}

export const useTitle = (pagePrefix?: string) => {
  const urlParams = useParams()

  useEffect(() => {
    const currentTitle = document.title
    const pageTitleParams: string[] = []
    if (urlParams.transactionId) {
      pageTitleParams.push(`Txn:${ellipseId(urlParams.transactionId)}`)
    }
    if (urlParams.transactionId && urlParams['*']) {
      pageTitleParams.push(`Inner:${urlParams['*']}`)
    }
    if (urlParams.round) {
      pageTitleParams.push(`Block:${urlParams.round}`)
    }
    if (urlParams?.groupId) {
      pageTitleParams.push(`Group:${ellipseId(urlParams.groupId)}`)
    }
    if (urlParams?.address) {
      pageTitleParams.push(`Acct:${ellipseAddress(urlParams.address)}`)
    }
    if (urlParams?.applicationId) {
      pageTitleParams.push(`App:${urlParams.applicationId}`)
    }
    if (urlParams?.assetId) {
      pageTitleParams.push(`Asset:${urlParams.assetId}`)
    }
    if (urlParams?.networkId) {
      pageTitleParams.push(urlParams.networkId)
    }
    const pageTitle = `Lora${pagePrefix ? ` ${pagePrefix}` : ''} ${pageTitleParams.join(' ')}`
    setTitle(pageTitle)

    return () => {
      setTitle(currentTitle)
    }
  }, [pagePrefix, urlParams])
}
