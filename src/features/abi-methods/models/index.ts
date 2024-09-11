export enum AbiType {
  String = 'String',
  Number = 'Number',
  Boolean = 'Boolean',
  Address = 'Address',
  Array = 'Array',
  Tuple = 'Tuple',
  Account = 'Account',
  Transaction = 'Transaction',
  Application = 'Application',
  Asset = 'Asset',
}

export type AbiTupleValue = { type: AbiType.Tuple; values: AbiValue[] }
export type AbiArrayValue = { type: AbiType.Array; values: AbiValue[] }
export type AbiValue =
  | {
      type: AbiType.String
      value: string
    }
  | {
      type: AbiType.Number
      value: number
    }
  | {
      type: AbiType.Boolean
      value: boolean
    }
  | {
      type: AbiType.Address
      value: string
    }
  | AbiArrayValue
  | AbiTupleValue

export type AbiReferenceValue =
  | { type: AbiType.Account; value: string }
  | { type: AbiType.Application; value: number }
  | { type: AbiType.Asset; value: number }

export type AbiTransactionValue = { type: AbiType.Transaction; value: string }

export type AbiMethodArgument =
  | ({ name: string } & AbiValue)
  | ({ name: string } & AbiReferenceValue)
  | ({ name: string } & AbiTransactionValue)

export type AbiMethodReturn = AbiValue | 'void'

export type AbiMethod = {
  name: string
  arguments: AbiMethodArgument[]
  return: AbiMethodReturn
}

export type AbiTupleRepresentation = {
  type: AbiType.Tuple
  values: AbiValueRepresentation[]
  multiLine: boolean
  length: number
}
export type AbiArrayRepresentation = {
  type: AbiType.Array
  values: AbiValueRepresentation[]
  multiLine: boolean
  length: number
}
export type AbiValueRepresentation =
  | {
      type: AbiType.String
      value: string
      length: number
      multiLine: boolean
    }
  | {
      type: AbiType.Number
      value: number
      length: number
      multiLine: boolean
    }
  | {
      type: AbiType.Boolean
      value: boolean
      length: number
      multiLine: boolean
    }
  | {
      type: AbiType.Address
      value: string
      length: number
      multiLine: boolean
    }
  | AbiTupleRepresentation
  | AbiArrayRepresentation

export type AbiMethodArgumentRepresentation =
  | ({ name: string; multiLine: boolean; length: number } & AbiValueRepresentation)
  | ({ name: string; multiLine: boolean; length: number } & AbiReferenceValue)
  | ({ name: string; multiLine: boolean; length: number } & AbiTransactionValue)

export type AbiMethodReturnRepresentation = 'void' | AbiValueRepresentation

export type AbiMethodRepresentation = {
  name: string
  arguments: AbiMethodArgumentRepresentation[]
  multiLine: boolean
  return: AbiMethodReturnRepresentation
}
