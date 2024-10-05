import { splatParamName, UrlTemplate } from './url-template'

export type UrlParameterValue = `${string}:${string}`

export const UrlParams = {
  TransactionId: 'transactionId:string',
  GroupId: 'groupId:string',
  Round: 'round:string',
  Address: 'address:string',
  AssetId: 'assetId:string',
  ApplicationId: 'applicationId:string',
  NetworkId: 'networkId:string',
  Splat: `${splatParamName}:string`,
} as const satisfies Record<string, UrlParameterValue>

const strippableUrlParams = Object.values(UrlParams)
  .map((param) => `:${param.replace(':string', '')}`)
  .concat('*')

export const stripUrlParams = (url: string) => {
  return strippableUrlParams.reduce((acc, param) => {
    return acc.replace(`/${param}`, '')
  }, url)
}

export const Urls = {
  Index: UrlTemplate`/`,
  Explore: UrlTemplate`/${UrlParams.NetworkId}`.extend({
    Transaction: UrlTemplate`/transaction`.extend({
      ById: UrlTemplate`/${UrlParams.TransactionId}`.extend({
        Inner: UrlTemplate`/inner`.extend({
          ById: UrlTemplate`/${UrlParams.Splat}`,
        }),
      }),
    }),
    Tx: UrlTemplate`/tx/*`,
    Txn: UrlTemplate`/txn/*`,
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
  AppLab: UrlTemplate`/app-lab`,
  Settings: UrlTemplate`/settings`,
  Fund: UrlTemplate`/fund`,
  FundAuthCallback: UrlTemplate`/fund/auth-callback`, // This is intentionally not a nested route, as there is no need
  TransactionWizard: UrlTemplate`/transaction-wizard`,
  TxWizard: UrlTemplate`/tx-wizard`,
  TxnWizard: UrlTemplate`/txn-wizard`,
}
