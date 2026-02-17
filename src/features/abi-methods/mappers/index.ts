import { Schema, Validator } from 'jsonschema'
import Arc4ContractSchema from '@/features/abi-methods/mappers/arc-4-json-schemas/arc4-contract.schema.json'
import Arc32AppJsonSchema from '@/features/abi-methods/mappers/arc-32-json-schemas/arc32-application.schema.json'
import Arc56JsonSchema from '@/features/abi-methods/mappers/arc-56-json-schemas/arc56.schema.json'
import { Arc32AppSpec, Arc4AppSpec } from '@/features/app-interfaces/data/types'
import { ABIStructType, ABIType, Arc56Contract, AVMType } from '@algorandfoundation/algokit-utils/abi'
import { isArc32AppSpec, isArc4AppSpec, isArc56AppSpec } from '@/features/common/utils'
import { isAVMType } from '@/features/app-interfaces/utils/is-avm-type'

export const jsonAsArc32AppSpec = (json: unknown): Arc32AppSpec => {
  const validator = new Validator()
  validator.addSchema(Arc4ContractSchema, '/arc4-contract.schema.json')
  const result = validator.validate(json, Arc32AppJsonSchema as unknown as Schema)
  if (!result.valid) throw new Error(result.toString())

  const appSpec = json as Arc32AppSpec
  if (!isArc32AppSpec(appSpec)) {
    throw new Error('Invalid ARC-32 app spec')
  }

  return appSpec
}

export const jsonAsArc4AppSpec = (json: unknown): Arc4AppSpec => {
  const validator = new Validator()
  const result = validator.validate(json, Arc4ContractSchema as unknown as Schema)
  if (!result.valid) throw new Error(result.toString())

  const appSpec = json as Arc4AppSpec
  if (!isArc4AppSpec(appSpec)) {
    throw new Error('Invalid ARC-4 app spec')
  }

  return appSpec
}

export const jsonAsArc56AppSpec = (json: unknown): Arc56Contract => {
  const validator = new Validator()
  const result = validator.validate(json, Arc56JsonSchema as unknown as Schema)
  if (!result.valid) throw new Error(result.toString())

  const appSpec = json as Arc56Contract
  if (!isArc56AppSpec(appSpec)) {
    throw new Error('Invalid ARC-56 app spec')
  }

  return appSpec
}

export const asAbiOrAvmType = (appSpec: Arc56Contract, type: string): ABIType | AVMType => {
  if (appSpec.structs[type]) {
    return ABIStructType.fromStruct(type, appSpec.structs).toABITupleType()
  }
  if (isAVMType(type)) {
    return type
  }
  return ABIType.from(type)
}

export * from './form-schema-mappers'
export * from './ufixed-mappers'
export * from './form-item-mappers'
export * from './form-item-value-mappers'
export * from './decoder'
export * from './avm-value'
export * from './storage-value-mappers'
