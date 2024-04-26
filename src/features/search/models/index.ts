export type SearchResult = (
  | {
      type: SearchResultType.Application | SearchResultType.Asset | SearchResultType.Block
      id: number
    }
  | {
      type: SearchResultType.Account | SearchResultType.Transaction
      id: string
    }
) & {
  label: string
  url: string
}

export enum SearchResultType {
  Account = 'Account',
  Application = 'Application',
  Asset = 'Asset',
  Block = 'Block',
  Transaction = 'Transaction',
}
