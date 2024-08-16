import { Schema, Validator } from 'jsonschema'
import Arc32ContractSchema from '@/features/abi-methods/mappers/arc-32-json-schemas/contract.schema.json'
import Arc32AppJsonSchema from '@/features/abi-methods/mappers/arc-32-json-schemas/application.schema.json'
import { Arc32AppSpec } from '../data/types'

export const jsonAsArc32AppSpec = (json: unknown): Arc32AppSpec => {
  const validator = new Validator()
  validator.addSchema(Arc32ContractSchema, '/contract.schema.json')

  const result = validator.validate(json, Arc32AppJsonSchema as unknown as Schema)

  if (!result.valid) throw new Error(result.toString())

  return json as Arc32AppSpec
}
