export enum AbiType {
  String = 'String',
  Uint = 'Uint',
  Byte = 'Byte',
  Ufixed = 'Ufixed',
  Boolean = 'Boolean',
  Address = 'Address',
  Array = 'Array',
  Tuple = 'Tuple',
  Account = 'Account',
  Transaction = 'Transaction',
  Application = 'Application',
  Asset = 'Asset',
  Struct = 'Struct',
}

type RepresentationProps = {
  multiline: boolean
  length: number
}
export type AbiTupleValue = { type: AbiType.Tuple; values: AbiValue[] } & RepresentationProps
export type AbiArrayValue = { type: AbiType.Array; values: AbiValue[] } & RepresentationProps
export type AbiStructValue = {
  type: AbiType.Struct
  values: {
    name: string
    value: AbiValue
  }[]
} & RepresentationProps
export type AbiValue =
  | ({
      type: AbiType.String
      value: string
    } & RepresentationProps)
  | ({
      type: AbiType.Uint
      value: bigint
    } & RepresentationProps)
  | ({
      type: AbiType.Byte
      value: number
    } & RepresentationProps)
  | ({
      type: AbiType.Ufixed
      value: string
    } & RepresentationProps)
  | ({
      type: AbiType.Boolean
      value: boolean
    } & RepresentationProps)
  | ({
      type: AbiType.Address
      value: string
    } & RepresentationProps)
  | AbiArrayValue
  | AbiTupleValue
  | AbiStructValue

export type AbiReferenceValue =
  | ({ type: AbiType.Account; value: string } & RepresentationProps)
  | ({ type: AbiType.Application; value: number } & RepresentationProps)
  | ({ type: AbiType.Asset; value: number } & RepresentationProps)

export type AbiTransactionValue = { type: AbiType.Transaction; value: string } & RepresentationProps

export type AbiMethodArgument =
  | ({ name: string } & AbiValue)
  | ({ name: string } & AbiReferenceValue)
  | ({ name: string } & AbiTransactionValue)

export type AbiMethodReturn = AbiValue | 'void'

export type AbiMethod = {
  name: string
  multiline: boolean
  arguments: AbiMethodArgument[]
  return: AbiMethodReturn
}
