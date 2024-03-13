import { UrlTemplate } from './url-template'

export type UrlParameterValue = `${string}:${string}`

export const UrlParams = {
  TransactionId: 'transactionId:string',
} as const satisfies Record<string, UrlParameterValue>

export const Urls = {
  Index: UrlTemplate`/`,
  Feature1: UrlTemplate`/feature-1`,
  Transaction: UrlTemplate`/transaction`.extend({
    ById: UrlTemplate`/${UrlParams.TransactionId}`,
  }),
}
