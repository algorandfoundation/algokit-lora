export type AccountSwimlane = {
  type: 'Account'
  address: string
}
export type ApplicationSwimlane = {
  type: 'Application'
  id: number
  addresses: string[]
}
export type AssetSwimlane = {
  type: 'Asset'
  id: string
}
export type Swimlane = AccountSwimlane | ApplicationSwimlane | AssetSwimlane | { type: 'Placeholder' }
