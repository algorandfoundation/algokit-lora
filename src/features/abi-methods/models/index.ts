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
