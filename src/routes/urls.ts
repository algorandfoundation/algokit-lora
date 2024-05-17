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
  BoxName: 'boxName:string',
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
      ById: UrlTemplate`/${UrlParams.Round}`.extend({
        Group: UrlTemplate`/group`.extend({
          ById: UrlTemplate`/${UrlParams.GroupId}`,
        }),
      }),
    }),
    Account: UrlTemplate`/account`.extend({
      ById: UrlTemplate`/${UrlParams.Address}`,
    }),
    Asset: UrlTemplate`/asset`.extend({
      ById: UrlTemplate`/${UrlParams.AssetId}`,
    }),
    Application: UrlTemplate`/application`.extend({
      ById: UrlTemplate`/${UrlParams.ApplicationId}`.extend({
        Box: UrlTemplate`/box`.extend({
          ById: UrlTemplate`/${UrlParams.BoxName}`,
        }),
      }),
    }),
  }),
  AppStudio: UrlTemplate`/app-studio`,
}
