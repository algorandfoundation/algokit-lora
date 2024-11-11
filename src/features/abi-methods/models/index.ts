import { AddressOrNfd } from '@/features/transaction-wizard/models'

export enum DecodedAbiType {
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
export type DecodedAbiTuple = { type: DecodedAbiType.Tuple; values: DecodedAbiValue[] } & RepresentationProps

export type DecodedAbiArray = { type: DecodedAbiType.Array; values: DecodedAbiValue[] } & RepresentationProps

export type DecodedAbiStructFieldValue = DecodedAbiValue | DecodedAbiStructField[]
export type DecodedAbiStructField = {
  name: string
  value: DecodedAbiStructFieldValue
} & RepresentationProps
export type DecodedAbiStruct = {
  type: DecodedAbiType.Struct
  fields: DecodedAbiStructField[]
} & RepresentationProps

export type DecodedAbiValue =
  | ({
      type: DecodedAbiType.String
      value: string
    } & RepresentationProps)
  | ({
      type: DecodedAbiType.Uint
      value: bigint
    } & RepresentationProps)
  | ({
      type: DecodedAbiType.Byte
      value: number
    } & RepresentationProps)
  | ({
      type: DecodedAbiType.Ufixed
      value: string
    } & RepresentationProps)
  | ({
      type: DecodedAbiType.Boolean
      value: boolean
    } & RepresentationProps)
  | ({
      type: DecodedAbiType.Address
      value: string
    } & RepresentationProps)
  | DecodedAbiArray
  | DecodedAbiTuple

export type DecodedAbiReference =
  | ({ type: DecodedAbiType.Account; value: string } & RepresentationProps)
  | ({ type: DecodedAbiType.Application; value: number } & RepresentationProps)
  | ({ type: DecodedAbiType.Asset; value: number } & RepresentationProps)

export type DecodedAbiTransaction = { type: DecodedAbiType.Transaction; value: string } & RepresentationProps

export type DecodedAbiMethodArgument =
  | ({ name: string } & DecodedAbiValue)
  | ({ name: string } & DecodedAbiStruct)
  | ({ name: string } & DecodedAbiReference)
  | ({ name: string } & DecodedAbiTransaction)

export type DecodedAbiMethodReturn = DecodedAbiValue | 'void' | DecodedAbiStruct

export type DecodedAbiMethod = {
  name: string
  multiline: boolean
  arguments: DecodedAbiMethodArgument[]
  return: DecodedAbiMethodReturn
}

export type DynamicArrayFormItemValue = {
  id: string
  child: FormItemValue
}

export type FormItemValue = string | boolean | bigint | number | AddressOrNfd | FormItemValue[] | DynamicArrayFormItemValue[]
