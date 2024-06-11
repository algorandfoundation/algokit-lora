export const colors = [
  'rgb(126 200 191)',
  'rgb(255, 99, 132)',
  'rgb(54, 162, 235)',
  'rgb(255, 206, 86)',
  'rgb(75, 192, 192)',
  'rgb(153, 102, 255)',
  'rgb(255, 159, 64)',
  'rgb(255, 21, 132)',
  'rgb(123, 159, 199)',
  'rgb(23, 88, 132)',
  'rgb(123, 11, 132)',
  'rgb(11, 132, 132)',
  'rgb(11, 11, 132)',
  'rgb(99, 99, 132)',
]
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
