import { UrlTemplate } from './url-template'

export type UrlParameterValue = `${string}:${string}`

export const UrlParams = {
  TransactionId: 'transactionId:string',
  InnerTransactionId: 'innerTransactionId:string',
  GroupId: 'groupId:string',
  Round: 'round:string',
  Address: 'address:string',
  AssetId: 'assetId:string',
  ApplicationId: 'applicationId:string',
  NetworkId: 'networkId:string',
} as const satisfies Record<string, UrlParameterValue>

const transactionUrls = UrlTemplate`/transaction`.extend({
  ById: UrlTemplate`/${UrlParams.TransactionId}`.extend({
    Inner: UrlTemplate`/inner`.extend({
      ById: UrlTemplate`/${UrlParams.InnerTransactionId}`,
    }),
  }),
})
const txUrls = UrlTemplate`/tx/*`
const blockUrls = UrlTemplate`/block`.extend({
  ByRound: UrlTemplate`/${UrlParams.Round}`.extend({
    Group: UrlTemplate`/group`.extend({
      ById: UrlTemplate`/${UrlParams.GroupId}`,
    }),
  }),
})
const accountUrls = UrlTemplate`/account`.extend({
  ByAddress: UrlTemplate`/${UrlParams.Address}`,
})
const assetUrls = UrlTemplate`/asset`.extend({
  ById: UrlTemplate`/${UrlParams.AssetId}`,
})
const applicationUrls = UrlTemplate`/application`.extend({
  ById: UrlTemplate`/${UrlParams.ApplicationId}`,
})
export const Urls = {
  Index: UrlTemplate`/`,
  Transaction: transactionUrls,
  Tx: txUrls,
  Block: blockUrls,
  Account: accountUrls,
  Asset: assetUrls,
  Application: applicationUrls,
  AppStudio: UrlTemplate`/app-studio`,
  Settings: UrlTemplate`/settings`,
  Network: UrlTemplate`/${UrlParams.NetworkId}/`.extend({
    Transaction: transactionUrls,
    Tx: txUrls,
    Block: blockUrls,
    Account: accountUrls,
    Asset: assetUrls,
    Application: applicationUrls,
  }),
}
