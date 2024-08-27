import { AbiType } from '@/features/abi-methods/models'

export type AppInterface = {
  applicationId: number
  name: string
  appSpecs: AppSpec[]
}

export type AppSpec = {
  standard: 'ARC-32'
  roundFirstValid?: number
  roundLastValid?: number
  abiMethods: AbiMethodDefinition[]
}

export type AbiTupleDefinition = { type: AbiType.Tuple; childTypes: AbiTypeDefinition[] }
export type AbiArrayDefinition = { type: AbiType.Array; childType: AbiTypeDefinition }
export type AbiTypeDefinition =
  | {
      type: AbiType.String
    }
  | {
      type: AbiType.Number
    }
  | {
      type: AbiType.Boolean
    }
  | {
      type: AbiType.Address
    }
  | AbiArrayDefinition
  | AbiTupleDefinition

export type AbiReferenceTypeDefinition = { type: AbiType.Account } | { type: AbiType.Application } | { type: AbiType.Asset }

export type AbiTransactionTypeDefinition = { type: AbiType.Transaction }

export type AbiMethodArgumentDefinition =
  | ({ name: string } & AbiTypeDefinition)
  | ({ name: string } & AbiReferenceTypeDefinition)
  | ({ name: string } & AbiTransactionTypeDefinition)

export type AbiMethodReturnDefinition = AbiTypeDefinition | 'void'

export type AbiMethodDefinition = {
  name: string
  arguments: AbiMethodArgumentDefinition[]
  return: AbiMethodReturnDefinition
}
