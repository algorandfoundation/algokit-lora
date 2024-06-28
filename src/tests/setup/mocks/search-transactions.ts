import { Mock, vi } from 'vitest'

type SearchTransactionsMockArgs = {
  nextToken?: string
  limit?: number
}
export class SearchTransactionsMock {
  assetID: Mock
  applicationID: Mock
  do: Mock
  limit: Mock
  nextToken: Mock
  txType: Mock
  address: Mock
  addressRole: Mock
  args: SearchTransactionsMockArgs

  constructor() {
    this.args = {}

    this.assetID = vi.fn().mockReturnThis()
    this.applicationID = vi.fn().mockReturnThis()
    this.limit = vi.fn().mockImplementation((args) => {
      this.args.limit = args
      return this
    })
    this.nextToken = vi.fn().mockImplementation((args) => {
      this.args.nextToken = args
      return this
    })
    this.txType = vi.fn().mockReturnThis()
    this.address = vi.fn().mockReturnThis()
    this.addressRole = vi.fn().mockReturnThis()
    this.do = vi.fn()
  }
}
