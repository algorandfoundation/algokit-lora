import { useEffect } from 'react'
import { useParams } from 'react-router-dom'

const TRUNCATE_LENGTH = 10

export const setTitle = (title: string) => {
  document.title = title
}

export const useTitle = (pagePrefix?: string) => {
  const urlParams = useParams()

  useEffect(() => {
    const currentTitle = document.title
    const pageTitleParams: string[] = []
    if (urlParams.transactionId) {
      pageTitleParams.push(`Txn:${urlParams.transactionId.slice(0, TRUNCATE_LENGTH)}`)
    }
    if (urlParams.transactionId && urlParams['*']) {
      pageTitleParams.push(`Inner:${urlParams['*']}`)
    }
    if (urlParams.round) {
      pageTitleParams.push(`Block:${urlParams.round}`)
    }
    if (urlParams?.groupId) {
      pageTitleParams.push(`Group:${urlParams.groupId.slice(0, TRUNCATE_LENGTH)}`)
    }
    if (urlParams?.address) {
      pageTitleParams.push(`Acct:${urlParams.address.slice(0, TRUNCATE_LENGTH)}`)
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
