import { ApplicationId } from '@/features/applications/data/types'
import { StructDefinition } from '@/features/applications/models'
import { AssetId } from '@/features/assets/data/types'
import { AddressOrNfd } from '@/features/transaction-wizard/models'
import { AVMType } from '@algorandfoundation/algokit-utils/types/app-arc56'
import algosdk from 'algosdk'

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
  | ({ type: DecodedAbiType.Application; value: ApplicationId } & RepresentationProps)
  | ({ type: DecodedAbiType.Asset; value: AssetId } & RepresentationProps)

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
  child: AbiFormItemValue
}

export type AbiFormItemValue = string | boolean | bigint | number | AddressOrNfd | AbiFormItemValue[] | DynamicArrayFormItemValue[]

export type AvmValue = bigint | string

export enum DecodedAvmType {
  String = 'String',
  Uint = 'Uint',
  Bytes = 'Bytes',
}

export type DecodedAvmValue =
  | {
      type: DecodedAvmType.Uint
      value: bigint
    }
  | {
      type: DecodedAvmType.String | DecodedAvmType.Bytes
      value: string
    }

export type DecodedAbiStorageValue =
  | {
      avmType: AVMType
      value: DecodedAvmValue
    }
  | {
      abiType: algosdk.ABIType
      value: DecodedAbiValue
    }
  | {
      abiType: algosdk.ABIType
      struct: StructDefinition
      value: DecodedAbiStruct
    }

export enum DecodedAbiStorageKeyType {
  Key = 'Key',
  MapKey = 'Map Key',
}

export type DecodedAbiStorageKey = {
  name: string
  prefix?: string
  type: DecodedAbiStorageKeyType
} & DecodedAbiStorageValue
