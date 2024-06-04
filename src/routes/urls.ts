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
} as const satisfies Record<string, UrlParameterValue>

export const Urls = {
  Index: UrlTemplate`/`,
  Explore: UrlTemplate`/explore`.extend({
    Transaction: UrlTemplate`/transaction`.extend({
      ById: UrlTemplate`/${UrlParams.TransactionId}`.extend({
        Inner: UrlTemplate`/inner`.extend({
          ById: UrlTemplate`/${UrlParams.InnerTransactionId}`,
        }),
      }),
    }),
    Block: UrlTemplate`/block`.extend({
      ByRound: UrlTemplate`/${UrlParams.Round}`.extend({
        Group: UrlTemplate`/group`.extend({
          ById: UrlTemplate`/${UrlParams.GroupId}`,
        }),
      }),
    }),
    Account: UrlTemplate`/account`.extend({
      ByAddress: UrlTemplate`/${UrlParams.Address}`,
    }),
    Asset: UrlTemplate`/asset`.extend({
      ById: UrlTemplate`/${UrlParams.AssetId}`,
    }),
    Application: UrlTemplate`/application`.extend({
      ById: UrlTemplate`/${UrlParams.ApplicationId}`,
    }),
  }),
  AppStudio: UrlTemplate`/app-studio`,
  Settings: UrlTemplate`/settings`,
}
