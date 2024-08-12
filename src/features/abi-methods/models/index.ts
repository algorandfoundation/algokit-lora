export enum AbiType {
  String = 'string',
  Number = 'number',
  Boolean = 'boolean',
  Address = 'address',
  Array = 'array',
  Tuple = 'tuple',
  Account = 'account',
  Transaction = 'transaction',
  Application = 'application',
  Asset = 'asset',
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

export type AbiTupleRender = {
  type: AbiType.Tuple
  values: AbiValueRender[]
  multiLine: boolean
  length: number
}
export type AbiArrayRender = {
  type: AbiType.Array
  values: AbiValueRender[]
  multiLine: boolean
  length: number
}
export type AbiValueRender =
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
  | AbiTupleRender
  | AbiArrayRender
export type AbiMethodArgumentRender =
  | ({ name: string; multiLine: boolean; length: number } & AbiValueRender)
  | ({ name: string; multiLine: boolean; length: number } & AbiReferenceValue)
  | ({ name: string; multiLine: boolean; length: number } & AbiTransactionValue)
