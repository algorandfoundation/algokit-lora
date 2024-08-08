export enum AbiValueType {
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

export type AbiTupleValue = { type: AbiValueType.Tuple; value: AbiPrimitiveValue[] }
export type AbiArrayValue = { type: AbiValueType.Array; value: AbiPrimitiveValue[] }
export type AbiPrimitiveValue =
  | {
      type: AbiValueType.String
      value: string
    }
  | {
      type: AbiValueType.Number
      value: number
    }
  | {
      type: AbiValueType.Boolean
      value: boolean
    }
  | {
      type: AbiValueType.Address
      value: Uint8Array
    }
  | AbiArrayValue
  | AbiTupleValue

export type AbiReferenceValue =
  | { type: AbiValueType.Account; value: string }
  | { type: AbiValueType.Application; value: number }
  | { type: AbiValueType.Asset; value: number }

export type AbiTransactionValue = { type: AbiValueType.Transaction; value: string }

export type AbiMethodArgument =
  | ({ name: string } & AbiPrimitiveValue)
  | ({ name: string } & AbiReferenceValue)
  | ({ name: string } & AbiTransactionValue)

export type AbiMethodReturn = AbiPrimitiveValue | 'void'

export type AbiMethod = {
  name: string
  arguments: AbiMethodArgument[]
  return: AbiMethodReturn
}
