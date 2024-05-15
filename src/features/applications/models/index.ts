export type ApplicationId = number

export type Application = {
  id: ApplicationId
  account: string
  creator: string
  globalStateSchema?: ApplicationStateSchema
  localStateSchema?: ApplicationStateSchema
  approvalProgram: string
  clearStateProgram: string
  globalState: Map<string, ApplicationGlobalStateValue>
  // TODO: PD - boxes state
  // TODO: PD - ARC2 app stuff
}

export type ApplicationStateSchema = {
  numByteSlice: number
  numUint: number
}

export type ApplicationGlobalStateValue =
  | {
      type: ApplicationGlobalStateType.Bytes
      value: string
    }
  | {
      type: ApplicationGlobalStateType.Uint
      value: number | bigint
    }

export enum ApplicationGlobalStateType {
  Bytes = 'Bytes',
  Uint = 'Uint',
}
