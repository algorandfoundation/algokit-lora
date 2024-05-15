export type ApplicationId = number

export type Application = {
  id: ApplicationId
  account: string
  creator: string
  globalStateSchema?: ApplicationStateSchema
  localStateSchema?: ApplicationStateSchema
  approvalProgram: string
  clearStateProgram: string
  // TODO: PD - global states, boxes state
  // TODO: PD - ARC2 app stuff
}

export type ApplicationStateSchema = {
  numByteSlice: number
  numUint: number
}
